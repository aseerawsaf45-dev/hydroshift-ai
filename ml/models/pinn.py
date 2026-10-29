import torch
import torch.nn as nn

class FourierFeatureMapping(nn.Module):
    """
    High-frequency coordinate mapping to overcome spectral bias in standard MLPs.
    Crucial for capturing sharp tidal/salinity fronts in the PINN.
    """
    def __init__(self, in_features: int, out_features: int, scale: float = 1.0):
        super().__init__()
        # Ensure out_features is even for sin/cos pairs
        assert out_features % 2 == 0, "out_features must be even for Fourier features"
        self.B = nn.Parameter(torch.randn(in_features, out_features // 2) * scale, requires_grad=False)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x is (batch, in_features)
        x_proj = 2.0 * torch.pi * x @ self.B
        return torch.cat([torch.sin(x_proj), torch.cos(x_proj)], dim=-1)

class PINN(nn.Module):
    """
    Physics-Informed Neural Network architecture.
    Takes spatial (x) and temporal (t) coordinates, and outputs state (u).
    """
    def __init__(self, in_features: int = 2, hidden_dim: int = 64, layers: int = 4, fourier_features: int = 64):
        super().__init__()
        self.fourier_features = fourier_features
        if fourier_features > 0:
            self.mapping = FourierFeatureMapping(in_features, fourier_features, scale=10.0)
            current_dim = fourier_features
        else:
            self.mapping = nn.Identity()
            current_dim = in_features
            
        net_layers = []
        for _ in range(layers):
            net_layers.append(nn.Linear(current_dim, hidden_dim))
            net_layers.append(nn.Tanh())
            current_dim = hidden_dim
            
        # Output is scalar (e.g., salinity or WSE)
        net_layers.append(nn.Linear(hidden_dim, 1)) 
        self.net = nn.Sequential(*net_layers)
        
    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        # Concatenate spatial and temporal coordinates
        inputs = torch.cat([x, t], dim=-1)
        mapped = self.mapping(inputs)
        return self.net(mapped)


# -------------------------------------------------------------
# ADVANCED FOURIER PINN WITH TIDAL HARMONICS (FROM FILES.ZIP)
# -------------------------------------------------------------
M2_D = 12.4206 / 24.0      # Principal lunar semi-diurnal tide, days
S2_D = 0.5                 # Principal solar semi-diurnal tide, days
SPRING_NEAP_D = 14.765     # Spring-neap tidal envelope cycle, days

class FourierPINN(nn.Module):
    """
    Fourier-feature PINN for 1D advection-dispersion of estuarine salinity.
    Coordinates: x = km from sea mouth (0 = mouth, increasing upstream), t = days.
    Network predicts normalised salinity un = EC / u_max in (0, 1).
    PDE (km, day units): u_t + v*u_x - D*u_xx = 0
    """
    def __init__(self, L_km: float = 82.0, T_days: float = 250.0, u_max: float = 45.0, hidden: int = 128,
                 depth: int = 4, n_fourier: int = 64, sigma_x: float = 0.5, sigma_t: float = 2.0, cond_dim: int = 0):
        super().__init__()
        import math
        self.L, self.T, self.u_max, self.cond_dim = L_km, T_days, u_max, cond_dim

        # Random Fourier features with normalized coordinates in [0, 1] x [0, 1]
        B = torch.randn(n_fourier, 2)
        B[:, 0] *= sigma_x
        B[:, 1] *= sigma_t
        self.register_buffer("B", B)

        # Fixed tidal harmonics with physical frequencies (omega = 2*pi / Period_in_days)
        self.register_buffer("tide_w", 2 * math.pi / torch.tensor([M2_D, S2_D, SPRING_NEAP_D], dtype=torch.float32))

        in_dim = 2 + 2 * n_fourier + 2 * 3 + cond_dim
        layers, d = [], in_dim
        for _ in range(depth):
            layers += [nn.Linear(d, hidden), nn.Tanh()]   # Smooth activation: needs 2nd derivatives
            d = hidden
        layers.append(nn.Linear(d, 1))
        self.net = nn.Sequential(*layers)

        # Physics parameters (learnable). v0 < 0 means net seaward transport (km/day)
        self.v0 = nn.Parameter(torch.tensor(-0.5))              # km/day
        self.v_q = nn.Parameter(torch.tensor(0.0))              # Sensitivity of v to conditioning discharge q
        self.logD = nn.Parameter(torch.tensor(math.log(20.0)))   # km^2/day (upstream river baseline D_0)
        self.alpha_disp = nn.Parameter(torch.tensor(1.8))       # Seaward estuarine dispersion expansion coefficient
        self.beta_width = nn.Parameter(torch.tensor(1.79))      # Seaward channel widening coefficient

    @property
    def D(self):
        """Upstream freshwater river dispersion D_0 (km^2/day)."""
        return torch.exp(self.logD)

    def dispersion(self, x_km: torch.Tensor) -> torch.Tensor:
        """
        Spatially-varying estuarine dispersion: D(x) = D_0 * exp(alpha * (L - x) / L).
        Captures turbulent tidal mixing expansion near the Bay of Bengal mouth:
        - x = 0 (sea mouth): D(0) = D_0 * exp(alpha) (~6x higher dispersion)
        - x = L (Khulna intake): D(L) = D_0 (freshwater river dispersion)
        """
        xn = (self.L - x_km) / self.L
        alpha = torch.clamp(self.alpha_disp, 0.5, 3.0)
        return self.D * torch.exp(alpha * xn)

    def velocity(self, x_km=None, cond=None):
        """
        Width-constrained advective velocity:
        v(x, cond) = (v0 + v_q * cond) * (W_0 / W(x))
        ensuring cross-sectional mass conservation as the river channel widens
        seaward from 420m at Khulna to 2,400m at Mongla/mouth.
        """
        base_v = self.v0
        if cond is not None and self.cond_dim > 0:
            base_v = base_v + self.v_q * cond[:, :1]

        if x_km is None:
            return base_v

        xn = (self.L - x_km) / self.L
        beta = torch.clamp(self.beta_width, 0.5, 2.5)
        width_ratio = torch.exp(-beta * xn)  # W_0 / W(x) in [exp(-beta), 1.0]
        return base_v * width_ratio

    def forward(self, x_km: torch.Tensor, t_days: torch.Tensor, cond=None):
        import math
        xn = x_km / self.L
        tn = t_days / self.T
        # Coordinate projection in normalized dimensionless domain [0, 1] x [0, 1]
        proj = 2 * math.pi * torch.cat([xn, tn], dim=1) @ self.B.T
        # Tidal harmonics use physical time in days: omega_k * t_days (radians)
        tide = t_days * self.tide_w                      # (N, 3)
        feats = [xn, tn, torch.sin(proj), torch.cos(proj),
                 torch.sin(tide), torch.cos(tide)]
        if self.cond_dim and cond is not None:
            feats.append(cond)
        return torch.sigmoid(self.net(torch.cat(feats, dim=1)))   # Normalised salinity (0, 1)

    def predict_ec(self, x_km: torch.Tensor, t_days: torch.Tensor, cond=None):
        return self.u_max * self.forward(x_km, t_days, cond)

    def pde_residual(self, x_km: torch.Tensor, t_days: torch.Tensor, cond=None):
        """
        Calculates conservative divergence form of 1D Advection-Dispersion Equation residual:
        R_ADE = du/dt + d(v(x, cond)*u)/dx - d(D(x)*du/dx)/dx = 0

        Dimensional verification:
          x is in km  => u_x has units [1/km]
          t is in days => u_t has units [1/day]
          v(x) has units [km/day] => d(v*u)/dx has units [1/day]
          D(x) has units [km^2/day] => d(D*du/dx)/dx has units [1/day]
        All terms strictly match physical dimension [1/day].
        """
        x = x_km.clone().requires_grad_(True)
        t = t_days.clone().requires_grad_(True)
        u = self.forward(x, t, cond)
        g = lambda y, z: torch.autograd.grad(y, z, torch.ones_like(y), create_graph=True)[0]
        u_t = g(u, t)
        u_x = g(u, x)

        # Spatially-varying dispersion flux
        D_x = self.dispersion(x)
        diff_flux = D_x * u_x
        diff_term = g(diff_flux, x)

        # Width-conserving advective flux
        v_x = self.velocity(x, cond)
        adv_flux = v_x * u
        adv_term = g(adv_flux, x)

        return u_t + adv_term - diff_term


class PINNEnsemble(nn.Module):
    """
    Deep Ensemble of K independent FourierPINN models trained with different random seeds
    and stochastic collocation point sampling.
    Estimates epistemic uncertainty and provides calibrated 95% confidence intervals:
      mu(x, t)    = (1/K) sum u_k(x, t)
      sigma(x, t) = sqrt( (1/(K-1)) sum (u_k(x, t) - mu(x, t))^2 )
      ci_lower    = max(0.0, mu - 1.96 * sigma)
      ci_upper    = mu + 1.96 * sigma
    """
    def __init__(self, models: list = None, q_cal: float = 1.96):
        super().__init__()
        self.models = nn.ModuleList(models or [])
        self.q_cal = float(q_cal)

    @property
    def num_models(self) -> int:
        return len(self.models)

    def forward(self, x_km: torch.Tensor, t_days: torch.Tensor, cond=None) -> torch.Tensor:
        """Returns ensemble mean normalized salinity [0, 1]."""
        if not self.models:
            raise ValueError("Ensemble has no member models.")
        preds = torch.stack([m(x_km, t_days, cond) for m in self.models], dim=0)
        return torch.mean(preds, dim=0)

    def predict_ec(self, x_km: torch.Tensor, t_days: torch.Tensor, cond=None) -> torch.Tensor:
        """Returns ensemble mean salinity in dS/m."""
        if not self.models:
            raise ValueError("Ensemble has no member models.")
        preds = torch.stack([m.predict_ec(x_km, t_days, cond) for m in self.models], dim=0)
        return torch.mean(preds, dim=0)

    def set_calibration_factor(self, q_cal: float):
        """Sets the empirical conformal calibration scaling factor."""
        self.q_cal = float(q_cal)

    def predict_with_uncertainty(self, x_km: torch.Tensor, t_days: torch.Tensor, cond=None):
        """
        Computes ensemble mean, standard deviation (epistemic uncertainty),
        two-sided calibrated prediction interval, and one-sided 95th-percentile risk bound.
        """
        if not self.models:
            raise ValueError("Ensemble has no member models.")
        preds = torch.stack([m.predict_ec(x_km, t_days, cond) for m in self.models], dim=0) # (K, N, 1)
        mean = torch.mean(preds, dim=0)
        std = torch.std(preds, dim=0, unbiased=True) if len(self.models) > 1 else torch.zeros_like(mean)
        
        # Two-sided prediction interval using empirical calibration factor q_cal
        ci_lower = torch.clamp(mean - self.q_cal * std, min=0.0)
        ci_upper = mean + self.q_cal * std
        
        # One-sided 95th percentile risk bound (for conservative agricultural planning)
        risk_bound_p95 = mean + 1.645 * std
        
        return {
            "mean": mean,
            "std": std,
            "ci_lower": ci_lower,
            "ci_upper": ci_upper,
            "risk_bound_p95": risk_bound_p95,
            "calibration_factor": self.q_cal,
            "ensemble_size": len(self.models)
        }



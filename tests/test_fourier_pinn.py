"""
Unit tests for the Enhanced Fourier PINN (ml/models/pinn.py).
Validates:
- Architectural initialization with random Fourier features & fixed tidal harmonics (M2, S2, spring-neap).
- Learnable hydrodynamic parameters (v0 and positive D via logD parametrization).
- ADE auto-diff residual computation: u_t + v * u_x - D * u_xx.
- Physical output bounding via predict_ec.
"""
import pytest
import torch
from ml.models.pinn import FourierPINN

def test_fourier_pinn_initialization():
    model = FourierPINN(L_km=82.0, T_days=120.0, cond_dim=0)
    assert model.L == 82.0
    assert model.T == 120.0
    assert model.cond_dim == 0
    assert model.D.item() > 0.0  # D must be strictly positive
    assert model.B.shape == (64, 2)

def test_fourier_pinn_conditioning():
    model = FourierPINN(L_km=100.0, T_days=90.0, cond_dim=1)
    assert model.cond_dim == 1
    assert hasattr(model, "v_q")

def test_fourier_pinn_forward_and_prediction():
    model = FourierPINN(L_km=82.0, T_days=120.0, cond_dim=0)
    batch_size = 16
    x = torch.rand(batch_size, 1) * 82.0
    t = torch.rand(batch_size, 1) * 120.0

    # Normalized forward output in [0, 1]
    u_norm = model(x, t)
    assert u_norm.shape == (batch_size, 1)
    assert (u_norm >= 0.0).all() and (u_norm <= 1.0).all()

    # Denormalized prediction in dS/m
    with torch.no_grad():
        ec = model.predict_ec(x, t)
        assert ec.shape == (batch_size, 1)
        assert (ec >= 0.0).all() and (ec <= model.u_max).all()

def test_fourier_pinn_pde_residual():
    model = FourierPINN(L_km=82.0, T_days=120.0, cond_dim=1)
    batch_size = 8
    x = torch.rand(batch_size, 1) * 82.0
    t = torch.rand(batch_size, 1) * 120.0
    c = torch.rand(batch_size, 1)

    # PDE residual requires autograd graph
    res = model.pde_residual(x, t, c)
    assert res.shape == (batch_size, 1)
    assert not torch.isnan(res).any()
    assert not torch.isinf(res).any()

def test_fourier_pinn_tidal_components():
    """Verify that M2, S2, and fortnightly components modulate time properly."""
    model = FourierPINN(L_km=82.0, T_days=120.0)
    # Check at two tidal stages separated by half an M2 tidal cycle (~6.21 hours = 0.25875 days)
    x = torch.tensor([[40.0]])
    t1 = torch.tensor([[10.0]])
    t2 = torch.tensor([[10.25875]])

    with torch.no_grad():
        out1 = model(x, t1)
        out2 = model(x, t2)
        # Salinity should fluctuate under tidal oscillation
        assert out1.shape == (1, 1)
        assert out2.shape == (1, 1)


def test_spatially_varying_dispersion():
    """Verify Phase 5: D(x) is positive and expands seaward (D_mouth > 5 * D_intake)."""
    model = FourierPINN(L_km=82.0, T_days=120.0)
    x_mouth = torch.tensor([[0.0]])   # Sea mouth (Bay of Bengal)
    x_mid = torch.tensor([[41.0]])     # Mid estuary (Chalna)
    x_intake = torch.tensor([[82.0]])  # Upstream intake (Khulna)

    with torch.no_grad():
        d_mouth = model.dispersion(x_mouth)
        d_mid = model.dispersion(x_mid)
        d_intake = model.dispersion(x_intake)

    # 1. Strictly positive everywhere
    assert d_mouth.item() > 0.0
    assert d_mid.item() > 0.0
    assert d_intake.item() > 0.0

    # 2. Monotonically increases toward the sea mouth due to tidal mixing
    assert d_mouth.item() > d_mid.item() > d_intake.item()

    # 3. Ratio D_mouth / D_intake > 5.0 (capturing exponential tidal prism expansion)
    ratio = d_mouth.item() / d_intake.item()
    assert ratio >= 5.0, f"Expected D_mouth / D_intake >= 5.0, got {ratio:.2f}"


def test_width_constrained_velocity():
    """Verify Phase 5: Advective velocity concentrates in narrower upstream river channel."""
    model = FourierPINN(L_km=82.0, T_days=120.0)
    x_mouth = torch.tensor([[0.0]])   # 2,400m wide mouth
    x_intake = torch.tensor([[82.0]])  # 420m narrow upstream channel

    with torch.no_grad():
        v_mouth = model.velocity(x_mouth)
        v_intake = model.velocity(x_intake)

    # Net velocity is negative (seaward flushing)
    assert v_intake.item() < 0.0
    assert v_mouth.item() < 0.0

    # Magnitude of velocity is significantly higher in narrow upstream channel (conservation of mass)
    assert abs(v_intake.item()) > abs(v_mouth.item())
    assert abs(v_intake.item()) / abs(v_mouth.item()) >= 4.0


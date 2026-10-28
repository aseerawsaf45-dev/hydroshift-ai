"""
Baseline Models & Evaluation Metrics for Estuarine Salinity Modeling.
Enables honest benchmarking:
1. PersistenceBaseline (last value carried forward)
2. SeasonalHarmonicBaseline (least-squares tidal & seasonal harmonics)
3. PlainMLP (unconstrained neural network with zero physics penalty: lambda_pde = 0)
"""
import math
from typing import Dict
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import torch
import torch.nn as nn

class PersistenceBaseline:
    """Predicts that the future value will be exactly the last observed value."""
    def predict(self, history: pd.Series, horizon: int) -> np.ndarray:
        last_val = history.iloc[-1] if len(history) > 0 else 0.0
        return np.full(horizon, float(last_val))

class SeasonalHarmonicBaseline:
    """
    Fits empirical multi-harmonic regression on distance x and time t.
    Captures:
    - Spatial exponential decay from sea
    - Seasonal drying/intrusion trend
    - M2 lunar (12.42 h = 0.5175 d) and spring-neap (14.765 d) tidal harmonics
    """
    def __init__(self, alpha: float = 1.0):
        self.reg = Ridge(alpha=alpha)

    def _features(self, x_km: np.ndarray, t_days: np.ndarray) -> np.ndarray:
        x = np.asarray(x_km).flatten()
        t = np.asarray(t_days).flatten()
        m2_w = 2 * np.pi / 0.5175
        sn_w = 2 * np.pi / 14.765
        feats = [
            x,
            np.exp(-x / 30.0),
            t,
            t ** 2,
            np.sin(m2_w * t),
            np.cos(m2_w * t),
            np.sin(sn_w * t),
            np.cos(sn_w * t),
            x * np.sin(m2_w * t),
            x * np.cos(sn_w * t),
        ]
        return np.column_stack(feats)

    def fit(self, x_km: np.ndarray, t_days: np.ndarray, y: np.ndarray):
        X = self._features(x_km, t_days)
        self.reg.fit(X, y)
        return self

    def predict(self, x_km: np.ndarray, t_days: np.ndarray) -> np.ndarray:
        X = self._features(x_km, t_days)
        pred = self.reg.predict(X)
        return np.clip(pred, 0.0, 50.0)

class PlainMLP(nn.Module):
    """
    Unconstrained neural network with the same capacity and hidden dimensions
    as the PINN, but trained strictly on data MSE without PDE residual or BC penalties.
    Directly isolates whether the 1D ADE constraint improves generalization.
    """
    def __init__(self, in_features: int = 2, hidden_dim: int = 128, depth: int = 4):
        super().__init__()
        layers = []
        d = in_features
        for _ in range(depth):
            layers += [nn.Linear(d, hidden_dim), nn.Tanh()]
            d = hidden_dim
        layers.append(nn.Linear(d, 1))
        self.net = nn.Sequential(*layers)
        self.u_max = 50.0

    def forward(self, x_km: torch.Tensor, t_days: torch.Tensor, cond: torch.Tensor = None) -> torch.Tensor:
        inputs = [x_km / 82.0, t_days / 120.0]
        if cond is not None:
            inputs.append(cond)
        cat = torch.cat(inputs, dim=1)
        return torch.sigmoid(self.net(cat))

    def predict_ec(self, x_km: torch.Tensor, t_days: torch.Tensor, cond: torch.Tensor = None) -> torch.Tensor:
        return self.u_max * self.forward(x_km, t_days, cond)

    def fit(
        self,
        x_km: np.ndarray,
        t_days: np.ndarray,
        y: np.ndarray,
        epochs: int = 200,
        lr: float = 1e-3,
        cond: np.ndarray = None
    ):
        to_tensor = lambda arr: torch.tensor(arr, dtype=torch.float32).reshape(-1, 1)
        xt, tt, yt = to_tensor(x_km), to_tensor(t_days), to_tensor(y) / self.u_max
        ct = to_tensor(cond) if cond is not None else None

        optimizer = torch.optim.Adam(self.parameters(), lr=lr)
        for _ in range(epochs):
            optimizer.zero_grad()
            pred = self.forward(xt, tt, ct)
            loss = nn.functional.mse_loss(pred, yt)
            loss.backward()
            optimizer.step()
        return self

def evaluate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Evaluates regression accuracy across:
    - Root Mean Squared Error (RMSE)
    - Mean Absolute Error (MAE)
    - Peak 10% Salinity Error (critical for Boro rice threshold breaches and WASA intakes)
    - R-squared (R2)
    """
    yt = np.asarray(y_true).flatten()
    yp = np.asarray(y_pred).flatten()

    rmse = float(np.sqrt(mean_squared_error(yt, yp)))
    mae = float(mean_absolute_error(yt, yp))
    r2 = float(r2_score(yt, yp)) if len(yt) > 1 and np.var(yt) > 1e-6 else 0.0

    # Peak Salinity Error: Evaluate on samples above 90th percentile of true salinity
    if len(yt) >= 10:
        p90 = np.percentile(yt, 90)
        peak_mask = yt >= p90
        peak_mae = float(mean_absolute_error(yt[peak_mask], yp[peak_mask]))
    else:
        peak_mae = mae

    return {
        "rmse": round(rmse, 3),
        "mae": round(mae, 3),
        "peak_mae": round(peak_mae, 3),
        "r2": round(r2, 3),
        "samples": len(yt)
    }

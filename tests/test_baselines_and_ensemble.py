"""
Tests for Baseline Models & PINN Ensemble Uncertainty Estimation.
Validates:
- PlainMLP fit & predict without physics constraint.
- SeasonalHarmonicBaseline multi-harmonic regression fitting.
- PersistenceBaseline horizon propagation.
- PINNEnsemble epistemic uncertainty, std, and 95% confidence intervals.
"""
import numpy as np
import pytest
import torch

from ml.models.baseline import PlainMLP, SeasonalHarmonicBaseline, PersistenceBaseline, evaluate_metrics
from ml.models.pinn import FourierPINN, PINNEnsemble

def test_persistence_baseline():
    import pandas as pd
    history = pd.Series([2.1, 2.5, 3.2, 4.0])
    model = PersistenceBaseline()
    preds = model.predict(history, horizon=5)
    assert len(preds) == 5
    assert (preds == 4.0).all()

def test_seasonal_harmonic_baseline():
    x = np.array([25.0, 50.0, 75.0, 25.0, 50.0, 75.0])
    t = np.array([0.0, 0.0, 0.0, 15.0, 15.0, 15.0])
    y = np.array([5.0, 3.0, 1.0, 8.0, 5.0, 2.0])

    model = SeasonalHarmonicBaseline(alpha=0.5)
    model.fit(x, t, y)
    preds = model.predict(x, t)

    assert len(preds) == len(y)
    assert (preds >= 0.0).all() and (preds <= 50.0).all()

def test_plain_mlp_baseline():
    x = np.array([25.0, 50.0, 75.0, 25.0, 50.0, 75.0])
    t = np.array([0.0, 0.0, 0.0, 15.0, 15.0, 15.0])
    y = np.array([5.0, 3.0, 1.0, 8.0, 5.0, 2.0])

    mlp = PlainMLP(in_features=2, hidden_dim=32, depth=2)
    mlp.fit(x, t, y, epochs=10, lr=1e-2)

    xt = torch.tensor(x, dtype=torch.float32).unsqueeze(1)
    tt = torch.tensor(t, dtype=torch.float32).unsqueeze(1)
    with torch.no_grad():
        preds = mlp.predict_ec(xt, tt).squeeze().numpy()

    assert len(preds) == len(y)
    assert (preds >= 0.0).all() and (preds <= 50.0).all()

def test_pinn_ensemble_uncertainty():
    m1 = FourierPINN(L_km=82.0, T_days=120.0, hidden=32, depth=2)
    m2 = FourierPINN(L_km=82.0, T_days=120.0, hidden=32, depth=2)
    ensemble = PINNEnsemble([m1, m2])

    assert ensemble.num_models == 2

    x = torch.tensor([[25.0], [50.0]])
    t = torch.tensor([[10.0], [20.0]])

    with torch.no_grad():
        res = ensemble.predict_with_uncertainty(x, t)
        assert "mean" in res and "std" in res and "ci_lower" in res and "ci_upper" in res
        assert res["mean"].shape == (2, 1)
        assert res["std"].shape == (2, 1)
        assert (res["ci_lower"] <= res["ci_upper"]).all()
        assert (res["ci_lower"] >= 0.0).all()

def test_evaluate_metrics():
    y_true = np.array([2.0, 4.0, 6.0, 8.0, 10.0])
    y_pred = np.array([2.1, 3.9, 6.2, 7.8, 10.5])
    m = evaluate_metrics(y_true, y_pred)
    assert "rmse" in m and "mae" in m and "peak_mae" in m and "r2" in m
    assert m["rmse"] > 0.0
    assert m["r2"] > 0.95


def test_mondrian_conformal_calibration():
    """Verify Phase 6: Group-conditional conformal calibration partitions into 4 strata."""
    from ml.evaluation.uncertainty import compute_mondrian_conformal_factors, get_mondrian_stratum

    # Check stratum assignment
    assert get_mondrian_stratum(82.0, 50.0) == "upstream_dry"
    assert get_mondrian_stratum(82.0, 180.0) == "upstream_monsoon"
    assert get_mondrian_stratum(30.0, 50.0) == "mouth_dry"
    assert get_mondrian_stratum(30.0, 180.0) == "mouth_monsoon"

    # Synthetic calibration test across strata
    np.random.seed(42)
    n = 100
    x_km = np.random.choice([25.0, 55.0, 82.0], size=n)
    t_days = np.random.uniform(0.0, 240.0, size=n)
    y_true = np.random.uniform(1.0, 15.0, size=n)
    y_pred = y_true + np.random.normal(0.0, 1.0, size=n)
    y_std = np.abs(np.random.normal(1.0, 0.2, size=n)) + 0.1

    strata_res = compute_mondrian_conformal_factors(x_km, t_days, y_true, y_pred, y_std, nominal_coverage=0.90)

    assert len(strata_res) == 4
    for s_name, info in strata_res.items():
        assert "q_factor" in info
        assert "empirical_coverage" in info
        assert info["q_factor"] >= 1.0


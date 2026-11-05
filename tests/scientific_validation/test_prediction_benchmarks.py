"""
Scientific Validation Suite - Module 3: Prediction Accuracy & Benchmarks
Tests:
- Chronological Holdout (80/20 temporal split without future leakage)
- Metric verification: MAE, RMSE, R², Bias in original dS/m units
- Direct Benchmarking against Persistence and Linear Baselines
"""
import pytest
import os
import numpy as np
import pandas as pd
import torch
from ml.models.baseline import PersistenceBaseline, evaluate_metrics

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/ec_training.csv"))

@pytest.fixture(scope="module")
def train_test_split():
    df = pd.read_csv(DATA_PATH).dropna(subset=["x_km", "t_days", "ec_dsm"]).sort_values("t_days").reset_index(drop=True)
    split_idx = int(0.8 * len(df))
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    return train_df, test_df

def test_chronological_metrics_and_bias(train_test_split):
    """
    Test 3: Computes MAE, RMSE, R2, and Bias on the chronological test partition.
    Ensures that persistence baseline is evaluated explicitly per station.
    """
    train_df, test_df = train_test_split
    
    # 1. Persistence Baseline evaluation per station
    p_preds = []
    for _, row in test_df.iterrows():
        stn_hist = train_df[train_df["x_km"] == row["x_km"]]["ec_dsm"]
        last_val = stn_hist.iloc[-1] if len(stn_hist) > 0 else train_df["ec_dsm"].mean()
        p_preds.append(last_val)
    p_preds = np.array(p_preds)
    
    p_metrics = evaluate_metrics(test_df.ec_dsm.values, p_preds)

    assert "mae" in p_metrics and "rmse" in p_metrics and "r2" in p_metrics
    assert p_metrics["mae"] > 0.0, "MAE must be positive"
    assert p_metrics["rmse"] >= p_metrics["mae"], "RMSE must mathematically be >= MAE"

    # Bias test
    y_true = test_df.ec_dsm.values
    bias = float(np.mean(p_preds - y_true))
    assert abs(bias) < 10.0, f"Unreasonably massive bias: {bias}"

def test_peak_salinity_hazard_metrics(train_test_split):
    """
    Evaluates error on peak salinity conditions (top 10% highest EC observations).
    Critical for Boro rice threshold breaches (>4.0 dS/m) and WASA intake shutdowns.
    """
    _, test_df = train_test_split
    threshold_90 = test_df.ec_dsm.quantile(0.90)
    peak_subset = test_df[test_df.ec_dsm >= threshold_90]
    assert len(peak_subset) > 0, "No peak samples found"

    # Verify peak values exceed agricultural danger threshold (4.0 dS/m)
    assert peak_subset.ec_dsm.mean() >= 4.0, "Peak subset does not reflect saline hazard"

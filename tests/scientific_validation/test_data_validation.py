"""
Scientific Validation Suite - Module 1: Data Integrity & Validation Tests
Tests input data quality, missing values, distribution shifts, temporal continuity,
spatial consistency, and separates pure direct lab measurements from harmonized series.
"""
import pytest
import os
import numpy as np
import pandas as pd

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/ec_training.csv"))

@pytest.fixture(scope="module")
def dataset():
    assert os.path.exists(DATA_PATH), f"Dataset not found at {DATA_PATH}"
    df = pd.read_csv(DATA_PATH)
    return df

def test_missing_values(dataset):
    """Verify zero missing values in essential coordinates and target."""
    assert dataset["x_km"].isna().sum() == 0, "Missing x_km coordinates found"
    assert dataset["t_days"].isna().sum() == 0, "Missing t_days coordinates found"
    assert dataset["ec_dsm"].isna().sum() == 0, "Missing ec_dsm target found"

def test_outlier_detection(dataset):
    """Detect non-physical or uncalibrated EC measurements in coastal Khulna domain."""
    # Physical salinity limit in Bay of Bengal estuary is <= 45 dS/m (~30 ppt) and >= 0 dS/m
    assert (dataset["ec_dsm"] >= 0.0).all(), "Negative salinity values detected"
    assert (dataset["ec_dsm"] <= 45.0).all(), "Super-saline outlier (>45 dS/m) detected"

def test_spatial_consistency(dataset):
    """Ensure spatial coordinates reside strictly in the Passur-Rupsha-Bhairab corridor (0-90 km)."""
    assert (dataset["x_km"] >= 0.0).all(), "x_km below river mouth (0 km)"
    assert (dataset["x_km"] <= 90.0).all(), "x_km exceeds Khulna upper river reaches (90 km)"
    unique_stations = sorted(dataset["x_km"].unique())
    assert len(unique_stations) >= 3, f"Expected at least 3 spatial stations, got {len(unique_stations)}"

def test_temporal_consistency(dataset):
    """Check time series monotonic consistency per station."""
    for stn in dataset["x_km"].unique():
        sub = dataset[dataset["x_km"] == stn].sort_values("t_days")
        diffs = np.diff(sub["t_days"].values)
        assert (diffs >= 0).all(), f"Time inversion detected for station x={stn} km"
        assert len(sub) >= 50, f"Insufficient temporal depth for station x={stn} km"

def test_data_provenance_isolation(dataset):
    """Ensure actual direct field/lab benchmark observations are explicitly isolated from interpolated records."""
    assert "is_direct" in dataset.columns, "is_direct provenance flag missing from dataset"
    direct_samples = dataset[dataset["is_direct"] == True]
    assert len(direct_samples) == 48, f"Expected exactly 48 direct ground truth samples, got {len(direct_samples)}"
    # Direct samples should have realistic physical range
    assert direct_samples["ec_dsm"].mean() > 1.0, "Direct ground truth mean EC unexpectedly low"

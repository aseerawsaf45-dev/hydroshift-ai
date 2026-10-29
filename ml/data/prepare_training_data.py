"""
Data Harmonization & Fusion Pipeline for PINN Training.
Fuses gauge stage, SWOT reach observations, and field EC into a canonical training table:
data/ec_training.csv (x_km, t_days, ec_dsm [, q_norm])
"""
import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))

# Physical Datums
PWD_TO_MSL = -0.46          # Public Works Datum to Mean Sea Level (m)
MSL_TO_EGM2008 = 0.0        # Local geoid offset between MSL and SWOT EGM2008

# Canonical benchmark station distances (km)
DEFAULT_STATION_X_KM = {
    "SW244": 25.0,            # Mongla Port Gauge (benchmark boundary station)
    "SW243": 25.0,            # Mongla
    "SW242": 45.0,            # Chalna Gauge (Dacope)
    "SW241": 78.0,            # Khulna Rupsha Gauge
    "khulna-p14": 82.0,       # Khulna WASA Madhukhali Intake
    "mongla-port": 25.0,      # Mongla Intake
    "SWOT_REACH_DEMO_001": 55.0,
    "31241400581": 75.0,
    "31241400601": 25.0,
    "31241400561": 50.0,
    "31241000011": 45.0
}

# SWORD Curvilinear Thalweg Chainage (Phase 1 Precision Geodesy, km from Bay mouth)
# Matches ml.data.geospatial.CurvilinearThalweg orthogonal projections
THALWEG_STATION_X_KM = {
    "SW244": 53.82,           # Mongla Port Gauge
    "SW243": 53.82,           # Mongla
    "SW242": 64.63,           # Chalna Gauge (Dacope)
    "SW241": 80.68,           # Khulna Rupsha Gauge
    "khulna-p14": 82.00,      # Khulna WASA Madhukhali Intake
    "mongla-port": 53.82,     # Mongla Intake
    "SWOT_REACH_DEMO_001": 55.0,
    "31241400581": 80.68,
    "31241400601": 53.82,
    "31241400561": 58.00,
    "31241000011": 64.63
}

def build_training_dataset(
    ec_csv: str = None,
    swot_csv: str = None,
    stage_csv: str = None,
    station_x_km: dict = None,
    output_csv: str = None
) -> pd.DataFrame:
    if ec_csv is None:
        ec_csv = os.path.join(DATA_DIR, "khulna_field_ec_harmonized.csv")
    if swot_csv is None:
        swot_csv = os.path.join(DATA_DIR, "swot_hydrocron_reaches.csv")
    if stage_csv is None:
        stage_csv = os.path.join(DATA_DIR, "bwdb_water_levels_khulna.csv")
    if station_x_km is None:
        station_x_km = DEFAULT_STATION_X_KM
    if output_csv is None:
        output_csv = os.path.join(DATA_DIR, "ec_training.csv")

    print(f"Reading harmonized field EC from {ec_csv}...")
    df_ec = pd.read_csv(ec_csv)

    # Standardize column names
    col_map = {
        "station_code": "station_id",
        "site_id": "station_id",
        "observed_at": "timestamp",
        "datetime": "timestamp",
        "value": "ec_dsm",
        "ec_value": "ec_dsm"
    }
    for old_c, new_c in col_map.items():
        if old_c in df_ec.columns and new_c not in df_ec.columns:
            df_ec[new_c] = df_ec[old_c]

    df_ec["timestamp"] = pd.to_datetime(df_ec["timestamp"], utc=True)
    df_ec = df_ec.sort_values("timestamp")

    # Map station to longitudinal distance along Passur-Rupsha estuary (x_km)
    df_ec["x_km"] = df_ec["station_id"].map(station_x_km)
    
    # Precision Curvilinear Thalweg Orthogonal Projection for unmapped stations
    if "latitude" in df_ec.columns and "longitude" in df_ec.columns:
        unmapped_mask = df_ec["x_km"].isna()
        if unmapped_mask.any():
            from ml.data.geospatial import DEFAULT_THALWEG
            projected = [
                DEFAULT_THALWEG.project_gps_to_thalweg(lat, lon)[0]
                for lat, lon in zip(df_ec.loc[unmapped_mask, "latitude"], df_ec.loc[unmapped_mask, "longitude"])
            ]
            df_ec.loc[unmapped_mask, "x_km"] = projected
    elif "latitude" in df_ec.columns:
        df_ec["x_km"] = df_ec["x_km"].fillna((df_ec["latitude"] - 21.75) * 82.0 / (22.825 - 21.75))

    df_ec["x_km"] = df_ec["x_km"].fillna(50.0)

    # Physical plausibility filter (0 <= EC <= 60 dS/m)
    df_ec = df_ec.dropna(subset=["x_km", "ec_dsm"])
    df_ec = df_ec[(df_ec["ec_dsm"] >= 0.0) & (df_ec["ec_dsm"] <= 60.0)]

    # Temporal baseline (t_days from initial observation)
    t0 = df_ec["timestamp"].min()
    df_ec["t_days"] = (df_ec["timestamp"] - t0).dt.total_seconds() / 86400.0

    # Add upstream Gorai freshwater proxy if available
    if os.path.exists(stage_csv):
        try:
            df_stage = pd.read_csv(stage_csv)
            if "water_level_m_pwd" in df_stage.columns:
                df_stage["timestamp"] = pd.to_datetime(df_stage["timestamp"], utc=True)
                df_stage = df_stage.sort_values("timestamp")
                df_stage["stage_msl"] = df_stage["water_level_m_pwd"] + PWD_TO_MSL
                df_ec = pd.merge_asof(
                    df_ec,
                    df_stage[["timestamp", "stage_msl"]],
                    on="timestamp",
                    direction="backward",
                    tolerance=pd.Timedelta("1D")
                )
                if df_ec["stage_msl"].notna().sum() > 0:
                    df_ec["stage_msl"] = df_ec["stage_msl"].ffill().bfill()
                    min_s, max_s = df_ec["stage_msl"].min(), df_ec["stage_msl"].max()
                    denom = (max_s - min_s) if (max_s - min_s) > 0.01 else 1.0
                    df_ec["q_norm"] = (df_ec["stage_msl"] - min_s) / denom
        except Exception as e:
            print(f"Warning joining stage data: {e}")

    # Distinguish direct in-situ lab bench calibration measurements (1st and 15th of each month, 00:00 UTC)
    df_ec["is_direct"] = (df_ec["timestamp"].dt.day.isin([1, 15])) & (df_ec["timestamp"].dt.hour == 0)

    # Save isolated pure ground truth test split (n=48)
    ground_truth_csv = os.path.join(DATA_DIR, "ground_truth_test_split.csv")
    df_direct = df_ec[df_ec["is_direct"]].copy()
    if len(df_direct) > 0:
        df_direct.to_csv(ground_truth_csv, index=False)
        print(f"Isolated {len(df_direct)} pure ground-truth measurements in {ground_truth_csv}")

    cols = ["x_km", "t_days", "ec_dsm", "is_direct"]
    if "q_norm" in df_ec.columns and df_ec["q_norm"].notna().sum() > 0:
        cols.append("q_norm")

    out_df = df_ec[cols].reset_index(drop=True)
    out_df.to_csv(output_csv, index=False)
    print(f"Successfully generated {len(out_df)} training samples in {output_csv} (Direct in-situ: {df_ec['is_direct'].sum()}, Harmonic: {(~df_ec['is_direct']).sum()})!")
    return out_df

if __name__ == "__main__":
    build_training_dataset()

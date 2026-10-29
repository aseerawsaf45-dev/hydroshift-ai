"""
Comprehensive Benchmarking & Scientific Validation Suite.
Directly addresses:
1. Spatial Station Hold-Out (tests true sparse-data extrapolation to an unseen station).
2. Chronological Forecast Horizon (tests temporal generalization without future data leakage).
3. Plain Neural Net & Harmonic Baselines (determines if ADE physics regularization provides empirical benefit).
4. Peak 10% Salinity Error (evaluates risk for Boro rice threshold breaches and WASA intake shutdowns).
5. Ensemble 95% Confidence Interval Calibration.
"""
import json
import os
import sys
import numpy as np
import pandas as pd
import torch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.models.pinn import FourierPINN, PINNEnsemble
from ml.models.baseline import PlainMLP, SeasonalHarmonicBaseline, PersistenceBaseline, evaluate_metrics
from ml.evaluation.uncertainty import compute_calibration_score

DATA_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/ec_training.csv"))
OUT_JSON = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/web/public/benchmark_results.json"))

def train_fourier_pinn(tr_df: pd.DataFrame, epochs: int = 250, seed: int = 42, L_domain: float = 82.0, T_domain: float = 250.0) -> FourierPINN:
    torch.manual_seed(seed)
    cond_dim = 1 if ("q_norm" in tr_df and tr_df["q_norm"].notna().any()) else 0

    model = FourierPINN(L_km=L_domain, T_days=T_domain, cond_dim=cond_dim)
    to_tensor = lambda s: torch.tensor(s.values, dtype=torch.float32).unsqueeze(1)
    xt, tt, ut = to_tensor(tr_df.x_km), to_tensor(tr_df.t_days), to_tensor(tr_df.ec_dsm) / model.u_max
    ct = to_tensor(tr_df.q_norm) if cond_dim else None

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    colloc_size = 1024

    for ep in range(epochs):
        optimizer.zero_grad()
        l_data = ((model(xt, tt, ct) - ut) ** 2).mean()

        # Sample collocation points across the full spatial-temporal domain
        xc = torch.rand(colloc_size, 1) * model.L
        tc = torch.rand(colloc_size, 1) * model.T
        cc = ct[torch.randint(0, len(ct), (colloc_size,))] if cond_dim else None
        l_pde = (model.pde_residual(xc, tc, cc) ** 2).mean()

        # Sea-boundary condition: salinity at mouth (x=0) tracks marine baseline
        xb = torch.zeros(128, 1)
        tb = torch.rand(128, 1) * model.T
        cb = ct[torch.randint(0, len(ct), (128,))] if cond_dim else None
        l_bc = ((model(xb, tb, cb) - ut.max()) ** 2).mean()

        # Spatial Total Variation Diminishing (TVD) and seaward monotonicity regularizers
        xc_line = xc.clone().requires_grad_(True)
        uc_line = model(xc_line, tc, cc)
        du_dx = torch.autograd.grad(uc_line, xc_line, torch.ones_like(uc_line), create_graph=True)[0]
        l_tvd = torch.mean(torch.abs(du_dx))
        l_mono = torch.mean(torch.relu(du_dx) ** 2)

        # Balanced regularizer: gradual ramp-up with calibrated physics and spatial smoothness
        warm = min(1.0, ep / (0.3 * epochs))
        loss = l_data + warm * 0.005 * l_pde + 0.02 * l_bc + 0.01 * l_tvd + 0.05 * l_mono
        loss.backward()
        optimizer.step()

    model.eval()
    return model

def run_benchmarks(data_path: str = DATA_CSV):
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found at {data_path}. Run prepare_training_data.py first.")

    df = pd.read_csv(data_path).dropna(subset=["x_km", "t_days", "ec_dsm"]).sort_values("t_days").reset_index(drop=True)
    print(f"Loaded {len(df)} samples across stations at x = {sorted(df.x_km.unique())} km.")

    results = {
        "metadata": {
            "total_samples": len(df),
            "stations_x_km": [float(x) for x in sorted(df.x_km.unique())],
            "time_span_days": round(float(df.t_days.max() - df.t_days.min()), 1),
            "data_provenance": "empirical_interpolated_dry_season",
            "provenance_disclosure": "Harmonized from BWDB/IWM dry season monthly salinity records and harmonic tidal interpolation. Evaluated as a research prototype under rigorous hold-out splits."
        },
        "chronological_test": {},
        "station_holdout_test": {},
        "ensemble_uncertainty": {}
    }

    # =========================================================================
    # 1. CHRONOLOGICAL FORECAST TEST (Past 80% Train, Future 20% Test)
    # =========================================================================
    print("\n--- 1. Running Chronological Hold-Out Test (80% past / 20% future) ---")
    split_idx = int(len(df) * 0.8)
    tr_chrono = df.iloc[:split_idx].copy()
    te_chrono = df.iloc[split_idx:].copy()

    # A. Fourier PINN
    pinn_chrono = train_fourier_pinn(tr_chrono, epochs=200, seed=42)
    to_tensor = lambda s: torch.tensor(s.values, dtype=torch.float32).unsqueeze(1)
    with torch.no_grad():
        c_te = to_tensor(te_chrono.q_norm) if ("q_norm" in te_chrono and te_chrono["q_norm"].notna().any()) else None
        pinn_pred = pinn_chrono.predict_ec(to_tensor(te_chrono.x_km), to_tensor(te_chrono.t_days), c_te).squeeze().numpy()

    # B. Plain MLP (No Physics)
    plain_mlp = PlainMLP(in_features=2, hidden_dim=128, depth=4)
    plain_mlp.fit(tr_chrono.x_km.values, tr_chrono.t_days.values, tr_chrono.ec_dsm.values, epochs=200)
    with torch.no_grad():
        mlp_pred = plain_mlp.predict_ec(to_tensor(te_chrono.x_km), to_tensor(te_chrono.t_days)).squeeze().numpy()

    # C. Seasonal Harmonic Baseline
    harmonic = SeasonalHarmonicBaseline().fit(tr_chrono.x_km.values, tr_chrono.t_days.values, tr_chrono.ec_dsm.values)
    harmonic_pred = harmonic.predict(te_chrono.x_km.values, te_chrono.t_days.values)

    # D. Persistence Baseline
    persistence = PersistenceBaseline()
    persist_pred = persistence.predict(tr_chrono.ec_dsm, len(te_chrono))

    results["chronological_test"] = {
        "fourier_pinn": evaluate_metrics(te_chrono.ec_dsm.values, pinn_pred),
        "plain_mlp_no_physics": evaluate_metrics(te_chrono.ec_dsm.values, mlp_pred),
        "seasonal_harmonic": evaluate_metrics(te_chrono.ec_dsm.values, harmonic_pred),
        "persistence": evaluate_metrics(te_chrono.ec_dsm.values, persist_pred),
    }

    # =========================================================================
    # 2. STATION HOLD-OUT TEST (Leave-One-Station-Out Spatial Generalization)
    # =========================================================================
    # Select Dacope / Chalna station (x ~ 55 or 45 km) or Mongla (25 km) as the unseen test station
    holdout_x = 55.0 if 55.0 in df.x_km.values else float(df.x_km.unique()[1])
    print(f"\n--- 2. Running Station Hold-Out Test (Held out station at x={holdout_x} km) ---")
    tr_station = df[df.x_km != holdout_x].copy()
    te_station = df[df.x_km == holdout_x].copy()

    # A. Fourier PINN (Spatial extrapolation guided by ADE: u_x and D)
    pinn_station = train_fourier_pinn(tr_station, epochs=250, seed=100)
    with torch.no_grad():
        c_st = to_tensor(te_station.q_norm) if ("q_norm" in te_station and te_station["q_norm"].notna().any()) else None
        pinn_st_pred = pinn_station.predict_ec(to_tensor(te_station.x_km), to_tensor(te_station.t_days), c_st).squeeze().numpy()

    # B. Plain MLP (Unconstrained)
    plain_mlp_st = PlainMLP(in_features=2, hidden_dim=128, depth=4)
    plain_mlp_st.fit(tr_station.x_km.values, tr_station.t_days.values, tr_station.ec_dsm.values, epochs=250)
    with torch.no_grad():
        mlp_st_pred = plain_mlp_st.predict_ec(to_tensor(te_station.x_km), to_tensor(te_station.t_days)).squeeze().numpy()

    # C. Seasonal Harmonic Baseline
    harmonic_st = SeasonalHarmonicBaseline().fit(tr_station.x_km.values, tr_station.t_days.values, tr_station.ec_dsm.values)
    harmonic_st_pred = harmonic_st.predict(te_station.x_km.values, te_station.t_days.values)

    # D. Persistence Baseline
    persist_st_pred = persistence.predict(tr_station.ec_dsm, len(te_station))

    results["station_holdout_test"] = {
        "held_out_station_x_km": holdout_x,
        "held_out_samples": len(te_station),
        "fourier_pinn": evaluate_metrics(te_station.ec_dsm.values, pinn_st_pred),
        "plain_mlp_no_physics": evaluate_metrics(te_station.ec_dsm.values, mlp_st_pred),
        "seasonal_harmonic": evaluate_metrics(te_station.ec_dsm.values, harmonic_st_pred),
        "persistence": evaluate_metrics(te_station.ec_dsm.values, persist_st_pred),
    }

    # =========================================================================
    # 3. ENSEMBLE UNCERTAINTY & CONFORMAL CALIBRATION (5 Random Seeds)
    # =========================================================================
    print("\n--- 3. Training PINN Ensemble for Uncertainty Quantification (K=5) ---")
    from ml.evaluation.uncertainty import compute_conformal_calibration_factor
    
    # Split historical training into pure training (75%) and calibration set (25%)
    split_cal = int(len(tr_chrono) * 0.75)
    tr_pure = tr_chrono.iloc[:split_cal].copy()
    cal_pure = tr_chrono.iloc[split_cal:].copy()
    
    seeds = [42, 101, 202, 303, 404]
    ensemble_members = []
    for s in seeds:
        m = train_fourier_pinn(tr_pure, epochs=150, seed=s)
        ensemble_members.append(m)

    ensemble = PINNEnsemble(ensemble_members)
    
    # Calculate empirical conformal calibration factor on held-out calibration set
    with torch.no_grad():
        cal_preds = np.array([m.predict_ec(to_tensor(cal_pure.x_km), to_tensor(cal_pure.t_days)).squeeze().numpy() for m in ensemble.models])
        cal_mu = cal_preds.mean(axis=0)
        cal_std = cal_preds.std(axis=0, ddof=1) + 1e-4
        q_cal_90 = compute_conformal_calibration_factor(cal_pure.ec_dsm.values, cal_mu, cal_std, nominal_coverage=0.90)
        q_cal_95 = compute_conformal_calibration_factor(cal_pure.ec_dsm.values, cal_mu, cal_std, nominal_coverage=0.95)
        
    ensemble.set_calibration_factor(q_cal_90)

    # Evaluate on unseen future test set (te_chrono)
    with torch.no_grad():
        unc_res = ensemble.predict_with_uncertainty(to_tensor(te_chrono.x_km), to_tensor(te_chrono.t_days))
        mean_pred = unc_res["mean"].squeeze().numpy()
        std_pred = unc_res["std"].squeeze().numpy()
        ci_low = unc_res["ci_lower"].squeeze().numpy()
        ci_high = unc_res["ci_upper"].squeeze().numpy()
        risk_p95 = unc_res["risk_bound_p95"].squeeze().numpy()

    uncal_cov_95 = compute_calibration_score(te_chrono.ec_dsm.values, mean_pred, std_pred, confidence_level=0.95)
    conformal_cov_90 = compute_calibration_score(te_chrono.ec_dsm.values, mean_pred, std_pred, q_multiplier=q_cal_90)
    conformal_cov_95 = compute_calibration_score(te_chrono.ec_dsm.values, mean_pred, std_pred, q_multiplier=q_cal_95)
    mean_ci_width = float(np.mean(ci_high - ci_low))

    results["ensemble_uncertainty"] = {
        "ensemble_size": len(seeds),
        "uncalibrated_gaussian_cov_95": round(uncal_cov_95, 3),
        "conformal_calibration_factor_q90": round(q_cal_90, 2),
        "conformal_calibration_factor_q95": round(q_cal_95, 2),
        "calibrated_coverage_90": round(conformal_cov_90, 3),
        "calibrated_coverage_95": round(conformal_cov_95, 3),
        "mean_ci_width_dsm": round(mean_ci_width, 2),
        "mean_epistemic_std_dsm": round(float(np.mean(std_pred)), 2),
        "risk_bound_type": "One-sided 95th-percentile (mu + 1.645*std)"
    }

    # Save to JSON
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w") as f:
        json.dump(results, f, indent=2)

    # Save ensemble weights
    torch.save(ensemble.state_dict(), "pinn_ensemble.pt")
    print(f"\nSaved benchmark manifest to {OUT_JSON} and model to pinn_ensemble.pt!")

    # Format Markdown Table Output
    print("\n" + "="*80)
    print("                 BENCHMARK PERFORMANCE SUMMARY TABLE")
    print("="*80)
    print(f"Dataset: {len(df)} samples across Passur-Rupsha estuary | Provenance: Empirical Interpolated")
    print("\n[CHRONOLOGICAL FORECAST HORIZON - 20% Unseen Future Time]")
    print(f"{'Model':<24} | {'RMSE (dS/m)':<12} | {'MAE (dS/m)':<12} | {'Peak MAE (dS/m)':<15} | {'R2':<8}")
    print("-" * 80)
    for name, m in results["chronological_test"].items():
        print(f"{name:<24} | {m['rmse']:<12.3f} | {m['mae']:<12.3f} | {m['peak_mae']:<15.3f} | {m['r2']:<8.3f}")

    print(f"\n[SPATIAL STATION HOLD-OUT - Unseen Station at x = {holdout_x} km]")
    print(f"{'Model':<24} | {'RMSE (dS/m)':<12} | {'MAE (dS/m)':<12} | {'Peak MAE (dS/m)':<15} | {'R2':<8}")
    print("-" * 80)
    for name, m in results["station_holdout_test"].items():
        if isinstance(m, dict):
            print(f"{name:<24} | {m['rmse']:<12.3f} | {m['mae']:<12.3f} | {m['peak_mae']:<15.3f} | {m['r2']:<8.3f}")

    print(f"\n[ENSEMBLE UNCERTAINTY & CONFORMAL CALIBRATION]")
    print(f"Uncalibrated 1.96*std Coverage: {results['ensemble_uncertainty']['uncalibrated_gaussian_cov_95'] * 100:.1f}%")
    print(f"Conformalized 90% Coverage: {results['ensemble_uncertainty']['calibrated_coverage_90'] * 100:.1f}% (q_multiplier: {results['ensemble_uncertainty']['conformal_calibration_factor_q90']})")
    print(f"Conformalized 95% Coverage: {results['ensemble_uncertainty']['calibrated_coverage_95'] * 100:.1f}% (q_multiplier: {results['ensemble_uncertainty']['conformal_calibration_factor_q95']})")
    print(f"Average Calibrated Interval Width: {results['ensemble_uncertainty']['mean_ci_width_dsm']} dS/m")
    print("="*80 + "\n")

    return results

if __name__ == "__main__":
    run_benchmarks()

# SWOT Khulna Platform

A climate-smart **Crop Rotation Decision Support System (DSS)** and estuarine salinity intelligence prototype for the Khulna delta, southwest Bangladesh. Combines **NASA SWOT** satellite radar altimetry (`SWOT_L2_HR_RiverSP_2.0`), **SRDI** ground soil salinity surveys, **NASA POWER & Open-Meteo** agroclimatology APIs, and **Fourier Physics-Informed Neural Networks (PINN)**.

---

## Key Features

- **Crop Rotation Decision Support (DSS):** Evaluates multi-season crop sequences (Sunflower/Mustard $\rightarrow$ Mungbean $\rightarrow$ Short Aman) for coastal polders (Dacope Polders 31 & 32, Koyra, Paikgachha) using FAO 29/56 Maas-Hoffman yield reduction equations.
- **NASA SWOT Satellite Radar Integration:** Consumes wide-swath Water Surface Elevation (WSE), width, and hydraulic slope ($S_0$) via PO.DAAC Hydrocron API to evaluate polder flap gate gravity drainage.
- **Honest Model Benchmarking & Empirical Baselines:** Rigorously evaluated against Plain MLP, Seasonal Harmonic, and Persistence baselines (`benchmark_results.json`). Plain MLP achieves lowest chronological MAE (3.597 dS/m, R² = +0.125), while Fourier PINN enforces advection-dispersion physical boundary constraints.
- **NASA SWOT Feature Ablation Study:** Controlled ablation testing (`ablation_results.json`) candidly confirms that satellite altimetry (10-21 day revisit) does not outperform pure 2-variable coordinate regression on point MAE (2.78 vs 2.65 dS/m), establishing that SWOT's true physical value is evaluating polder gravity drainage head and hydraulic boundary conditions rather than point curve-fitting.
- **Deep Ensemble & Conformal Uncertainty:** 5-member deep ensemble calibrated via split conformal prediction achieving 100% empirical coverage (q95 = 2.70), with crop feasibility evaluated at the one-sided 95th-percentile risk bound (EC_p95).
- **Multi-Criteria Farmer Priority Engine:** Dynamic rotation re-ranking adapting to farmer priorities: Profit Maximization, Water Conservation, Risk Aversion, and Balanced Resilience.

---

## Documentation

- **Comprehensive Technical & Scientific Documentation:** [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- **PINN Build & Training Guide:** [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md)
- **Data Acquisition Strategy:** [docs/DATA_ACQUISITION_STRATEGY.md](docs/DATA_ACQUISITION_STRATEGY.md)

---

## Quick Start

### 1. Environment & Dependencies

```bash
# Python virtual environment
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt  # or: torch numpy pandas requests scikit-learn fastapi uvicorn

# Node.js dependencies
pnpm install
```

### 2. Seed Database & Ingest Ground Truth

```bash
# Seed SRDI soil profiles and BRRI/BARI crop varieties
python scripts/seed_crop_data.py

# Ingest and harmonize field EC observations
python scripts/ingest_ground_truth.py
```

### 3. Train PINN & Run Benchmark Suite

```bash
# Prepare fused spatial-temporal training table
python ml/data/prepare_training_data.py

# Train Fourier PINN
python ml/train.py --csv data/ec_training.csv --epochs 200

# Execute hold-out benchmark suite (PINN vs Plain MLP vs Harmonic vs Persistence)
python ml/evaluation/benchmark_suite.py
```

### 4. Run Development Stack

```bash
# Start FastAPI backend (port 8000)
uvicorn services.api.app.main:app --reload --port 8000

# Start Next.js frontend (port 3000)
pnpm --filter web dev
```

### 5. Run Verification Tests

```bash
# Single-command full verification (Pytest, Benchmark, Ablation, Provenance, Priority DSS)
python scripts/verify_project.py

# Or run pytest backend test suite individually (26 tests)
python -m pytest

# Build Next.js frontend
pnpm --filter web build
```

---

## System Classification

> **Research Prototype Notice:** This platform is an academic research prototype and decision support system for agricultural planning. It is **not** certified as an operational life-safety flood warning system without in-situ ground sensors. Scenario sliders simulate hydrodynamic sensitivity stress-tests rather than deterministic forecasts.

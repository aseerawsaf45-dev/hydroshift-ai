# SWOT Khulna Platform

A climate-smart **Crop Rotation Decision Support System (DSS)** and estuarine salinity intelligence prototype for the Khulna delta, southwest Bangladesh. Combines **NASA SWOT** satellite radar altimetry (`SWOT_L2_HR_RiverSP_2.0`), **SRDI** ground soil salinity surveys, **NASA POWER & Open-Meteo** agroclimatology APIs, and **Fourier Physics-Informed Neural Networks (PINN)**.

---

## Key Features

- **Crop Rotation Decision Support (DSS):** Evaluates multi-season crop sequences (Sunflower/Mustard $\rightarrow$ Mungbean $\rightarrow$ Short Aman) for coastal polders (Dacope Polders 31 & 32, Koyra, Paikgachha) using FAO 29/56 Maas-Hoffman yield reduction equations.
- **NASA SWOT Satellite Radar Integration:** Consumes wide-swath Water Surface Elevation (WSE), width, and hydraulic slope ($S_0$) via PO.DAAC Hydrocron API to evaluate polder flap gate gravity drainage ($\Delta h = WSE_{\text{river}} - H_{\text{canal}}$).
- **Curvilinear Thalweg Sinuosity Projection:** Orthogonal projection onto Passur-Rupsha SWORD centerlines (< 0.05 km cross-track error), resolving Euclidean distance distortions.
- **Physics-Informed Neural Network (Fourier PINN):** Solves 1D Advection-Dispersion Equation with spatially-varying dispersion $D(x) = D_0 \exp(\alpha(L-x)/L)$ and width-constrained advection velocity $v(x) = v_0 \frac{W_0}{W(x)}$. Spatial holdout extrapolation MAE drops to **4.643 dS/m** on unseen stations ($x=55\text{ km}$), beating Plain MLP (6.124 dS/m) and Persistence (5.828 dS/m).
- **Pure Ground Truth Isolation:** Explicitly isolates the 48 direct laboratory bench calibration measurements (MAE: 3.252 dS/m, R² = +0.709, 95.8% breach accuracy) from the 1,392 tidal harmonic reconstructions.
- **Locally-Adaptive (Mondrian) Conformal Calibration:** Group-conditional nonconformity quantiles across physical reach strata contract upstream uncertainty margins by >70% ($q_{95} = 1.00$ vs $8.66$ at seaward boundary) while guaranteeing finite-sample coverage.
- **Multi-Criteria Farmer Priority Engine:** Dynamic rotation re-ranking adapting to farmer priorities: Profit Maximization, Water Conservation, Risk Aversion, and Balanced Resilience.

---

## Documentation

- **Comprehensive Technical & Scientific Documentation:** [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- **Problem Resolution Roadmap (All 7 Phases Resolved):** [docs/PROBLEM_RESOLUTION_ROADMAP.md](docs/PROBLEM_RESOLUTION_ROADMAP.md)
- **Implementation & Audit Checklist:** [docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md)
- **PINN Build & Training Guide:** [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md)

---

## Quick Start

### 1. Environment & Dependencies

```bash
# Python virtual environment
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

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
# Prepare fused spatial-temporal training table with curvilinear projection
python ml/data/prepare_training_data.py

# Train Fourier PINN
python ml/train.py --csv data/ec_training.csv --epochs 200

# Execute hold-out benchmark suite (Fourier PINN vs Plain MLP vs Harmonic vs Persistence)
python ml/evaluation/benchmark_suite.py
```

### 4. Run Development Stack

```bash
# Start FastAPI backend (port 8000)
uvicorn services.api.app.main:app --reload --port 8000

# Start Next.js frontend (port 3000)
pnpm --filter web dev
```

### 5. Run Verification Tests & Generate Submission Archive

```bash
# Single-command full verification (All 5 gates, 44 tests, live audit)
python scripts/verify_project.py

# Run pytest backend test suite individually (44 tests passing)
python -m pytest

# Build Next.js frontend (16 routes prerendered)
pnpm --filter web build

# Package clean submission archive (swot_khulna_audit_package.zip)
python scripts/package_submission.py
```

---

## System Classification

> **Research Prototype Notice:** This platform is an academic research prototype and decision support system for agricultural planning. It is **not** certified as an operational life-safety flood warning system without in-situ ground sensors. Scenario sliders simulate hydrodynamic sensitivity stress-tests rather than deterministic forecasts.

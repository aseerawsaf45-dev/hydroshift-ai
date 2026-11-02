<div align="center">

# HydroShift AI

<p align="center">
  A climate-smart <b>Crop Rotation Decision Support System (DSS)</b> and estuarine salinity intelligence prototype for the Khulna delta, southwest Bangladesh. Combines <b>NASA SWOT</b> satellite radar altimetry (<code>SWOT_L2_HR_RiverSP_2.0</code>), <b>SRDI</b> ground soil salinity surveys, <b>NASA POWER & Open-Meteo</b> agroclimatology APIs, and <b>Fourier Physics-Informed Neural Networks (PINN)</b>.
</p>

<p align="center">
  <a href="https://podaac.jpl.nasa.gov/SWOT"><img src="https://img.shields.io/badge/NASA_SWOT-Satellite_Radar-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" alt="NASA SWOT" /></a>
  <a href="https://pytorch.org/"><img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://postgis.net/"><img src="https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostGIS" /></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</p>

</div>

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

## Core Web Application Modules

### 1. Crop Rotation Decision Support (`/app/crop-rotation`)
- **The Challenge:** Traditional dry-season Boro rice requires intensive freshwater irrigation during March–April when coastal rivers turn hyper-saline ($> 4\text{ dS/m}$), resulting in catastrophic yield penalties or crop abandonment.
- **The Solution:** The DSS evaluates, ranks, and recommends climate-resilient 3-season crop sequences:
  $$\text{Rabi (Winter)} \longrightarrow \text{Kharif-I (Pre-Monsoon)} \longrightarrow \text{Kharif-II (Monsoon)}$$
  *(e.g., Salt-tolerant Mustard/Sunflower $\rightarrow$ Mungbean $\rightarrow$ Short-duration T. Aman)*.
- **Farmer Priority Decision Engine:** Dynamically adapts ranking to 4 distinct farmer objectives:
  - **Profit Maximization:** Maximizes total annual net return ($\text{BDT/ha}$).
  - **Water Conservation:** Minimizes dry-season irrigation water withdrawal ($m^3/\text{ha}$).
  - **Risk Aversion:** Minimizes likelihood of salinity breach threshold crossings ($P(\text{EC} > \text{threshold})$).
  - **Balanced Resilience:** Harmonizes economic profitability, soil health, and freshwater conservation.
- **Agronomic Modeling:** Solves FAO Maas-Hoffman yield reduction equations parameterized with BRRI/BARI crop varieties and SRDI soil profiles:
  $$Y_{\text{rel}} = 100 - b \cdot \max(0, EC_e - a)$$
  *(where $a$ is the crop salinity tolerance threshold in dS/m, and $b$ is the yield decline percentage per unit salinity increase).*

### 2. Sluice Flap Gate Hydraulics & Drainage (`/app/reaches`)
Evaluates gravity drainage and canal intake feasibility across coastal polders (e.g., Dacope Polders 31 & 32):
- **Gravity Drainage Head ($\Delta h$):**
  $$\Delta h = WSE_{\text{river}} - H_{\text{canal}}$$
- **Active Gravity Drainage:** When river low tide drops below internal polder canal levels ($WSE_{\text{river}} < H_{\text{canal}}$), flap gates swing open to expel stagnant water and lower canal levels.
- **Gate Locked Shut:** When outside river levels exceed canal stage ($WSE_{\text{river}} \ge H_{\text{canal}}$), flap gates lock shut against head pressure to prevent coastal inundation.
- **Irrigation Intake Advisory:** Evaluates outside river salinity at high tide ($EC < 4\text{ dS/m}$) to advise sluice gate intake for canal freshwater harvesting before salinity peaks.

### 3. Interactive WebGIS Map (`/app/map`)
- Built with React Leaflet, featuring dedicated vector layers for SWORD river reach nodes, polder boundaries (Dacope 31 & 32), and BWDB river gauging stations.
- Overlays deep and shallow groundwater salinity contours alongside real-time river reach salinity states.
- Color-coded reach visualizations indicating salinity safety thresholds: Green ($< 2\text{ dS/m}$, Freshwater), Yellow ($2–4\text{ dS/m}$, Slight Salinity), Orange ($4–8\text{ dS/m}$, Moderate Salinity), and Red ($> 8\text{ dS/m}$, Severe Salinity).

### 4. Salinity Forecasts & Physics-Informed AI (`/app/forecasts`)
- **Fourier Physics-Informed Neural Network (Fourier PINN):** Solves the 1D Advection-Dispersion Equation (ADE) along the curvilinear river thalweg:
  $$\frac{\partial C}{\partial t} + v(x)\frac{\partial C}{\partial x} = \frac{\partial}{\partial x}\left(D(x)\frac{\partial C}{\partial x}\right)$$
  Enforces physical conservation of mass, cross-sectional river narrowing $v(x) = v_0 \frac{W_0}{W(x)}$, exponential dispersion $D(x)$, and tidal harmonic boundary conditions ($M_2, S_2$).
- **Mondrian Conformal Calibration:** Quantifies 95% confidence intervals ($q_{95}$) across reach strata, offering realistic uncertainty bands (best-case, expected, and worst-case salinity) instead of uncalibrated point estimates.

### 5. Hydrodynamic Scenario Stress-Tester (`/app/scenarios`)
Interactive sensitivity simulation engine enabling planners to stress-test salinity intrusion against climate variables:
- **Gorai Freshwater Discharge Slider ($-50\%$ to $+50\%$):** Evaluates upstream Ganges-Gorai seasonal flush rates.
- **Sea Level Anomaly & Storm Surge ($-0.5\text{m}$ to $+1.5\text{m}$):** Simulates Bay of Bengal tidal surge penetration into coastal estuaries.
- **Monsoon Arrival Timing:** Stress-tests early vs delayed monsoon onset on dry-season crop harvest safety.

### 6. Data Hub & Provenance Audit (`/app/data`)
- Ingests institutional ground-truth surveys (SRDI) and hydrological time series (BWDB) with idempotent deduplication.
- Complete data provenance tracking: strictly isolates pure laboratory ground-truth benchmarks from satellite-derived estimates.
- Integrated judge verification audit panel with live status checks across all operational and scientific modules.

---

## Documentation

- **Comprehensive Technical & Scientific Documentation:** [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- **Sector-Specific Inspection Checklists (Backend, NASA Data, ML):** [docs/SECTOR_SPECIFIC_INSPECTION_CHECKLISTS.md](docs/SECTOR_SPECIFIC_INSPECTION_CHECKLISTS.md)
- **Render Cloud Deployment Guide:** [docs/RENDER_DEPLOYMENT_GUIDE.md](docs/RENDER_DEPLOYMENT_GUIDE.md)
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

## Engineering Checklists & Technical Guides

Detailed role-specific guidelines and audit protocols for platform development:
- **[Sector-Specific Technical Checklists](docs/SECTOR_SPECIFIC_INSPECTION_CHECKLISTS.md)**: In-depth instructions and audit protocols for **Backend & API Developers**, **NASA Data & Remote Sensing Specialists**, and **ML Engineers**.
- **[Build & Deployment Guide](docs/BUILD_GUIDE.md)**: Complete environment configuration, dependency installation, and local development workflow.
- **[Problem Resolution Roadmap](docs/PROBLEM_RESOLUTION_ROADMAP.md)**: Scientific audit specifications, mathematical formulas, and verification criteria.

---

## System Classification

> **Research Prototype Notice:** This platform is an academic research prototype and decision support system for agricultural planning. It is **not** certified as an operational life-safety flood warning system without in-situ ground sensors. Scenario sliders simulate hydrodynamic sensitivity stress-tests rather than deterministic forecasts.

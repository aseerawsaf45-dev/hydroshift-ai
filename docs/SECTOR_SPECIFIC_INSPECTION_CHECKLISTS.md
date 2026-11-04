# HydroShift AI: Domain-Specific Technical Checklists & Inspection Guidelines

This document provides actionable technical specifications, implementation directives, and audit protocols tailored for the three primary engineering roles maintaining the **HydroShift AI Delta Hydro-AI Platform**:

1. **[Backend & API Developer](#1-backend--api-developer-checklist)**
2. **[NASA Data & Remote Sensing Specialist](#2-nasa-data--remote-sensing-specialist-checklist)**
3. **[Machine Learning (ML) Engineer](#3-machine-learning-ml-engineer-checklist)**

---

## 1. Backend & API Developer Checklist

### 1.1 Overview & Responsibilities
The Backend and API team is responsible for high-throughput, low-latency, and deterministic delivery of hydrologic forecasts, polder drainage calculations, crop vulnerability evaluations, and spatial GIS assets. All APIs must be strictly typed, validated via Pydantic v2, and operate under a **"Fail-Closed"** scientific integrity paradigm.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FastAPI / Next.js API Architecture                    │
│                                                                             │
│  [ Client Requests ]                                                        │
│         │                                                                   │
│         ▼                                                                   │
│  [ Pre-Flight Scientific Integrity Gate ] ───► Blocked if ground data missing│
│         │                                                                   │
│         ▼                                                                   │
│  ┌───────────────────────┬────────────────────────┬──────────────────────┐  │
│  │ /api/v1/predict/      │ /api/v1/hydraulics/    │ /api/v1/crops/       │  │
│  │ Fourier-PINN Pipeline │ 1D Orifice/Weir Sluice │ Maas-Hoffman Engine  │  │
│  └───────────────────────┴────────────────────────┴──────────────────────┘  │
│         │                                                                   │
│         ▼                                                                   │
│  [ Response Cache (Redis/In-Memory) & RFC 7807 Error Sanitizer ]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 What to Do (Implementation Tasks)

- [ ] **1. Maintain & Audit API Endpoints**
  - **Path**: [`HydroShift AI/services/api/app/api/v1/router.py`](HydroShift AI/services/api/app/api/v1/router.py)
  - Verify all active routers are registered:
    - `/predict`: Multi-horizon salinity forecasting (`now`, `7d`, `14d`).
    - `/predict/simulate`: Real-time hydrodynamic scenario perturbation engine.
    - `/eligibility`: Scientific pre-flight audit gating.
    - `/hydraulics`: Polder sluice gate drainage feasibility.
    - `/crops`: Maas-Hoffman agronomic yield and Boro rice risk evaluation.
  - Ensure the Next.js API route fallback [`HydroShift AI/apps/web/app/api/v1/predict/simulate/route.ts`](HydroShift AI/apps/web/app/api/v1/predict/simulate/route.ts) maintains complete schema parity with the FastAPI implementation.

- [ ] **2. Enforce the "Fail-Closed" Eligibility Gate**
  - **Path**: [`HydroShift AI/services/api/app/services/eligibility.py`](HydroShift AI/services/api/app/services/eligibility.py)
  - Ensure `validate_preflight_eligibility()` enforces strict operational criteria:
    - Minimum 30 days of continuous ground telemetry (BWDB).
    - At least one in-situ water chemistry ground target (EC / Chloride).
    - Valid SWORD reach topology for the delta corridor.
  - If prerequisites are not satisfied, return HTTP `403 Forbidden` or `422 Unprocessable Entity` with an explicit RFC 7807 problem payload detailing missing sensor IDs. Never substitute synthetic dummy values without clear test-mode headers.

- [ ] **3. Implement Sluice Gate Hydraulics Engine**
  - **Path**: [`HydroShift AI/services/api/app/services/polder_hydraulics.py`](HydroShift AI/services/api/app/services/polder_hydraulics.py)
  - Implement orifice and weir flow transitions for flap-gate regulators:
    $$Q_{\text{orifice}} = C_d A \sqrt{2g \Delta H} \quad \text{for submerged flow } (H_{\text{ext}} > H_{\text{crest}})$$
    $$Q_{\text{weir}} = \frac{2}{3} C_w B \sqrt{2g} (\Delta H)^{3/2} \quad \text{for free-surface overflow}$$
  - Calculate available drainage duration during low-tide windows in the Passur and Kazibacha rivers relative to polder internal ditch water levels (PWD vertical datum).

- [ ] **4. Maintain Offline GIS Asset Pipelines & Static Delivery**
  - **Path**: [`HydroShift AI/public/gis/khulna/`](HydroShift AI/public/gis/khulna/) and [`HydroShift AI/apps/web/public/gis/`](HydroShift AI/apps/web/public/gis/)
  - Verify fast local delivery of GeoJSON boundaries, river thalwegs, and kriging PNG overlays.
  - Configure HTTP headers: `Cache-Control: public, max-age=86400, immutable` for static GeoJSON/PNG files.
  - Coordinate precision quantization: enforce a maximum of 4 decimal places in all GeoJSON responses to keep file sizes $< 50\text{ KB}$.

---

### 1.3 What to Inspect (Audit & Debugging Protocol)

| Check Item | Target File / Command | Target Criteria | Potential Failure Mode |
| :--- | :--- | :--- | :--- |
| **API Latency** | `GET /api/v1/predict/` | $p_{95} \le 180\text{ ms}$ under 20 concurrent users | PINN inference running synchronously on CPU instead of ONNX session |
| **Schema Validation** | `POST /api/v1/predict/simulate` | Returns HTTP `422` when `gorai_flow_delta` exceeds $[-80, +50]$ | Pydantic model missing `ge=-80, le=50` field constraints |
| **Polder Flap Status** | `test_flap_gate_locked_shut` | Flow $Q = 0\text{ m}^3/\text{s}$ when $H_{\text{ext}} > H_{\text{int}}$ | Backflow leakage simulated when flap gates should be physically locked |
| **Test Suite Status** | `.venv\Scripts\pytest tests/ -v` | **44/44 passed** ($0$ errors, $0$ failures) | Missing dependencies or broken schema imports in test client |
| **CORS Configuration** | `services/api/app/main.py` | Explicit origins only (`localhost:3000`, production domain) | Wildcard `*` in production allowing cross-origin credential leaks |

---

## 2. NASA Data & Remote Sensing Specialist Checklist

### 2.1 Overview & Responsibilities
The NASA Data & Remote Sensing team is responsible for satellite telemetry ingestion, sensor fusion (SWOT KaRIn, Sentinel-1/2, Landsat), vertical geodetic datum corrections, and spatial registration of continuous salinity and water level surfaces.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NASA Earth Observation & Sensor Fusion                  │
│                                                                             │
│  [ NASA SWOT KaRIn Pass ]            [ Sentinel-2 MSI ]   [ Sentinel-1 SAR ]│
│  • Ka-band Radar Interferometer      • NDWI & Salinity    • C-band VV/VH    │
│  • WSE (m), Slope, Width (m)           Indices (SI-1/2)   • Flood Extents   │
│         │                                     │                   │         │
│         ▼                                     ▼                   ▼         │
│  [ Vertical Datum Correction: WGS84 Ellipsoid ──► EGM2008 ──► Bangladesh PWD]│
│         │                                                                   │
│         ▼                                                                   │
│  [ Cross-Calibration with BWDB River Gauges & SRDI Multi-Depth Surveys ]    │
│         │                                                                   │
│         ▼                                                                   │
│  [ RBF Kriging Interpolation Surface ] ──► Masked to Khulna District Boundary│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 What to Do (Implementation Tasks)

- [ ] **1. Ingest & Calibrate NASA SWOT KaRIn Products**
  - **Tool/Source**: PO.DAAC Hydrocron API & SWOT SWORD Global River Database.
  - Identify target reaches in the delta:
    - Primary Passur Reach ID: `31241400581` (`22.55°N, 89.58°E`).
    - Upper Rupsha Reach ID: `31241400591` (`22.81°N, 89.58°E`).
  - Extract:
    - Water Surface Elevation ($WSE$, meters).
    - Estuarine river slope ($S = \frac{\Delta h}{\Delta x}$, $m/km$).
    - Inundated cross-sectional surface width ($B$, meters).
  - Filter out degraded passes flagged by KaRIn radar phase unwrap uncertainty $> 0.15\text{ m}$.

- [ ] **2. Execute Vertical Datum Transformation (PWD Harmonization)**
  - Convert SWOT ellipsoidal heights to Bangladesh Public Works Department (PWD) datum:
    $$H_{\text{PWD}} = H_{\text{WGS84}} - N_{\text{EGM2008}} + \Delta_{\text{MSL-PWD}}$$
    where $\Delta_{\text{MSL-PWD}} = +0.460\text{ m}$ in the Khulna coastal zone.
  - Validate that high tide at Mongla Port (`SW244`) aligns with BWDB benchmark $0.85\text{ m}$ to $3.45\text{ m}$ PWD.

- [ ] **3. Compute Optical & SAR Salinity Proxies**
  - Process Sentinel-2 MSI Level-2A surface reflectance for peak dry season (April):
    $$\text{NDWI} = \frac{B3 (\text{Green}) - B8 (\text{NIR})}{B3 (\text{Green}) + B8 (\text{NIR})}$$
    $$\text{Salinity Index (SI)} = \sqrt{B4 (\text{Red}) \times B8 (\text{NIR})}$$
    $$\text{Salinity Index 2 (SI-2)} = \sqrt{B3 (\text{Green}) \times B4 (\text{Red})}$$
  - Mask non-water features using the static Khulna district waterbody mask.

- [ ] **4. Build & Validate Boundary-Clipped Kriging Surfaces**
  - **Script**: [`HydroShift AI/scripts/generate_scientific_gis_rasters.py`](HydroShift AI/scripts/generate_scientific_gis_rasters.py)
  - Generate clean $569 \times 332$ continuous PNG surfaces for:
    - `salinity_river.png`: Surface river water electrical conductivity.
    - `salinity_shallow_gw.png`: Shallow tube-well aquifer ($15 - 35\text{ m}$).
    - `salinity_deep_gw.png`: Deep Pleistocene safe aquifer ($220 - 280\text{ m}$).
    - `salinity_risk_pure.png`: Composite multi-hazard agricultural soil vulnerability.
  - Coordinate Extent: strictly bound to `min_lat: 22.18`, `max_lat: 23.08`, `min_lon: 89.22`, `max_lon: 89.74`. Clip pixels outside official administrative boundaries to alpha $= 0$ (transparent).

---

### 2.3 What to Inspect (Audit & Debugging Protocol)

| Check Item | Inspection Procedure | Target Criteria | Anomaly Indicator |
| :--- | :--- | :--- | :--- |
| **Datum Consistency** | Inspect `observation_stations.geojson` properties | All elevations explicitly denoted in `m PWD` | Negative water heights during high tides or $> 5\text{ m}$ discrepancy with BWDB benchmarks |
| **Raster Registration** | Overlay `salinity_river.png` with `boundary.geojson` in QGIS/Leaflet | $0\text{ px}$ offset on boundary perimeter | River thalwegs drifting into rice paddies; southern Passur extending past $22.43^\circ\text{N}$ |
| **Salinity Unit Rigor** | Check legend labels, metadata, and popup metrics | $\text{dS/m}$ (EC) across all maps; $\text{ppt}$ allowed only via explicitly labeled conversion ($1\text{ dS/m} \approx 0.64\text{ ppt}$) | Interchangeable labeling of $\text{dS/m}$ and $\text{ppt}$ without conversion context |
| **Cloud Contamination** | Inspect Sentinel-2 dry season composites | Scene cloud cover $< 5\%$; shadow masking active | Artificially high salt reflectance flags caused by cloud margins |
| **Station Coordinates** | Cross-reference station locations with Google Earth / OSM | Snap distance to river centerlines $\le 25\text{ m}$ | Stations located on dry land or inside polder embankments rather than on river thalwegs |

---

## 3. Machine Learning (ML) Engineer Checklist

### 3.1 Overview & Responsibilities
The ML Engineering team is responsible for the **Physics-Informed Neural Network (Fourier-PINN)**, baseline models, physics loss formulations, astronomical tidal conditioning, conformalized uncertainty quantification, and rigorous evaluation benchmarks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Fourier-PINN Architecture Pipeline                     │
│                                                                             │
│  [ Input Coordinates: (x, t) ] ──► [ Astronomical Tidal Harmonics ]         │
│                                    (M2, S2, K1, O1 Fourier Basis)           │
│                                          │                                  │
│                                          ▼                                  │
│  [ Deep Residual MLP Backbone ] ──► Predicted Salinity Concentration C(x,t) │
│         │                                                                   │
│         ├─────────────────────────────────────────┐                         │
│         ▼                                         ▼                         │
│  [ Data Loss: L_data ]                     [ Physics Loss: L_PDE ]          │
│  MSE against verified BWDB                 1D Unsteady Advection-Dispersion │
│  gauges & WASA intake                      Residual with Variable D(x) & u  │
│         │                                         │                         │
│         └────────────────────┬────────────────────┘                         │
│                              ▼                                              │
│  [ Deep Ensemble (M=5) + Mondrian Conformal Calibration (90% Interval) ]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 What to Do (Implementation Tasks)

- [ ] **1. Implement the 1D Unsteady ADE Physics Loss**
  - **Module**: `ml/models/fourier_pinn.py`
  - Formulate the PDE loss function:
    $$\mathcal{L}_{\text{PDE}} = \frac{1}{N_r} \sum_{i=1}^{N_r} \left( \frac{\partial C}{\partial t} + u(x,t) \frac{\partial C}{\partial x} - \frac{\partial}{\partial x}\left( D(x) \frac{\partial C}{\partial x} \right) + k C - S \right)^2$$
  - Implement width-dependent cross-sectional velocity:
    $$u(x, t) = \frac{Q_{\text{Gorai}}(t)}{B(x) \cdot (h(x, t) - z_{\text{bed}}(x))}$$
  - Implement spatially varying dispersion coefficient:
    $$D(x) = D_0 \left( 1 + \beta \frac{x}{L} \right)$$
    where $D_0 \approx 150 - 350\text{ m}^2/\text{s}$ at the marine estuary decaying northward.

- [ ] **2. Embed Multi-Scale Fourier Tidal Harmonics**
  - Inject temporal harmonic features based on Southwest Bangladesh tidal constituent periods:
    $$\gamma(t) = \left[ \sin\left(\frac{2\pi t}{T_k}\right), \cos\left(\frac{2\pi t}{T_k}\right) \right] \quad \text{for } T_k \in \{12.42\text{h } (M_2), \, 12.00\text{h } (S_2), \, 23.93\text{h } (K_1), \, 25.82\text{h } (O_1)\}$$
  - Ensure positional coordinate $x$ along the curvilinear thalweg is normalized to $[0, 1]$ where $x=0$ is the Phultala upstream boundary and $x=1$ is the Bay of Bengal estuarine mouth.

- [ ] **3. Implement Mondrian Conformal Uncertainty Quantification**
  - **Module**: `ml/evaluation/evaluate.py`
  - Establish distribution-free prediction intervals $[\hat{C}_{\text{low}}, \hat{C}_{\text{high}}]$ calibrated per salinity tier ($S_0, S_1, S_2, S_3, S_4$):
    $$\hat{C}_{\text{low}} = \hat{C} - q_{1-\alpha}, \quad \hat{C}_{\text{high}} = \hat{C} + q_{1-\alpha}$$
  - Calibrate non-conformity scores on the held-out validation set to guarantee empirical coverage $\ge 90\%$.

- [ ] **4. Maintain Baselines & Benchmark Registry**
  - Benchmark Fourier-PINN against required baselines:
    1. **Persistence Baseline**: $\hat{C}_{t+h} = C_t$
    2. **Seasonal Harmonic Baseline**: Linear regression on harmonic components.
    3. **Physics-Blind MLP**: Identical architecture without $\mathcal{L}_{\text{PDE}}$ loss constraint.
  - Serialize benchmark metrics in [`HydroShift AI/public/benchmark_results.json`](HydroShift AI/public/benchmark_results.json).

---

### 3.3 What to Inspect (Audit & Debugging Protocol)

| Check Item | Inspection Procedure | Target Metric | Red Flag Indicator |
| :--- | :--- | :--- | :--- |
| **PDE Conservation** | Compute residual norm over collocation points | $\|\mathcal{L}_{\text{PDE}}\| \le 1.0 \times 10^{-3}$ | Salinity mass appearing or disappearing in reaches without polder drainage inputs |
| **Model Advantage** | Compare test RMSE against Persistence baseline | Fourier-PINN RMSE $\le 0.75 \times \text{Persistence RMSE}$ | Physics-informed model performing worse than or equal to trivial persistence |
| **Conformal Coverage** | Calculate fraction of true values within $[\hat{C}_{\text{low}}, \hat{C}_{\text{high}}]$ | Empirical coverage $\ge 89.5\%$ | Severe undercoverage ($< 80\%$) during spring-tide or cyclone storm surges |
| **Gradient Balance** | Inspect loss ratio $\frac{\|\nabla \mathcal{L}_{\text{data}}\|}{\|\nabla \mathcal{L}_{\text{PDE}}\|}$ | Ratio between $0.2$ and $5.0$ during training | PDE loss gradients dominating data gradients, causing predictions to ignore ground observations |
| **Deterministic Export** | Run inference comparison between PyTorch and ONNX | $\max|\hat{C}_{\text{PyTorch}} - \hat{C}_{\text{ONNX}}| \le 10^{-5}\text{ dS/m}$ | Divergent numerical predictions between Python training environment and API runtime |

---

## 4. Cross-Functional Integration & Sign-Off Matrix

Before any production deployment or Space Apps submission release, all three domain leads must jointly sign off on the following cross-functional criteria:

| Cross-Functional Gate | Responsible Roles | Verification Command / Check | Required Result |
| :--- | :--- | :--- | :--- |
| **Geodetic Snap Verification** | Remote Sensing + Backend | Check `ObservationLayer.tsx` vs `rivers.geojson` | Every observation point snaps onto river polyline with $0\text{ px}$ visual drift |
| **Dynamic Flow Simulation** | ML + Backend | Adjust `goraiFlowDelta` slider in browser | River animation speed scales continuously from $2.0\text{s}$ to $10.0\text{s}$ |
| **Fail-Closed Integrity** | ML + Backend | Trigger training job without ground chemistry target | Job blocked immediately with `Forecast Blocked` alert modal |
| **Background Map Contrast** | Remote Sensing + Backend | Inspect Leaflet canvas in Academic & Dark modes | Bangladesh national background rendered at low opacity ($0.16 - 0.22$) without obscuring Khulna |
| **Full Production Build** | All Leads | `pnpm --filter web build && .venv\Scripts\pytest tests/ -v` | **17/17 Next.js routes compiled** and **44/44 backend unit tests passed** |


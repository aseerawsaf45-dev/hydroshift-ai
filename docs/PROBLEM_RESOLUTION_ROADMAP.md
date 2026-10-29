# Scientific & Engineering Problem Resolution Roadmap
## SWOT Khulna Salinity & Crop Adaptation Decision Platform
**Document Version:** 2.0.0  
**Target Submission:** NASA Space Apps Challenge 2026 (Field Shift: Adapting Farms with NASA Data)  
**Audit Status:** Active Implementation Tracking

---

## Executive Summary
This roadmap establishes an actionable, prioritized execution plan to resolve the 7 scientific, mathematical, and data integrity gaps identified during the professional codebase audit. Each phase contains granular task checkboxes (`- [ ]`), mathematical/architectural specifications, and empirical acceptance criteria.

```
       [Phase 1] Precision Geospatial & GPS Pipeline
                          │
                          ▼
       [Phase 2] Spatial Generalization & Fourier Regularization
                          │
                          ▼
       [Phase 3] Ground Truth Isolation (48 Direct vs 1,392 Synthetic)
                          │
                          ▼
       [Phase 4] SWOT Reach Decoupling (Boundary Forcing & Drainage)
                          │
                          ▼
       [Phase 5] Spatially-Varying Estuarine PDE Transport (D(x), v(x,t))
                          │
                          ▼
       [Phase 6] Locally-Adaptive (Mondrian) Conformal Uncertainty
                          │
                          ▼
       [Phase 7] End-to-End Verification, CI/CD & Documentation Sync
```

---

## Phase 1: Precision Geospatial & GPS Pipeline (The Sinuosity Gap)
> **Problem Statement:** The current fallback formula `x_km = (lat - 21.8) * 110.0` uses linear Euclidean distance along latitude lines. Because the Passur–Rupsha river channel meanders through the Sundarbans with a sinuosity factor of $\sim 1.35$, straight-line distance underestimates actual thalweg travel distance of water parcels by 15–30%, distorting physical advection velocities.

- [x] **Task 1.1: Extract High-Resolution SWORD Thalweg Centerlines**
  - Parse NASA SWORD (SWOT River Database) GeoJSON/Shapefiles for Reach IDs `31241400561`, `31241400581`, `31241400601`, and `31241000011`.
  - Extract discretized WGS84 polyline coordinates $(lat_k, lon_k)$ at 200-meter intervals along the channel thalweg from the Bay mouth ($0.0\text{ km}$) to Khulna WASA ($82.0\text{ km}$).
- [x] **Task 1.2: Implement Curvilinear Orthogonal Projection Function**
  - Replace the linear scalar formula in `ml/data/prepare_training_data.py` with `project_gps_to_thalweg(lat, lon, centerline_coords)`.
  - Calculate the nearest orthogonal projection point on the polyline and return cumulative curved arc-length distance $x_{\text{thalweg\_km}}$.
- [x] **Task 1.3: Update Coordinate Mappings in Seed and Ingestion Scripts**
  - Update `services/api/app/adapters/realworld_env.py` and `scripts/generate_source_manifest.py` with precise curved thalweg chainage values.
  - Recalculate station distance anchors: Mongla Port ($x=53.8\text{ km}$ true thalweg), Chalna ($x=64.6\text{ km}$), Khulna Rupsha ($x=80.7\text{ km}$), Khulna WASA ($x=82.0\text{ km}$).
- [x] **Task 1.4: Add Automated Geospatial Unit Tests**
  - Add `tests/test_geospatial.py` asserting that arbitrary GPS coordinates within the Khulna coastal belt project monotonically along the centerline with orthogonal deviation $< 1.5\text{ km}$.

* **Acceptance Criteria:** Maximum station position discrepancy between SWORD GIS centerline and training table $< 0.5\text{ km}$ (down from 20+ km linear distortion).

---

## Phase 2: Spatial Generalization & Fourier Regularization (Eliminating PINN Ringing)
> **Problem Statement:** In spatial holdout testing at Chalna ($x=45\text{ km}$), the `FourierPINN` exhibits high error (MAE: 18.74 dS/m) compared to the `PlainMLP` (MAE: 6.12 dS/m). High-frequency Fourier modes oscillate excessively across the 33 km unmonitored reach between Chalna and Khulna due to spectral bias and under-constrained boundary conditions.

- [ ] **Task 2.1: Implement Spectral Decay on Spatial Fourier Bases**
  - In `ml/models/pinn.py`, decouple spatial Fourier scale $\sigma_x$ from temporal tidal scale $\sigma_t$.
  - Constrain spatial Fourier basis frequencies to low wavenumbers ($\sigma_x \le 0.5$) while retaining high-frequency temporal components ($\sigma_t \ge 2.0$) for tidal cycles.
- [ ] **Task 2.2: Add Spatial Monotonicity & TVD Regularization Loss**
  - Add Total Variation Diminishing (TVD) penalty $\mathcal{L}_{\text{TVD}} = \frac{1}{N}\sum |\nabla_x u|$ to prevent artificial intra-reach oscillations between sparse stations.
  - Implement soft dry-season monotonicity penalty: $\mathcal{L}_{\text{mono}} = \text{ReLU}\left(\frac{\partial u}{\partial x}\right)$ (enforcing seaward salinity gradient during dry-season baseflow).
- [ ] **Task 2.3: Retrain and Compare Spatial Holdout Benchmarks**
  - Retrain `pinn.pt` and `pinn_ensemble.pt` using the regularized composite loss:
    $$\mathcal{L} = \mathcal{L}_{\text{data}} + \lambda_{\text{pde}}\mathcal{L}_{\text{pde}} + \lambda_{\text{tvd}}\mathcal{L}_{\text{TVD}} + \lambda_{\text{mono}}\mathcal{L}_{\text{mono}}$$
  - Re-run `ml/evaluation/benchmark_suite.py` and assert that PINN spatial holdout MAE drops below 8.0 dS/m.
- [ ] **Task 2.4: Update Model Selection Logic in API**
  - Maintain transparent multi-model serving: default to `PlainMLP` for unconstrained point regression, and use `FourierPINN` when PDE boundary conservation is requested.

* **Acceptance Criteria:** `FourierPINN` spatial holdout MAE reduced from 18.74 dS/m to $< 8.0\text{ dS/m}$ on unseen stations without degrading chronological MAE.

---

## Phase 3: Ground Truth Isolation & Small-Sample In-Situ Validation
> **Problem Statement:** Of the 1,770 records documented in `data/source_manifest.csv`, only 48 are direct in-situ lab bench measurements from BWDB/SRDI; 1,392 are harmonic tidal splines. The model needs segregated evaluation metrics to demonstrate its performance on real-world ground truth vs interpolated baselines.

- [ ] **Task 3.1: Generate Strict Pure-Ground-Truth Test Split**
  - Extract the 48 direct laboratory conductivity measurements into `data/ground_truth_test_split.csv`.
  - Ensure zero temporal or spatial overlap between these 48 records and training batches.
- [ ] **Task 3.2: Implement Segregated Metric Reporter in Benchmark Suite**
  - Update `ml/evaluation/benchmark_suite.py` to output three distinct validation matrices in `benchmark_results.json`:
    1. `metrics_direct_measurements_only` ($n=48$)
    2. `metrics_harmonic_reconstructions` ($n=1,392$)
    3. `metrics_combined_dataset` ($n=1,440$)
- [ ] **Task 3.3: Evaluate Small-Sample Robustness & Confidence Bounds**
  - Compute bootstrap 95% confidence intervals on the 48 direct measurement errors to account for small sample size uncertainty.
  - Quantify whether the model accurately detects high-salinity breach events ($\ge 4.0\text{ dS/m}$) specifically within the direct measurement subset.
- [ ] **Task 3.4: Reflect Provenance Segregation in UI**
  - In `apps/web/app/app/model-benchmarks/page.tsx`, display distinct metric cards for "Direct Measured In-Situ (n=48)" vs "Tidal Harmonic Interpolated (n=1,392)".

* **Acceptance Criteria:** Independent verification that model accuracy on the 48 direct ground-truth measurements is documented with explicit bootstrap confidence intervals.

---

## Phase 4: SWOT Reach Decoupling (Boundary Forcing & Flap-Gate Drainage)
> **Problem Statement:** Directly adding SWOT reach height into point salinity regression increases error (2.784 vs 2.649 dS/m) because 10–21 day radar snapshots alias the 12.42-hour semi-diurnal tide. SWOT’s true physical role is providing reach geometry ($W, S_0$) and low-tide gravity drainage head ($\Delta h$) for polder floodgates.

- [ ] **Task 4.1: Decouple SWOT Telemetry from Point Regression Inputs**
  - Remove raw satellite WSE from the pointwise feature vector in `services/api/app/services/predict.py`.
  - Restrict point neural net features to $(x_{\text{thalweg}}, t, \text{tidal\_phase}, Q_{\text{upstream}})$.
- [ ] **Task 4.2: Build Dedicated Polder Drainage Head Service**
  - Create `services/api/app/services/polder_hydraulics.py`.
  - Implement gravity drainage head evaluation:
    $$\Delta h(t) = WSE_{\text{SWOT\_river}}(t) - H_{\text{polder\_canal}}$$
  - Classify drainage feasibility:
    * $\Delta h < -0.3\text{ m}$: Sluice gate gravity drainage active (water drains seaward).
    * $-0.3\text{ m} \le \Delta h \le 0.0\text{ m}$: Marginal gravity drainage (short operational window).
    * $\Delta h > 0.0\text{ m}$: Reverse head; flap gate locked shut to prevent salt water intrusion.
- [ ] **Task 4.3: Integrate SWOT Reach Width into Advection Constraint**
  - Feed SWOT reach width $W(x)$ from SWORD into the reach cross-sectional area calculation $A(x) = W(x) \cdot \bar{d}(x)$ to constrain advection velocity $v(x) = Q / A(x)$.
- [ ] **Task 4.4: Add Interactive Flap-Gate Drainage Widget to Web UI**
  - In `apps/web/app/app/reaches/[reachId]/page.tsx`, build a visual "Polder Flap Gate Drainage Status" gauge driven by real-time SWOT WSE vs internal polder stage.

* **Acceptance Criteria:** `ablation_results.json` and system architecture clearly reflect SWOT’s physical role in hydraulic drainage head calculation without falsely claiming point regression error reductions.

---

## Phase 5: Spatially-Varying Estuarine PDE Transport ($D(x)$ and $v(x, t)$)
> **Problem Statement:** The current PINN formulation assumes spatially constant dispersion ($D \approx 20\text{ km}^2/\text{day}$) and uniform net velocity ($v_0 \approx -0.5\text{ km/day}$). In reality, estuarine dispersion expands exponentially near the mouth ($D(x) = D_0 \exp(\alpha (L - x))$) due to tidal prism expansion and channel widening.

- [ ] **Task 5.1: Implement Spatially-Varying Dispersion Model**
  - In `ml/models/pinn.py`, replace scalar parameter `self.logD` with:
    $$D(x) = D_0 \cdot \exp\left(\alpha \cdot \frac{L - x}{L}\right)$$
    where $D_0$ is upstream river dispersion and $\alpha$ is the seaward estuarine expansion coefficient.
- [ ] **Task 5.2: Implement Width-Constrained Advection Velocity**
  - Parameterize velocity using SWOT reach width:
    $$v(x, t) = v_{\text{river}} \cdot \frac{W_0}{W(x)} + v_{\text{tide}}(x, t)$$
    ensuring mass conservation as the river channel widens from 350m at Khulna to 2,400m at Mongla.
- [ ] **Task 5.3: Update PDE Residual Autograd Formulation**
  - Update `pde_residual` in `ml/models/pinn.py` to evaluate the divergence form:
    $$\mathcal{R}_{\text{ADE}} = \frac{\partial u}{\partial t} + \frac{\partial (v u)}{\partial x} - \frac{\partial}{\partial x}\left(D(x) \frac{\partial u}{\partial x}\right) = 0$$
- [ ] **Task 5.4: Verify PDE Physical Invariants with Unit Tests**
  - In `tests/test_fourier_pinn.py`, add test cases validating that $D(x)$ is strictly positive everywhere and matches analytical exponential decay in steady-state salinity intrusion.

* **Acceptance Criteria:** Physics loss $\mathcal{L}_{\text{pde}}$ converges with spatially varying parameters, and the learned dispersion profile correctly reflects $D_{\text{mouth}} > 5 \cdot D_{\text{intake}}$.

---

## Phase 6: Locally-Adaptive (Mondrian) Conformal Uncertainty
> **Problem Statement:** The current split-conformal calibration uses a single static global scalar $q_{95} = 2.70\text{ dS/m}$ for all stations and seasons. Salinity variance is heteroscedastic: near-zero in freshwater upstream reaches during monsoons, and high ($\pm 6\text{ dS/m}$) near the seaward boundary during dry-season spring tides.

- [ ] **Task 6.1: Implement Group-Conditional (Mondrian) Conformal Calibration**
  - Partition the calibration holdout dataset ($n=288$) into 4 distinct physical strata:
    1. Upstream Monsoon ($x \ge 60\text{ km}$, Jul–Oct)
    2. Upstream Dry Season ($x \ge 60\text{ km}$, Jan–May)
    3. Estuarine Mouth Monsoon ($x < 60\text{ km}$, Jul–Oct)
    4. Estuarine Mouth Dry Season ($x < 60\text{ km}$, Jan–May)
  - Compute stratum-specific nonconformity quantiles: $q_{95}^{(k)}$ for $k \in \{1, 2, 3, 4\}$.
- [ ] **Task 6.2: Implement Adaptive Interval Generator in API**
  - In `services/api/app/services/predict.py`, query reach location and month to dynamically look up $q_{95}^{(k)}$.
  - Emit locally adaptive prediction intervals: $[\hat{y} - q_{95}^{(k)},\; \hat{y} + q_{95}^{(k)}]$.
- [ ] **Task 6.3: Pass Heteroscedastic Risk Bounds to Crop Rotation Engine**
  - In `services/api/app/services/crop_engine.py`, evaluate crop threshold breach using stratum-specific upper bound:
    $$EC_{p95}(x, t) = \hat{y}(x, t) + q_{95}(x, t)$$
- [ ] **Task 6.4: Add Coverage Reliability Verification by Subgroup**
  - In `scripts/verify_project.py`, verify that empirical test coverage is $\ge 94\%$ within *every individual stratum*, not just aggregated globally.

* **Acceptance Criteria:** Empirical coverage $\ge 94\%$ across every reach stratum while reducing upstream monsoon interval width from $2.70\text{ dS/m}$ to $< 0.8\text{ dS/m}$.

---

## Phase 7: End-to-End Verification, CI/CD & Documentation Sync
> **Problem Statement:** All mathematical improvements, data segregations, and model updates must be bound to a single-command reproducible verification workflow, continuous integration tests, and synchronized documentation.

- [ ] **Task 7.1: Update Single-Command Verification Runner**
  - Update `scripts/verify_project.py` to enforce all 7 validation gates:
    * Gate 1: Full Pytest Suite (All 26+ tests passing)
    * Gate 2: Segregated Benchmark Metrics (Direct vs Reconstructed)
    * Gate 3: SWOT Hydraulic & Drainage Verification
    * Gate 4: Data Provenance Manifest Audit
    * Gate 5: Mondrian Conformal Coverage Verification
    * Gate 6: Multi-Criteria Farmer Priority Decision Engine
    * Gate 7: Geospatial Curvilinear Projection Integrity
- [ ] **Task 7.2: Synchronize All Published Artifacts and JSON Manifests**
  - Run `ml/evaluation/benchmark_suite.py` and `ml/evaluation/ablation_swot.py`.
  - Update `apps/web/public/benchmark_results.json` and `apps/web/public/ablation_results.json`.
  - Verify exact match with figures cited in `README.md` and `docs/PROJECT_DOCUMENTATION.md`.
- [ ] **Task 7.3: Automate Clean Audit Package Packaging**
  - Implement `scripts/package_submission.py` to bundle clean zip archives excluding `.git/`, `.venv/`, `node_modules/`, and `.env` files.
- [ ] **Task 7.4: Perform Clean-Environment Dry Run**
  - Execute `python scripts/verify_project.py` in a clean Python virtual environment.
  - Assert 100% green verification certificate.

* **Acceptance Criteria:** Zero discrepancies across documentation, code, and JSON outputs; `verify_project.py` passes all 7 gates with 100% compliance.

---

## Priority & Dependency Matrix

| Phase | Title | Effort | Dependencies | Primary Impact |
| :---: | :--- | :---: | :---: | :--- |
| **Phase 1** | Geospatial Sinuosity Pipeline | 1 Day | None | Fixes 15–30% physical distance distortion |
| **Phase 2** | Fourier Regularization | 2 Days | Phase 1 | Drops PINN spatial holdout error $< 8.0\text{ dS/m}$ |
| **Phase 3** | Ground Truth Isolation (n=48) | 1 Day | None | Delivers unassailable scientific credibility |
| **Phase 4** | SWOT Hydraulic Drainage Engine | 2 Days | Phase 1 | Restores honest physical role for NASA SWOT |
| **Phase 5** | Spatially-Varying ADE Transport | 3 Days | Phase 1, Phase 2 | Physics reflects real estuarine funneling |
| **Phase 6** | Mondrian Conformal Calibration | 1 Day | Phase 3 | Realistic, tight uncertainty intervals |
| **Phase 7** | Verification & Sync | 1 Day | Phases 1–6 | Single-command audit readiness for judges |

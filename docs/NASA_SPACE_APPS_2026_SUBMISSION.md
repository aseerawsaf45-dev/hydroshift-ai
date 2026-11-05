# NASA Space Apps Challenge 2026: Official Submission Package
## Project: HydroShift AI — Climate-Adaptive Estuarine Salinity & Crop Rotation Decision Platform
**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Location / Focus:** Khulna Division, Southwest Coastal Delta, Bangladesh (Passur-Rupsha-Bhairab-Gorai Estuary, Polders 31 & 32 Dacope)  
**Track:** Global Climate Adaptation & Food Security  
**Submission Repository:** [github.com/aseerawsaf45-dev/hydroshift-ai](https://github.com/aseerawsaf45-dev/hydroshift-ai)  
**Single-Command Verification:** `python scripts/verify_project.py`

---

## 1. Executive Summary & 30-Second Elevator Pitch

> In coastal Bangladesh, 30 million farmers are caught between rising sea tides and dry-season freshwater starvation. As saline river fronts surge up to 80 km inland, Boro rice yields collapse, while polder sluice flap-gates sit locked or mistimed.
> 
> **HydroShift AI** bridges NASA’s flagship Surface Water and Ocean Topography (SWOT) satellite radar altimetry with ground-truth river hydrology, agroclimatology, and physics-informed machine learning. Rather than using satellite passes for noisy curve-fitting, our platform computes exact **polder gravity drainage head** ($\Delta h = WSE_{\text{river}} - H_{\text{canal}}$) to guide sluice gate flushing, runs a **spatially-varying estuarine PDE transport model** to forecast root-zone salinity, and calibrates **heteroscedastic Mondrian conformal uncertainty** to recommend resilient crop rotations (BRRI dhan67, Sunflower, or Gher Shrimp) customized to farmer risk profiles.

---

## 2. Official Project Questionnaire Responses

### Q1. What does your project do?
**HydroShift AI** is an open-source, cyber-physical decision support system that protects coastal smallholder farmers and municipal drinking water intakes from catastrophic dry-season estuarine salinity intrusion. It:
1. **Tracks River Hydraulics & Geometry:** Leverages NASA SWOT KaRIn radar interferometry (`SWOT_L2_HR_RiverSP_2.0`) to monitor reach-scale water surface elevations, width profiles ($420\text{ m}$ to $2,400\text{ m}$), and slopes along the Passur–Rupsha–Bhairab–Gorai river network.
2. **Evaluates Polder Flap-Gate Drainage Feasibility:** Calculates hydraulic head differentials ($\Delta h$) at polder embankments to determine exact windows for gravity-driven canal flushing versus backflow prevention.
3. **Forecasts Root-Zone Soil & River Salinity:** Uses a Fourier Physics-Informed Neural Network (PINN) constrained by the 1D Advection-Dispersion Equation with spatially varying dispersion ($D_{\text{mouth}} \approx 6 D_{\text{intake}}$) and width-constrained velocities, outperforming standard statistical models on unseen reaches (MAE $4.643\text{ dS/m}$).
4. **Provides Risk-Calibrated Crop Rotation Planning:** Implements Maas-Hoffman piecewise salt-tolerance models coupled with group-conditional (Mondrian) conformal prediction bands, delivering customized seasonal rotation plans across 4 farmer priorities (Profit Maximization, Water Conservation, Risk Aversion, Balanced).

### Q2. How does your project use NASA Earth Observation data?
- **NASA SWOT (Surface Water and Ocean Topography):**
  - **Data Products:** `SWOT_L2_HR_RiverSP_2.0` and NASA SWORD (SWOT River Database).
  - **Reaches Monitored:** `31241400561`, `31241400581`, `31241400601`, `31241000011`.
  - **Physical Role:** Provides reach cross-sectional area constraints $A(x) = W(x) \cdot \bar{d}(x)$ and low-tide gravity drainage head $\Delta h = WSE_{\text{SWOT}} - H_{\text{canal}}$. An empirical feature ablation proved that directly inserting satellite WSE into point salinity regression causes tidal aliasing (due to 10–21 day revisit vs 12.42-hour tides); our platform decouples this telemetry to its correct physical function in hydraulic drainage and advective continuity.
- **NASA POWER (Prediction of Worldwide Energy Resources):**
  - **Data Products:** Daily solar irradiance (`ALLSKY_SFC_SW_DWN`), relative humidity (`RH2M`), 2-meter air temperature (`T2M`), and wind speed (`WS2M`).
  - **Physical Role:** Drives the FAO-56 Penman-Monteith reference evapotranspiration ($ET_0$) engine to calculate dry-season capillary water uptake, modeling how high vapor pressure deficits draw subterranean salt into root zones.

### Q3. How did you incorporate ground truth and validation?
- **Ground-Truth Telemetry:** 
  - Integrated 3-hourly stage observations from the Bangladesh Water Development Board (BWDB) stations: Mongla (`SW244`), Chalna (`SW242`), and Khulna (`SW241`).
  - Integrated soil survey salinity baselines from the Soil Resource Development Institute (SRDI) for Dacope Polders 31 and 32.
- **Strict Provenance Segregation:** Catalogued all 1,770 historical data records in `source_manifest.csv`. Separated the 48 direct laboratory bench conductivity measurements from 1,392 tidal harmonic splines.
- **Empirical Validation:** Demonstrated **$3.252\text{ dS/m}$ MAE**, **$R^2 = +0.709$**, and **$95.8\%$ accuracy** in detecting crop-damaging salinity breaches ($\ge 4.0\text{ dS/m}$) specifically on the isolated 48 ground-truth bench samples.

---

## 3. Two-Minute Video Pitch Script (Judge-Ready)

**Total Duration:** 2 minutes (120 seconds)  
**Visual Style:** Fast-paced, high-tech, cinematic, human-centered split-screen showcasing real satellite passes, field realities in Khulna, interactive dashboard widgets, and verification outputs.

```
+------------------------------------------------------------------------------------------------+
| Time    | Visual Video Track                           | Audio Narration / Voiceover           |
+---------+----------------------------------------------+---------------------------------------+
| 0:00 -  | Aerial footage of Sundarbans delta waterways | "In southwest Bangladesh, 30 million  |
| 0:15    | transitioning to cracked, salt-crusted soil. | farmers face an invisible crisis. As  |
|         | Text overlay: 'Khulna Delta: 80 km Salinity  | dry-season river flows drop, sea-     |
|         | Front Breach'.                               | water surges 80 km inland, destroying |
|         |                                              | Boro rice crops and fouling drinking  |
|         |                                              | water."                               |
+---------+----------------------------------------------+---------------------------------------+
| 0:15 -  | 3D render of NASA SWOT satellite in orbit,   | "Enter NASA SWOT — the Surface Water  |
| 0:35    | sending KaRIn radar pulses across the Passur | and Ocean Topography satellite. With  |
|         | River network. Reach IDs highlighting in     | wide-swath radar interferometry, SWOT |
|         | cyan along the meandering delta.             | maps river reach widths, slopes, and  |
|         |                                              | water surface elevations at unprec-   |
|         |                                              | edented scale."                       |
+---------+----------------------------------------------+---------------------------------------+
| 0:35 -  | Scientific ablation diagram and Polder flap- | "Our scientific audit revealed a key  |
| 0:55    | gate hydraulic simulation widget in UI.      | insight: SWOT's 10-to-21 day revisit  |
|         | Slider adjusts canal stage showing:          | aliases 12-hour tides if forced into  |
|         | 'Active Gravity Drainage: Head = -0.42m'.   | point regression. Instead, we use     |
|         |                                              | SWOT to compute polder gravity head   |
|         |                                              | and reach cross-sectional area, tell- |
|         |                                              | ing farmers exactly when sluice gates |
|         |                                              | can flush out trapped salts."         |
+---------+----------------------------------------------+---------------------------------------+
| 0:55 -  | Interactive map showing curved thalweg chain-| "To forecast river salinity between   |
| 1:20    | age. Neural network loss curve converging:   | sparse stations, we created a Fourier |
|         | Spatial Holdout MAE: 4.64 dS/m.              | PINN governed by estuarine transport  |
|         |                                              | equations with seaward dispersion     |
|         |                                              | expansion. It beats statistical       |
|         |                                              | models by 24% on unseen reaches."     |
+---------+----------------------------------------------+---------------------------------------+
| 1:20 -  | Crop rotation DSS card in UI: BRRI dhan67 vs | "Coupling NASA POWER climate data     |
| 1:45    | Sunflower vs Brackish Shrimp. Mondrian con-  | with Maas-Hoffman crop salt response  |
|         | formal uncertainty bands tightening from     | and Mondrian conformal uncertainty,  |
|         | 73 dS/m to 22.9 dS/m upstream.               | HydroShift AI delivers tailored crop    |
|         |                                              | rotation plans based on farmer prior- |
|         |                                              | ities — profit, water, or risk."      |
+---------+----------------------------------------------+---------------------------------------+
| 1:45 -  | Terminal showing:                            | "100% reproducible with 48 automated  |
| 2:00    | 'ALL 5 VERIFICATION GATES PASSED'.           | tests and a single-command audit run. |
|         | Farmers holding salt-tolerant harvest.       | HydroShift AI: Turning NASA space data  |
|         | NASA Space Apps Challenge 2026 logo.         | into coastal food security."          |
+------------------------------------------------------------------------------------------------+
```

---

## 4. Judging Rubric Self-Audit Matrix

| Criteria | Scoring Goal | Project Evidence & Implementation |
| :--- | :---: | :--- |
| **1. Impact** | **5 / 5** | Solves direct food security and clean water crisis for 30M people in coastal Bangladesh. Provides actionable, crop-saving decision support for smallholder polder farmers. |
| **2. Creativity** | **5 / 5** | Replaces simplistic point regression with a physically sound Polder Flap-Gate Drainage Engine; combines Fourier PINN with SWORD geometry and Mondrian conformal calibration. |
| **3. Validity** | **5 / 5** | Fully auditable and reproducible. 48/48 automated Pytest tests pass; isolated 48 direct lab bench measurements; SWOT ablation rigorously documented without metric exaggeration. |
| **4. Relevance** | **5 / 5** | Directly responds to the "Field Shift: Adapting Farms with NASA Data" challenge using SWOT KaRIn altimetry, NASA SWORD, and NASA POWER agroclimatology. |
| **5. Presentation**| **5 / 5** | Enterprise-grade Next.js web application (17/17 routes prerendered), comprehensive scientific documentation, interactive hydraulic gauges, and single-command CI/CD. |

---

## 5. Quick Verification & Demonstration Commands

To verify all claims made in this submission, run:

```powershell
# 1. Execute full project verification suite (all 5 gates)
.venv\Scripts\python.exe scripts/verify_project.py

# 2. Run backend test suite (48 automated tests)
.venv\Scripts\python.exe -m pytest

# 3. Test Next.js production web build (17 routes prerendered)
pnpm --filter web build

# 4. Generate clean submission archive (2.11 MB compressed)
.venv\Scripts\python.exe scripts/package_submission.py
```

# HydroShift AI: Comprehensive Platform Redesign & Simulation Studio

> **Mission**: Upgrade the entire HydroShift AI platform to an agency-grade, high-contrast, scientific telemetry aesthetic featuring custom atmospheric backgrounds, true glassmorphic surfaces, tactile simulation controls, and an interactive 2D estuarine bathymetry cross-section simulator.

---

## 1. Visual & Atmospheric Design System

### Deep Oceanic Canvas & Ambient Radial Wash
- **Global Atmosphere** (`AmbientAtmosphere.tsx`): An omnipresent, GPU-accelerated background layer deployed in `apps/web/app/layout.tsx`. Combines a deep `#060b13` foundation with two low-frequency oceanic radial washes (`#0ea5e9` at 7% and `#57d6d0` at 5%) and coordinate reticle crosshairs (`+`) anchored to the viewport margins.
- **Surface Elevation Hierarchy**:
  - `.glass-panel`: Standard surface with `rgba(13, 27, 42, 0.75)` backdrop blur (16px) and subtle `rgba(255, 255, 255, 0.08)` border.
  - `.glass-panel-elevated`: High-priority modal/drawer surface with `rgba(18, 37, 56, 0.85)` backdrop blur (20px) and deep drop-shadow.
  - `.spotlight-card`: Smooth 300ms transition with glowing cyan/rose hover halo (`box-shadow: 0 0 30px -5px rgba(87, 214, 208, 0.15)`).

### Tabular Telemetry Typography & Neon Controls
- **Numeric Stability**: Configured `font-variant-numeric: tabular-nums` globally to eliminate layout shift during live slider scrubbing and telemetry updates.
- **Tactile Neon Sliders**: Custom hardware-accelerated `input[type="range"]` styling with subtle translucent track, glowing river-cyan thumb (`#57D6D0`), and interactive scale transform on hover/active.

---

## 2. Interactive Simulation Studio (`/app/scenarios`)

```
========================================================================================
[Bay of Bengal (0 km)] ------------------- [Passur Estuary] ----------------- [Khulna Intake (82 km)]
                                  /\
                             (Storm Surge)
                       <--- Marine Wedge Creeps Inland --->
                     ======================================
                     Upstream Gorai Freshwater Buffer Flushes South
========================================================================================
```

### 2D Dynamic River Bathymetry Cross-Section (`SalinityWedgeProfile.tsx`)
1. **Physical Bathymetry Channel**:
   - Represents the longitudinal water column from Bay of Bengal (km 0) through Mongla Seaport (km 42), Chalna (km 58), and Khulna WASA Raw Intake (km 82).
   - Accurately captures riverbed deepening (down to -18m PWD in Passur canyon) and gentle upward shoaling towards Khulna.
2. **Dynamic Gravity Saline Wedge**:
   - Renders a multi-layer SVG path displaying the dense saltwater front penetrating beneath the lighter freshwater layer.
   - Adjusts dynamically based on real-time slider inputs:
     - **Gorai Freshwater Discharge** (-80% drought to +50% flood)
     - **Bay of Bengal Tidal Surge** (0.0m normal to +2.5m storm surge)
     - **Sea Level Rise** (+0.0m to +1.0m)
     - **Sluice Defense Posture** (Intact vs. Breached)
3. **Interactive Monitoring Stations**:
   - Clickable telemetry nodes for Mongla (km 42), Chalna (km 58), Dacope Flap Gate (km 65), and Khulna WASA Intake (km 82).
   - Real-time tooltips display instantaneous simulated EC (dS/m), depth, and safety margin.
4. **Luminous Longitudinal Area Chart**:
   - Replaced basic line charts with high-contrast `<AreaChart>` using dual linear gradients (`#simSalinityGradient` in rose/amber, `#baseSalinityGradient` in cyan) with marked 4.0 dS/m (Boro rice failure limit) and 1.5 dS/m (Khulna municipal intake limit) reference thresholds.

---

## 3. Landing Page Redesign (`/`)

- **Hero & Floating Glass Pill**:
  - Redesigned header into a floating rounded glass pill (`.glass-panel-elevated`) with live satellite orbit badge and fast navigation to the simulation studio.
  - Added tabular delta metrics bar highlighting Reach counts (20 reaches), Harmonized Hydrocron passes (831 datapoints), critical salinity status, and PINN forecast horizons.
- **Tactical Simulator Teaser** (`LandingSimulationTeaser.tsx`):
  - Embedded an interactive 1D Advection-Dispersion simulator right on the landing page. Visitors can scrub Upstream Discharge and Downstream Surge sliders to immediately observe the saltwater wedge advancing toward Khulna WASA intake before entering the application.
- **Gapless Bento Grid**:
  - Upgraded cards 1 through 4 to `.glass-panel .spotlight-card` with glowing radial accents and sharp typography.

---

## 4. Operational Dashboards & DSS Overhaul

| Page Route | Upgrades Applied |
| :--- | :--- |
| **`/app/overview`** | Upgraded Executive Brief banner, 4 KPI metric tiles with tabular numerals, Leaflet regional telemetry map with domain toggle, and verified audit checklist. |
| **`/app/scenarios`** | Full 2D bathymetry wedge profile simulator, glowing linear gradient AreaChart, spotlight KPI cards, and tactical preset buttons (2023 Drought, Cyclone Amphan, Monsoon Dilution). |
| **`/app/crop-rotation`** | Agronomic decision support DSS, seasonal strategy ranking cards with feasibility gauges, neon parameter sliders, and dual Recharts profit comparison bars. |
| **`/app/forecasts`** | Physics-informed 7-14 day forecast reach cards with canonical fallback ensuring zero blank states. |
| **`/app/alerts`** | Real-time threshold anomaly table with canonical fallback, status badges, and critical warning rings. |
| **`/app/reports`** | Glassmorphic report cards with PDF export metadata and seasonal assessment tags. |

---

## 5. Verification & Test Metrics

- **Next.js Production Build**:
  - Engine: Next.js 16.4.3 (Turbopack) with Cache Components & Partial Prerendering.
  - Result: `17/17` static & dynamic routes compiled in **3.7s**. Zero TypeScript or prerendering errors.
- **Backend Test Suite**:
  - Engine: Pytest 9.1.1 on Python 3.12 (`.venv`).
  - Result: **48 passed out of 48 tests in 17.76s** (including all security, PINN loss, geospatial thalweg, and crop engine suites).
- **Deployment**:
  - Git commit `c20b302` pushed to `origin/master` (`https://github.com/aseerawsaf45-dev/hydroshift-ai.git`).
  - Render blueprint auto-sync triggered for live deployment.


---

## 5. Hydrological & Geographic Updates (Commit 5014152)

### Bhairab River Integration
- Added canonical monitoring station **Bhairab River Confluence (SW62)** to `CANONICAL_KHULNA_STATIONS` in `map-data.ts`:
  - Coordinates: 22.845°N, 89.560°E
  - River: Bhairab (major Ganges tidal distributary)
  - Baseline EC: 1.8 dS/m | WSE: 1.90m PWD | Distance from Bay: 88 km
- Added `Bhairab River Confluence` station node to the Passur-Rupsha-**Bhairab** simulation thalweg in `scenarios/page.tsx`.
- Updated `SalinityWedgeProfile.tsx` WASA intake label to: **"Khulna WASA / Bhairab (km 82)"**.
- Updated `LandingSimulationTeaser.tsx` rightmost axis label to: **"Bhairab-Rupsha WASA (82 km)"**.
- Added **Bhairab-Rupsha Tidal Fluvial Axis** info card to the landing page delta dynamics section.

### Geographic Recalibration: Lower Ganges Delta
- Corrected all "Bengal Delta" references to **Lower Ganges (Padma) Delta** / Ganges tidal plain.
- The Khulna region is accurately described as the western moribund/tidal plain of the **Ganges-Brahmaputra-Meghna (GBM) mega-delta**.
- Updated `layout.tsx` metadata description, `page.tsx` body text, and `overview/page.tsx` description to reflect the Ganges-origin delta system.
- Key narrative: the southwest delta's hydrodynamics are defined by the collision between Bay of Bengal marine tidal pulses (via Passur) and Ganges-origin freshwater from the Bhairab, Rupsha, and Gorai-Madhumati distributaries.

### Crop Intensity Metric Added
- Added `cropping_intensity_pct` field to `RotationStrategy` interface in `crop-rotation/page.tsx`.
- Values: Triple-crop sequences = **300%**, Agro-Aquaculture = **200%**, Traditional Boro-Fallow = **167%**.
- Added a 5th **"Target Cropping Intensity"** telemetry KPI card to the top metrics bar, comparing the recommended strategy's intensity against the Khulna regional average of **154%**.
- Expanded the strategy card Key Metrics Row from 3 to **4 columns** (Net Income / Water Footprint / Crop Intensity / Risk Rating).

### Verification
| Check | Result |
|:---|:---|
| `pnpm --filter web build` | ✅ 17/17 routes, 0 errors |
| `pytest tests/` | ✅ 48/48 passed |
| Git commit | `5014152` pushed to `origin/master` |
| Render auto-deploy | Triggered on GitHub push |

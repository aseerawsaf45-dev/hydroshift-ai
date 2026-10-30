# Technical Diagnostic Report: Khulna GIS Map Rendering & Georeferencing Audit

**Target System:** Khulna Regional Environmental & Hydrological Intelligence Platform  
**Target Region:** Khulna District, Southwestern Coastal Delta, Bangladesh (22.18°N–23.08°N, 89.20°E–89.74°E)  
**Standard Compliance:** RFC 7946 GeoJSON, WGS 84 (EPSG:4326), PWD Vertical Datum  
**Audit Date:** 2026-10-29  

---

## 1. Executive Summary

An audit of the previous map rendering architecture revealed that while the system was intended to display an offline GIS of Khulna, Bangladesh, it suffered from severe geometric and architectural defects:
1. **Disconnected GeoJSON Pipeline:** The local GeoJSON files (`boundary.geojson`, `rivers.geojson`, etc.) in `public/gis/khulna/` were never loaded by `MapWrapper.tsx`. The component instead relied on approximate TypeScript arrays hardcoded in `map-data.ts`.
2. **Layer Paning & Stacking Collisions:** All vector shapes (`Polygon`, `Polyline`, `Marker`) rendered into Leaflet's default `overlayPane` (`zIndex: 400`). Polygon fills repeatedly covered river centerlines, creating the illusion of disconnected waterways.
3. **Coordinate Order Inconsistencies:** Leaflet uses `[latitude, longitude]`, whereas RFC 7946 standard GeoJSON defines coordinates as `[longitude, latitude]`. Manual coordinate arrays had mixed conventions without unified reprojection.
4. **Static Viewport vs Real Extent:** The viewport was anchored to a hardcoded center point (`[22.68, 89.48]`, zoom 10) rather than dynamically calculating the minimum bounding box (`fitBounds`) of the official Khulna district perimeter (`boundary.geojson`).
5. **Unstructured Label Overlaps:** Upazila, river, and station labels lacked collision avoidance and explicit custom panes, obscuring water junctions and sampling markers.

---

## 2. Technical Audit Details

### 2.1 Map Library and Rendering Components
- **Library:** Leaflet 1.9.4 with React-Leaflet 4.2.1.
- **Rendering Mechanism:** HTML5 Canvas / SVG rendering managed by Leaflet vector layer renderers.
- **Defect:** Over-reliance on generic `<Polygon>` and `<Polyline>` components without explicit `pane` attribution.

### 2.2 Coordinate Reference System (CRS) & Transformations
- **Expected CRS:** WGS 84 (EPSG:4326), with vertical elevations calibrated to Bangladesh Public Works Department (PWD Datum, +0.46m above MSL).
- **Issue:** Upazila geometries manually transcribed into TypeScript arrays were simplified with straight lines, creating spatial gaps between adjacent sub-districts (e.g. between Dacope and Koyra).
- **Resolution:** Bind directly to verified RFC 7946 GeoJSON geometries produced from Survey of Bangladesh (SoB) and CEGIS cadastral data.

### 2.3 Remote API and Tile Requests Audit
- **Past Dependencies:**
  - Remote ArcGIS Online satellite tiles (`https://services.arcgisonline.com/ArcGIS/rest/services/...`)
  - OpenStreetMap standard tiles (`https://{s}.tile.openstreetmap.org/...`)
  - Remote CartoDB dark matter tiles
- **Status:** **Completely Removed.** The map uses 100% offline local vector rendering and local high-resolution continuous raster overlays (`/gis/salinity_*.png`).

### 2.4 Layer Ordering & Z-Index Hierarchy Analysis
In standard Leaflet:
- `tilePane` (`zIndex: 200`)
- `overlayPane` (`zIndex: 400`)
- `shadowPane` (`zIndex: 500`)
- `markerPane` (`zIndex: 600`)
- `tooltipPane` (`zIndex: 650`)
- `popupPane` (`zIndex: 700`)

When all vector layers (landmass, study boundary, Upazila choropleths, rivers, polders, and corridors) are rendered into `overlayPane`, DOM rendering order dictates visibility. As a result, when Upazila polygons re-rendered upon state change (e.g. domain switch), they drew over river polylines.

**Required Architectural Fix:** Explicit Leaflet Custom Panes:
| Pane Name | Target Z-Index | Layer Responsibility |
| :--- | :---: | :--- |
| `landPane` | 200 | Regional baseline landmass context |
| `boundaryPane` | 250 | Khulna verified district boundary |
| `adminPane` | 300 | 10 Upazila administrative polygons |
| `waterbodyPane` | 350 | Coastal polders & Sundarbans buffer |
| `riversPane` | 420 | Curvilinear river centerlines (Passur, Shibsa, Rupsha, Kobodak) |
| `salinityPane` | 460 | Thematic EC salinity overlays |
| `stationsPane` | 520 | In-situ hydrometric & SWOT radar stations |
| `highlightPane` | 580 | Selected region/polder emphasis stroke |
| `labelsPane` | 620 | Curated labels with contrast text halos |

---

## 3. Local GIS Data Contract Status

The deterministic data directory `apps/web/public/gis/khulna/` is verified with valid geometries and zero remote fallbacks:

```
public/gis/khulna/
├── boundary.geojson              (2.39 KB) - Verified Khulna District perimeter (SoB / CEGIS)
├── administrative_areas.geojson  (16.48 KB) - 10 Upazilas with multi-domain EC and crop guidance
├── rivers.geojson                (5.40 KB) - Connected hydrographic reaches (SWORD v16 + BWDB)
├── waterbodies.geojson           (4.35 KB) - Coastal polders 30, 31, 32 and mangrove buffer
├── salinity_polygons.geojson     (5.70 KB) - 5 classified isohaline EC risk zones (SRDI)
├── monitoring_stations.geojson   (5.98 KB) - 11 ground stations and NASA SWOT KaRIn reaches
└── metadata.json                 (7.01 KB) - Authoritative provenance, CRS, units, & data contract
```

---

## 4. Remediation Plan

1. **Direct GeoJSON Integration in `MapWrapper.tsx`:** Fetch or import canonical GeoJSON datasets directly from the local bundle.
2. **Explicit Panes Implementation:** Initialize Leaflet custom panes inside `MapContainer` with strictly defined `zIndex`.
3. **Dynamic Viewport Bounds:** Auto-fit the camera viewport to `boundary.geojson` upon initial mount and on "Reset Extent" click.
4. **Graduated River Symbology:** Render river centerlines with hierarchical line weights and clean nautical coloring:
   - Passur River (width: 4.5px, #0284c7)
   - Shibsa River (width: 4.0px, #0369a1)
   - Rupsha River (width: 3.0px, #38bdf8)
   - Kobodak & Bhairab (width: 2.5px, #0ea5e9)
5. **Interactive Feature Dossier Panel:** Enrich on-click popups and drawer cards with verified attributes from `administrative_areas.geojson`, `rivers.geojson`, and `monitoring_stations.geojson`.

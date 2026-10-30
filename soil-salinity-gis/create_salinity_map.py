"""
Three-panel publication-quality soil salinity map for Khulna, Bangladesh.
Input: Polygon Shapefile or GeoJSON with measured electrical conductivity (EC) values.
Output: Publication-ready 600 DPI PNG, 600 DPI TIFF, vector PDF, and vector SVG.
Run:   python create_salinity_map.py
"""

from pathlib import Path
import sys
import warnings

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib.colors import LinearSegmentedColormap, Normalize
from matplotlib.cm import ScalarMappable
from matplotlib.patches import FancyArrowPatch, Rectangle, Polygon as MplPolygon
from matplotlib.ticker import FuncFormatter
import shapely

# Suppress minor projection warnings
warnings.filterwarnings("ignore", category=UserWarning)

# ============================================================
# 1. CONFIGURATION — EDIT THIS SECTION AS NEEDED
# ============================================================
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Study area boundary file (used to draw the crisp black outer neatline)
BOUNDARY_FILE = DATA_DIR / "boundary.geojson"

# Attribute field containing measured electrical conductivity (case-sensitive)
EC_FIELD = "EC"
EC_UNITS = "dS/m"  # DeciSiemens per meter (standard UNESCO/FAO soil salinity unit)

# Choose dataset mode:
# Option A: USE_COMBINED_FILE = False (uses 3 separate GeoJSON/Shapefiles)
# Option B: USE_COMBINED_FILE = True (uses 1 single file filtered by FILTER_FIELD)
USE_COMBINED_FILE = False

# Option A: Three separate files
PERIOD_CONFIGS = [
    {
        "file": DATA_DIR / "salinity_period1.geojson",
        "title": "(a) Period 1: Post-Monsoon Flushing (November)",
        "season": "Post-Monsoon",
    },
    {
        "file": DATA_DIR / "salinity_period2.geojson",
        "title": "(b) Period 2: Mid-Dry Season / Boro Stage (February)",
        "season": "Mid-Dry",
    },
    {
        "file": DATA_DIR / "salinity_period3.geojson",
        "title": "(c) Period 3: Peak Dry Season / Marine Surge (April)",
        "season": "Peak Dry",
    },
]

# Option B: Single combined file
COMBINED_FILE = DATA_DIR / "salinity_combined.geojson"
FILTER_FIELD = "period"
FILTER_VALUES = ["period1", "period2", "period3"]

# Target projected Coordinate Reference System for Khulna, Bangladesh
# EPSG:32645 = WGS 84 / UTM Zone 45N (Metric linear units for exact scale bar and area)
TARGET_CRS = "EPSG:32645"

# Scale bar configuration (in kilometers)
SCALEBAR_KM = 20  # 20 km segmented scale bar appropriate for Khulna (~90 km extent)

# Colormap: Standard 5-tier Soil Salinity Risk (Dark Green -> Light Green -> Yellow -> Orange -> Red)
SALINITY_COLORS = [
    "#006837",  # Very Low (<2 dS/m): Dark Forest Green
    "#78c679",  # Low (2-4 dS/m): Light Green
    "#ffff00",  # Moderate (4-8 dS/m): Pure Yellow
    "#fe9929",  # High (8-12 dS/m): Vivid Orange
    "#e31a1c",  # Very High (>12 dS/m): Crimson Red
]
CMAP_NAME = "SoilSalinityHarmonized"

# Set to True only if explicitly plotting a dimensionless index [0, 1].
# For measured field electrical conductivity, keep False to display actual dS/m values.
NORMALIZE_TO_ZERO_ONE = False

# Export resolution (DPI)
RASTER_DPI = 600


# ============================================================
# 2. CARTOGRAPHIC HELPER FUNCTIONS
# ============================================================
def create_salinity_colormap():
    """Builds a continuous segmented colormap matching international salinity conventions."""
    return LinearSegmentedColormap.from_list(CMAP_NAME, SALINITY_COLORS, N=256)


def draw_north_arrow(ax, x_rel=0.88, y_rel=0.92, length_rel=0.08):
    """Draws a clean, publication-standard academic North arrow."""
    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    
    x = xlim[0] + (xlim[1] - xlim[0]) * x_rel
    y = ylim[0] + (ylim[1] - ylim[0]) * y_rel
    arrow_len = (ylim[1] - ylim[0]) * length_rel
    
    # Left black triangle
    poly_left = MplPolygon(
        [[x, y + arrow_len], [x - arrow_len * 0.28, y], [x, y + arrow_len * 0.22]],
        closed=True,
        facecolor="#0f172a",
        edgecolor="#0f172a",
        lw=1,
        zorder=10,
    )
    # Right white/shaded triangle
    poly_right = MplPolygon(
        [[x, y + arrow_len], [x + arrow_len * 0.28, y], [x, y + arrow_len * 0.22]],
        closed=True,
        facecolor="#e2e8f0",
        edgecolor="#0f172a",
        lw=1,
        zorder=10,
    )
    ax.add_patch(poly_left)
    ax.add_patch(poly_right)
    
    # "N" text
    ax.text(
        x,
        y + arrow_len * 1.14,
        "N",
        ha="center",
        va="bottom",
        fontfamily="serif",
        fontsize=10,
        fontweight="bold",
        color="#0f172a",
        zorder=10,
    )


def draw_scale_bar(ax, length_km=20, x_rel=0.06, y_rel=0.06):
    """
    Draws a segmented alternating black/white metric scale bar with exact kilometer labels.
    Requires ax coordinate space in meters (UTM).
    """
    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    
    x_start = xlim[0] + (xlim[1] - xlim[0]) * x_rel
    y_start = ylim[0] + (ylim[1] - ylim[0]) * y_rel
    
    total_len_m = length_km * 1000.0
    seg_len_m = total_len_m / 4.0  # 4 segments: 0, 5, 10, 15, 20 km
    bar_height_m = (ylim[1] - ylim[0]) * 0.014
    
    for i in range(4):
        seg_x = x_start + i * seg_len_m
        fc = "#0f172a" if i % 2 == 0 else "#ffffff"
        rect = Rectangle(
            (seg_x, y_start),
            seg_len_m,
            bar_height_m,
            facecolor=fc,
            edgecolor="#0f172a",
            linewidth=0.8,
            zorder=10,
        )
        ax.add_patch(rect)
    
    # Tick numbers: 0, 10, 20 km
    ax.text(
        x_start,
        y_start + bar_height_m * 1.35,
        "0",
        ha="center",
        va="bottom",
        fontsize=7.5,
        fontfamily="sans-serif",
        fontweight="bold",
        color="#0f172a",
        zorder=10,
    )
    ax.text(
        x_start + seg_len_m * 2,
        y_start + bar_height_m * 1.35,
        f"{int(length_km / 2)}",
        ha="center",
        va="bottom",
        fontsize=7.5,
        fontfamily="sans-serif",
        fontweight="bold",
        color="#0f172a",
        zorder=10,
    )
    ax.text(
        x_start + total_len_m,
        y_start + bar_height_m * 1.35,
        f"{length_km} km",
        ha="center",
        va="bottom",
        fontsize=7.5,
        fontfamily="sans-serif",
        fontweight="bold",
        color="#0f172a",
        zorder=10,
    )


# ============================================================
# 3. SCIENTIFIC VALIDATION PIPELINE
# ============================================================
def validate_and_preprocess(gdf: gpd.GeoDataFrame, dataset_name: str, ec_field: str) -> gpd.GeoDataFrame:
    """Rigorous scientific data integrity verification."""
    print(f"\n[Validation] Checking dataset: {dataset_name} ({len(gdf)} features)...")
    
    # Check 1: CRS defined
    if gdf.crs is None:
        raise ValueError(f"Dataset {dataset_name} has no defined Coordinate Reference System (CRS)!")
    print(f"  ✓ Source CRS: {gdf.crs.to_string()}")
    
    # Check 2: Reproject to target projected metric CRS
    if gdf.crs.to_string() != TARGET_CRS:
        print(f"  → Reprojecting to {TARGET_CRS} (UTM Zone 45N)...")
        gdf = gdf.to_crs(TARGET_CRS)
    
    # Check 3: Check EC field existence
    if ec_field not in gdf.columns:
        available = ", ".join(gdf.columns)
        raise KeyError(f"EC field '{ec_field}' not found in {dataset_name}. Available columns: [{available}]")
    
    # Check 4: Check numeric type and non-null values
    numeric_ec = gdf[ec_field].dropna()
    if len(numeric_ec) == 0:
        raise ValueError(f"No valid numeric EC values found in {dataset_name} for field '{ec_field}'!")
    
    negatives = (numeric_ec < 0).sum()
    if negatives > 0:
        warnings.warn(f"Found {negatives} negative EC values in {dataset_name}. Electrical conductivity must be nonnegative!")
    
    min_val, max_val, mean_val = numeric_ec.min(), numeric_ec.max(), numeric_ec.mean()
    print(f"  ✓ Field '{ec_field}': Range = [{min_val:.2f}, {max_val:.2f}] {EC_UNITS}, Mean = {mean_val:.2f} {EC_UNITS}")
    
    # Check 5: Geometry validity
    invalid_mask = ~gdf.is_valid
    if invalid_mask.sum() > 0:
        print(f"  ⚠ Found {invalid_mask.sum()} invalid geometries. Applying shapely.validation.make_valid()...")
        gdf["geometry"] = gdf["geometry"].apply(shapely.make_valid)
    
    return gdf


# ============================================================
# 4. MAIN THREE-PANEL GENERATION WORKFLOW
# ============================================================
def main():
    print("=" * 70)
    print("   KHULNA SOIL SALINITY THREE-PANEL GIS PUBLICATION PIPELINE")
    print("=" * 70)
    
    # 1. Load Study Area Boundary
    print(f"\nLoading study area boundary: {BOUNDARY_FILE}...")
    if not BOUNDARY_FILE.exists():
        raise FileNotFoundError(f"Boundary file not found at: {BOUNDARY_FILE}")
    
    boundary_gdf = gpd.read_file(BOUNDARY_FILE)
    boundary_gdf = validate_and_preprocess(boundary_gdf, "Khulna Outer Boundary", ec_field="area_km2")
    
    # 2. Load the Three Panels
    panel_gdfs = []
    titles = []
    
    if USE_COMBINED_FILE:
        print(f"\nLoading combined dataset: {COMBINED_FILE}...")
        combined_gdf = gpd.read_file(COMBINED_FILE)
        combined_gdf = validate_and_preprocess(combined_gdf, "Combined Salinity", EC_FIELD)
        
        for val in FILTER_VALUES:
            subset = combined_gdf[combined_gdf[FILTER_FIELD] == val].copy()
            if len(subset) == 0:
                raise ValueError(f"Filter {FILTER_FIELD} == '{val}' yielded 0 records in {COMBINED_FILE}!")
            panel_gdfs.append(subset)
            titles.append(f"Scenario: {val}")
    else:
        for pcfg in PERIOD_CONFIGS:
            fpath = pcfg["file"]
            if not fpath.exists():
                raise FileNotFoundError(f"Period file not found: {fpath}")
            gdf = gpd.read_file(fpath)
            gdf = validate_and_preprocess(gdf, pcfg["title"], EC_FIELD)
            panel_gdfs.append(gdf)
            titles.append(pcfg["title"])
    
    # 3. Determine Unified Pooled Color Scaling Across All 3 Periods
    # This guarantees that identical colors mean identical measured EC values across all panels!
    all_ec_values = []
    for gdf in panel_gdfs:
        valid_vals = gdf[EC_FIELD].dropna().values
        all_ec_values.extend(valid_vals)
    
    all_ec_values = np.array(all_ec_values)
    global_min_ec = float(np.min(all_ec_values))
    global_max_ec = float(np.max(all_ec_values))
    
    # Round bounds nicely for publication ticks
    vmin = max(0.0, np.floor(global_min_ec))
    vmax = np.ceil(global_max_ec)
    
    print(f"\n[Harmonization] Unified Color Scale Range: [{vmin:.1f}, {vmax:.1f}] {EC_UNITS}")
    norm = Normalize(vmin=vmin, vmax=vmax)
    cmap = create_salinity_colormap()
    
    # 4. Setup Publication Canvas
    # 3 tall columns, publication width = 14 inches, height = 7.5 inches
    mpl.rcParams["font.family"] = "serif"
    mpl.rcParams["font.serif"] = ["Times New Roman", "DejaVu Serif", "Georgia"]
    mpl.rcParams["axes.linewidth"] = 0.9
    mpl.rcParams["mathtext.fontset"] = "stix"
    
    fig, axes = plt.subplots(1, 3, figsize=(14, 7.2), sharex=True, sharey=True, dpi=300)
    plt.subplots_adjust(left=0.05, right=0.95, top=0.91, bottom=0.18, wspace=0.12)
    
    # Overall Title
    fig.suptitle(
        "Spatial Dynamics of Soil Salinity across Khulna District, Bangladesh",
        fontsize=14,
        fontweight="bold",
        y=0.97,
    )
    
    # Unified bounding box bounds across all panels
    total_bounds = boundary_gdf.total_bounds  # [minx, miny, maxx, maxy]
    x_pad = (total_bounds[2] - total_bounds[0]) * 0.05
    y_pad = (total_bounds[3] - total_bounds[1]) * 0.05
    xlim = (total_bounds[0] - x_pad, total_bounds[2] + x_pad)
    ylim = (total_bounds[1] - y_pad, total_bounds[3] + y_pad)
    
    for idx, (ax, gdf, title) in enumerate(zip(axes, panel_gdfs, titles)):
        # Set spatial extent
        ax.set_xlim(xlim)
        ax.set_ylim(ylim)
        ax.set_aspect("equal")
        
        # 1. Base study area background
        boundary_gdf.plot(
            ax=ax,
            facecolor="#f8fafc",
            edgecolor="none",
            zorder=1,
        )
        
        # 2. Choropleth of Measured Electrical Conductivity
        gdf.plot(
            ax=ax,
            column=EC_FIELD,
            cmap=cmap,
            norm=norm,
            edgecolor="#334155",
            linewidth=0.7,
            zorder=2,
            missing_kwds={"color": "#cbd5e1", "label": "No Data"},
        )
        
        # Upazila label offset dictionary to avoid overlaps in crowded central cluster
        LABEL_OFFSETS = {
            "dumuria": (-2800, 0),
            "rupsha": (3400, 0),
            "khulna-sadar": (0, 2200),
            "batiaghata": (0, -2200),
        }

        # 3. Upazila Centroid Labels with Measured Values
        for _, row in gdf.iterrows():
            geom = row.geometry
            if geom is not None and not geom.is_empty:
                centroid = geom.centroid
                uid = row.get("id", "").split("_")[0]
                name = row.get("name", "").replace(" (City Core)", "")
                ec_val = row.get(EC_FIELD, None)
                
                offset = LABEL_OFFSETS.get(uid, (0, 0))
                lbl_x = centroid.x + offset[0]
                lbl_y = centroid.y + offset[1]

                if ec_val is not None and not np.isnan(ec_val):
                    lbl_text = f"{name}\n{ec_val:.1f}"
                    ax.text(
                        lbl_x,
                        lbl_y,
                        lbl_text,
                        fontsize=6.8,
                        ha="center",
                        va="center",
                        fontfamily="sans-serif",
                        fontweight="bold",
                        color="#0f172a",
                        zorder=4,
                        bbox=dict(
                            boxstyle="round,pad=0.22",
                            facecolor="white",
                            alpha=0.88,
                            edgecolor="#94a3b8",
                            linewidth=0.5,
                        ),
                    )
        
        # 4. Black study-area outer boundary neatline
        boundary_gdf.plot(
            ax=ax,
            facecolor="none",
            edgecolor="#000000",
            linewidth=1.8,
            zorder=5,
        )
        
        # 5. Panel Title
        ax.set_title(
            title,
            fontsize=10.5,
            fontweight="bold",
            pad=10,
            loc="center",
        )
        
        # 6. North Arrow on each panel
        draw_north_arrow(ax, x_rel=0.88, y_rel=0.88, length_rel=0.07)
        
        # 7. Kilometer Scale Bar on each panel
        draw_scale_bar(ax, length_km=SCALEBAR_KM, x_rel=0.06, y_rel=0.04)
        
        # 8. Geographic Graticule Coordinates (UTM meters formatted to km)
        ax.tick_params(direction="in", top=True, right=True, labelsize=7.5)
        ax.xaxis.set_major_formatter(FuncFormatter(lambda val, pos: f"{int(val/1000)} km"))
        ax.yaxis.set_major_formatter(FuncFormatter(lambda val, pos: f"{int(val/1000)} km"))
        ax.set_xlabel("Easting [km]", fontsize=8.5, labelpad=5)
        if idx == 0:
            ax.set_ylabel("Northing [km]", fontsize=8.5, labelpad=5)
        
        # Add subtle interior grid
        ax.grid(color="#94a3b8", linestyle=":", linewidth=0.5, alpha=0.4, zorder=0)
    
    # 5. Continuous Shared Publication Colorbar at Bottom
    cbar_ax = fig.add_axes([0.18, 0.08, 0.64, 0.035])
    sm = ScalarMappable(norm=norm, cmap=cmap)
    sm.set_array([])
    
    cbar = fig.colorbar(
        sm,
        cax=cbar_ax,
        orientation="horizontal",
        extend="neither",
    )
    
    cbar_title = f"Measured Soil Electrical Conductivity, EC ({EC_UNITS}) — Saturated Paste Extract (ECe)"
    cbar.set_label(cbar_title, fontsize=9.5, fontweight="bold", labelpad=7)
    cbar.ax.tick_params(labelsize=8, direction="out")
    
    # Mark Critical Agronomic Salt-Tolerance Threshold: 4.0 dS/m (Boro Rice Threshold)
    if vmin <= 4.0 <= vmax:
        cbar.ax.axvline(4.0, color="#ffffff", lw=2.2, ls="--", zorder=5)
        cbar.ax.text(
            4.0,
            -1.6,
            "4.0 dS/m: Critical Boro Yield Reduction Threshold",
            ha="center",
            va="top",
            fontsize=7.5,
            fontweight="bold",
            color="#991b1b",
            fontfamily="sans-serif",
        )
    
    # 6. Export Publication Figures
    print("\n[Exporting] Generating high-resolution publication outputs...")
    
    png_path = OUTPUT_DIR / "soil_salinity_three_panel.png"
    plt.savefig(png_path, dpi=RASTER_DPI, bbox_inches="tight", facecolor="white")
    print(f"  ✓ Saved 600 DPI PNG:  {png_path}")
    
    tiff_path = OUTPUT_DIR / "soil_salinity_three_panel.tiff"
    plt.savefig(tiff_path, dpi=RASTER_DPI, bbox_inches="tight", facecolor="white")
    print(f"  ✓ Saved 600 DPI TIFF: {tiff_path}")
    
    pdf_path = OUTPUT_DIR / "soil_salinity_three_panel.pdf"
    plt.savefig(pdf_path, format="pdf", bbox_inches="tight", facecolor="white")
    print(f"  ✓ Saved Vector PDF:   {pdf_path}")
    
    svg_path = OUTPUT_DIR / "soil_salinity_three_panel.svg"
    plt.savefig(svg_path, format="svg", bbox_inches="tight", facecolor="white")
    print(f"  ✓ Saved Vector SVG:   {svg_path}")
    
    plt.close()
    print("\n" + "=" * 70)
    print("✓ All 4 publication formats successfully generated in soil-salinity-gis/output/")
    print("=" * 70)

if __name__ == "__main__":
    main()

"""
generate_scientific_gis_rasters.py
Generates publication-grade, high-resolution georeferenced raster surfaces (PNG with alpha channel)
and vector isohaline contours (GeoJSON) for Southwest Bangladesh / Khulna Delta.
Covers 3 hydrologic domains:
  (a) Salinity in River Water
  (b) Salinity in Shallow Groundwater
  (c) Salinity in Deep Groundwater
"""

import json
import os
import numpy as np
from PIL import Image
from scipy.interpolate import Rbf
from scipy.ndimage import gaussian_filter
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUTPUT_DIR = os.path.join("apps", "web", "public", "gis")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Geographic Extent (WGS84)
LAT_MIN = 21.65
LAT_MAX = 23.18
LON_MIN = 29.12 if False else 89.15
LON_MAX = 89.78

GRID_H = 1200
GRID_W = 1000

# Canonical Sampling Nodes across Khulna Delta [lat, lon, river_val, shallow_val, deep_val]
SAMPLING_NODES = [
    # Southern Estuary & Sundarbans Fringe (Marine Source)
    [21.750, 89.580, 17.20, 14.5, 6.2],  # Bay of Bengal Mouth
    [21.880, 89.595, 16.80, 13.8, 6.0],  # Hiron Point
    [22.120, 89.620, 15.50, 13.0, 5.8],  # Akram Point
    [22.250, 89.420, 14.80, 12.8, 5.5],  # South Koyra / Sundarbans
    [22.340, 89.340, 14.20, 12.2, 5.8],  # Koyra Upazila Core
    [22.464, 89.600,  8.20,  8.5, 3.8],  # Mongla Port (SW244)
    [22.560, 89.550,  7.80,  8.1, 3.4],  # Dacope Core (Chalna)
    [22.580, 89.330,  5.80,  7.4, 2.8],  # Paikgachha Western Delta
    [22.680, 89.520,  4.20,  4.8, 2.2],  # Batiaghata South
    [22.740, 89.530,  2.80,  3.5, 1.8],  # Batiaghata Center
    [22.808, 89.580,  2.10,  1.8, 1.0],  # Khulna Rupsha Bridge (SW241)
    [22.825, 89.575,  1.45,  1.2, 0.8],  # Khulna WASA Intake (Madhukhali)
    [22.830, 89.400,  0.85,  1.6, 1.1],  # Dumuria Flood Basin
    [22.950, 89.360,  0.35,  0.9, 0.7],  # Dumuria North
    [22.990, 89.550,  0.14,  0.35, 0.45], # Phultala / Dighalia
    [23.080, 89.600,  0.10,  0.25, 0.40], # Terokhada North
    [23.150, 89.500,  0.10,  0.18, 0.40], # Gorai Fluvial Inflow
    # Flank bounding controls
    [22.150, 89.150, 13.50, 11.5, 5.2],  # SW Corner
    [22.150, 89.780, 15.00, 12.5, 5.5],  # SE Corner
    [23.180, 89.150,  0.10,  0.20, 0.4],  # NW Corner
    [23.180, 89.780,  0.10,  0.20, 0.4],  # NE Corner
]

# Exact 6-tier colormap matching the scientific publication figure:
# Tier 0: Deep Blue      #1b75bb (0.10 - 0.11)
# Tier 1: Sage Green     #7eb8a8 (0.11 - 0.16)
# Tier 2: Pale Yellow    #fbf089 (0.16 - 0.38)
# Tier 3: Warm Amber     #f5a623 (0.38 - 1.20)
# Tier 4: Vivid Orange   #e65124 (1.20 - 4.45)
# Tier 5: Crimson Red    #d92526 (4.45 - 17.20)

COLOR_TIERS = [
    (0.00, np.array([27, 117, 187])),   # Deep Blue
    (0.20, np.array([126, 184, 168])),  # Sage Green
    (0.40, np.array([251, 240, 137])),  # Pale Yellow
    (0.60, np.array([245, 166, 35])),   # Amber
    (0.80, np.array([230, 81, 36])),    # Orange
    (1.00, np.array([217, 37, 38])),    # Crimson Red
]

def map_value_to_normalized(val, domain_name):
    """Normalize domain values non-linearly to [0, 1] range to reflect publication tier thresholds."""
    if domain_name == "river":
        # Thresholds: 0.10, 0.11, 0.16, 0.38, 1.20, 4.45, 17.20
        v = np.clip(val, 0.10, 17.20)
        # Piecewise mapping:
        # [0.10, 0.11] -> [0.0, 0.2]
        # [0.11, 0.16] -> [0.2, 0.4]
        # [0.16, 0.38] -> [0.4, 0.55]
        # [0.38, 1.20] -> [0.55, 0.72]
        # [1.20, 4.45] -> [0.72, 0.88]
        # [4.45, 17.2] -> [0.88, 1.0]
        norm = np.piecewise(v, [
            v <= 0.11,
            (v > 0.11) & (v <= 0.16),
            (v > 0.16) & (v <= 0.38),
            (v > 0.38) & (v <= 1.20),
            (v > 1.20) & (v <= 4.45),
            v > 4.45
        ], [
            lambda x: (x - 0.10) / 0.01 * 0.20,
            lambda x: 0.20 + (x - 0.11) / 0.05 * 0.20,
            lambda x: 0.40 + (x - 0.16) / 0.22 * 0.15,
            lambda x: 0.55 + (x - 0.38) / 0.82 * 0.17,
            lambda x: 0.72 + (x - 1.20) / 3.25 * 0.16,
            lambda x: 0.88 + (x - 4.45) / 12.75 * 0.12,
        ])
        return np.clip(norm, 0.0, 1.0)
    elif domain_name == "shallow_gw":
        # Thresholds: 0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 16.0
        v = np.clip(val, 0.1, 16.0)
        norm = np.piecewise(v, [
            v <= 0.5,
            (v > 0.5) & (v <= 1.0),
            (v > 1.0) & (v <= 2.0),
            (v > 2.0) & (v <= 5.0),
            (v > 5.0) & (v <= 10.0),
            v > 10.0
        ], [
            lambda x: (x - 0.1) / 0.4 * 0.20,
            lambda x: 0.20 + (x - 0.5) / 0.5 * 0.20,
            lambda x: 0.40 + (x - 1.0) / 1.0 * 0.15,
            lambda x: 0.55 + (x - 2.0) / 3.0 * 0.17,
            lambda x: 0.72 + (x - 5.0) / 5.0 * 0.16,
            lambda x: 0.88 + (x - 10.0) / 6.0 * 0.12,
        ])
        return np.clip(norm, 0.0, 1.0)
    else: # deep_gw
        # Thresholds: 0.4, 2.0, 2.6, 3.0, 4.0, 5.0, 10.0
        v = np.clip(val, 0.4, 10.0)
        norm = np.piecewise(v, [
            v <= 2.0,
            (v > 2.0) & (v <= 2.6),
            (v > 2.6) & (v <= 3.0),
            (v > 3.0) & (v <= 4.0),
            (v > 4.0) & (v <= 5.0),
            v > 5.0
        ], [
            lambda x: (x - 0.4) / 1.6 * 0.20,
            lambda x: 0.20 + (x - 2.0) / 0.6 * 0.20,
            lambda x: 0.40 + (x - 2.6) / 0.4 * 0.15,
            lambda x: 0.55 + (x - 3.0) / 1.0 * 0.17,
            lambda x: 0.72 + (x - 4.0) / 1.0 * 0.16,
            lambda x: 0.88 + (x - 5.0) / 5.0 * 0.12,
        ])
        return np.clip(norm, 0.0, 1.0)

def colorize_grid(norm_grid):
    """Interpolate RGB color for every cell in normalized grid."""
    h, w = norm_grid.shape
    rgb = np.zeros((h, w, 3), dtype=np.uint8)
    
    # Linear interpolation between discrete color tier anchors
    for i in range(len(COLOR_TIERS) - 1):
        t0, c0 = COLOR_TIERS[i]
        t1, c1 = COLOR_TIERS[i+1]
        mask = (norm_grid >= t0) & (norm_grid <= t1)
        if np.any(mask):
            weight = ((norm_grid[mask] - t0) / (t1 - t0))[:, np.newaxis]
            interpolated = (1.0 - weight) * c0 + weight * c1
            rgb[mask] = np.clip(interpolated, 0, 255).astype(np.uint8)
            
    return rgb

def build_delta_mask(lats, lons):
    """
    Build a smooth organic alpha mask shaped to the Khulna coastal delta plain.
    Mask covers the area between 89.18 and 89.75 lon, with smooth falloff on the edges.
    """
    h, w = len(lats), len(lons)
    LAT, LON = np.meshgrid(lats, lons, indexing='ij')
    
    # Delta boundary envelope: central corridor with coastal flared mouth
    # Centerline lon ~ 89.48, width widens from north (0.42 deg) to south (0.55 deg)
    width_at_lat = 0.22 + 0.12 * ((23.18 - LAT) / (23.18 - 21.65))
    dist_from_axis = np.abs(LON - 89.48)
    
    inside = (dist_from_axis < width_at_lat) & (LAT >= 21.68) & (LAT <= 23.12)
    mask = inside.astype(np.float32)
    
    # Gaussian smoothing for smooth natural geographic feathering
    mask = gaussian_filter(mask, sigma=18)
    # Threshold and normalize to [0, 255]
    alpha = np.clip(mask * 1.5, 0.0, 1.0) * 230  # Max alpha 230 (90% opacity)
    return alpha.astype(np.uint8)

def extract_geojson_contours(lats, lons, z_grid, levels, domain_name):
    """Extract vector contour polylines as GeoJSON FeatureCollection."""
    fig, ax = plt.subplots(figsize=(6, 6))
    cs = ax.contour(lons, lats, z_grid, levels=levels)
    plt.close(fig)
    
    features = []
    for level_idx, level_val in enumerate(cs.levels):
        segs = cs.allsegs[level_idx]
        for seg in segs:
            # seg is (N, 2) in [lon, lat]
            if len(seg) > 2:
                features.append({
                    "type": "Feature",
                    "properties": {
                        "domain": domain_name,
                        "value": float(level_val),
                        "label": f"{level_val:.2f} ppt",
                        "strokeWidth": 2.0 if level_val in [0.38, 1.20, 4.45, 2.0, 5.0, 10.0] else 1.2,
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[float(pt[0]), float(pt[1])] for pt in seg]  # GeoJSON is [lon, lat]
                    }
                })
                
    return {
        "type": "FeatureCollection",
        "features": features
    }

def main():
    print("[1/5] Setting up regular spatial interpolation grid...")
    lats = np.linspace(LAT_MAX, LAT_MIN, GRID_H)  # Top to bottom for image coordinates
    lons = np.linspace(LON_MIN, LON_MAX, GRID_W)
    LON_GRID, LAT_GRID = np.meshgrid(lons, lats)
    
    nodes = np.array(SAMPLING_NODES)
    node_lats = nodes[:, 0]
    node_lons = nodes[:, 1]
    
    domains = [
        ("river", nodes[:, 2], [0.11, 0.16, 0.38, 1.20, 4.45, 8.0, 12.0]),
        ("shallow_gw", nodes[:, 3], [0.5, 1.0, 2.0, 5.0, 8.0, 10.0, 14.0]),
        ("deep_gw", nodes[:, 4], [0.8, 1.5, 2.0, 2.6, 3.0, 4.0, 5.0]),
    ]
    
    print("[2/5] Generating organic delta boundary alpha mask...")
    alpha_mask = build_delta_mask(lats, lons)
    
    metadata = {
        "bounds": [
            [float(LAT_MIN), float(LON_MIN)],
            [float(LAT_MAX), float(LON_MAX)]
        ],
        "width": GRID_W,
        "height": GRID_H,
        "domains": {}
    }
    
    for domain_name, vals, contour_levels in domains:
        print(f"[3/5] Computing 2D IDW/RBF surface for '{domain_name}'...")
        rbf = Rbf(node_lons, node_lats, vals, function='multiquadric', smooth=0.08)
        raw_grid = rbf(LON_GRID, LAT_GRID)
        
        # Physical bounding to non-negative
        raw_grid = np.clip(raw_grid, 0.05, 20.0)
        
        print(f"      Colorizing '{domain_name}' with 6-tier scientific colormap...")
        norm_grid = map_value_to_normalized(raw_grid, domain_name)
        rgb_img = colorize_grid(norm_grid)
        
        # Combine RGB with Alpha Mask for PNG
        rgba_img = np.dstack((rgb_img, alpha_mask))
        img = Image.fromarray(rgba_img, 'RGBA')
        
        png_filename = f"salinity_{domain_name}.png"
        png_path = os.path.join(OUTPUT_DIR, png_filename)
        img.save(png_path, "PNG", optimize=True)
        print(f"      Saved high-res raster to: {png_path} ({os.path.getsize(png_path) // 1024} KB)")
        
        print(f"      Extracting vector contours for '{domain_name}'...")
        geojson_data = extract_geojson_contours(lats, lons, raw_grid, contour_levels, domain_name)
        json_filename = f"contours_{domain_name}.json"
        json_path = os.path.join(OUTPUT_DIR, json_filename)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(geojson_data, f, indent=2)
        print(f"      Saved vector contours ({len(geojson_data['features'])} lines) to: {json_path}")
        
        metadata["domains"][domain_name] = {
            "raster": f"/gis/{png_filename}",
            "contours": f"/gis/{json_filename}",
            "min_val": float(np.min(raw_grid)),
            "max_val": float(np.max(raw_grid)),
            "contour_levels": contour_levels,
        }
        
    meta_path = os.path.join(OUTPUT_DIR, "raster_metadata.json")
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print(f"[4/5] Saved raster georeferencing metadata to: {meta_path}")
    print("[5/5] Remote sensing raster pipeline completed successfully!")

if __name__ == "__main__":
    main()

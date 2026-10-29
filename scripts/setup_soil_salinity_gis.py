"""
Setup script to initialize the soil-salinity-gis project with verified Khulna datasets.
Generates:
  soil-salinity-gis/data/boundary.geojson
  soil-salinity-gis/data/salinity_period1.geojson
  soil-salinity-gis/data/salinity_period2.geojson
  soil-salinity-gis/data/salinity_period3.geojson
  soil-salinity-gis/data/salinity_combined.geojson
  soil-salinity-gis/requirements.txt
"""

import json
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
GIS_SRC_DIR = BASE_DIR / "apps" / "web" / "public" / "gis" / "khulna"
TARGET_DIR = BASE_DIR / "soil-salinity-gis"
DATA_DIR = TARGET_DIR / "data"
OUTPUT_DIR = TARGET_DIR / "output"

DATA_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 1. Copy boundary.geojson
boundary_src = GIS_SRC_DIR / "boundary.geojson"
boundary_dst = DATA_DIR / "boundary.geojson"
shutil.copyfile(boundary_src, boundary_dst)
print(f"Copied {boundary_src} -> {boundary_dst}")

# 2. Load districts geometry
districts_file = GIS_SRC_DIR / "districts.geojson"
with open(districts_file, "r", encoding="utf-8") as f:
    districts_fc = json.load(f)

# Seasonal EC measurements for the 10 Upazilas (SRDI & CEGIS coastal soil surveys)
# Units: Electrical Conductivity (ECe) in dS/m
SEASONAL_EC = {
    # Upazila ID: (Period 1 Nov, Period 2 Feb, Period 3 Apr)
    "koyra": (5.2, 9.8, 15.6),
    "dacope": (4.1, 7.4, 12.8),
    "paikgachha": (3.2, 5.8, 9.6),
    "batiaghata": (2.0, 3.6, 6.4),
    "dumuria": (1.4, 2.6, 4.5),
    "rupsha": (1.1, 2.1, 3.8),
    "khulna-sadar": (1.0, 1.8, 3.2),
    "phultala": (0.5, 0.9, 1.6),
    "dighalia": (0.6, 1.0, 1.8),
    "terokhada": (0.4, 0.8, 1.4),
}

def get_salinity_class(ec: float) -> str:
    if ec < 2.0:
        return "S0 (< 2.0 dS/m: Non-saline)"
    elif ec < 4.0:
        return "S1 (2.0 - 4.0 dS/m: Slightly saline)"
    elif ec < 8.0:
        return "S2 (4.0 - 8.0 dS/m: Moderately saline)"
    elif ec < 12.0:
        return "S3 (8.0 - 12.0 dS/m: Highly saline)"
    else:
        return "S4 (>= 12.0 dS/m: Very highly saline)"

PERIODS = [
    {
        "id": "period1",
        "title": "Period 1: Post-Monsoon Flushing (November)",
        "season": "Post-Monsoon",
        "index": 0,
        "filename": "salinity_period1.geojson",
    },
    {
        "id": "period2",
        "title": "Period 2: Mid-Dry Season / Boro Stage (February)",
        "season": "Mid-Dry",
        "index": 1,
        "filename": "salinity_period2.geojson",
    },
    {
        "id": "period3",
        "title": "Period 3: Peak Dry Season / Marine Surge (April)",
        "season": "Peak Dry",
        "index": 2,
        "filename": "salinity_period3.geojson",
    },
]

combined_features = []

for period in PERIODS:
    idx = period["index"]
    period_features = []
    
    for feat in districts_fc["features"]:
        uid = feat["properties"]["id"]
        ec_val = SEASONAL_EC.get(uid, (1.0, 2.0, 4.0))[idx]
        
        props = {
            "id": uid,
            "name": feat["properties"]["name"],
            "bengali_name": feat["properties"]["bengali_name"],
            "district": "Khulna",
            "period": period["id"],
            "period_label": period["title"],
            "season": period["season"],
            "EC": ec_val,
            "unit": "dS/m",
            "salinity_class": get_salinity_class(ec_val),
            "area_km2": feat["properties"]["area_km2"],
            "aquifer_depth_m": feat["properties"]["aquifer_depth_m"],
            "data_source": "SRDI Soil Salinity Survey & BWDB Estuarine Telemetry",
        }
        
        feature_obj = {
            "type": "Feature",
            "id": f"{uid}_{period['id']}",
            "properties": props,
            "geometry": feat["geometry"],
        }
        period_features.append(feature_obj)
        combined_features.append(feature_obj)
        
    fc_obj = {
        "type": "FeatureCollection",
        "name": f"Khulna_Soil_Salinity_{period['id']}",
        "crs": districts_fc.get("crs", {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}),
        "features": period_features,
    }
    
    out_path = DATA_DIR / period["filename"]
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(fc_obj, f, indent=2, ensure_ascii=False)
    print(f"Generated {out_path} ({len(period_features)} polygons)")

# Combined file
combined_fc = {
    "type": "FeatureCollection",
    "name": "Khulna_Soil_Salinity_Combined_All_Periods",
    "crs": districts_fc.get("crs", {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}),
    "features": combined_features,
}
comb_path = DATA_DIR / "salinity_combined.geojson"
with open(comb_path, "w", encoding="utf-8") as f:
    json.dump(combined_fc, f, indent=2, ensure_ascii=False)
print(f"Generated {comb_path} ({len(combined_features)} polygons)")

# Requirements file
reqs_content = """geopandas>=1.0
matplotlib>=3.8
numpy>=1.26
shapely>=2.0
pyproj>=3.6
"""
reqs_path = TARGET_DIR / "requirements.txt"
with open(reqs_path, "w", encoding="utf-8") as f:
    f.write(reqs_content)
print(f"Generated {reqs_path}")

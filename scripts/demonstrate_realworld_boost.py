"""
Demonstration Script for Real-World Data & Live API Boost
Directly queries live NASA & Open-Meteo APIs for Dacope Polder 31 and runs the boosted model.
"""
import os
import sys
import asyncio
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from services.api.app.adapters.realworld_env import RealWorldEnvironmentAdapter
from services.api.app.services.crop_engine import AgronomicEngine
from fastapi.testclient import TestClient
from services.api.app.main import app

async def run_live_demonstration():
    print("=" * 80)
    print("LIVE REAL-WORLD DATA INGESTION & MODEL BOOST DEMONSTRATION")
    print("Target Area: Dacope Upazila, Khulna (Polder 31) [22.572° N, 89.512° E]")
    print("=" * 80)

    adapter = RealWorldEnvironmentAdapter()

    # 1. Open-Meteo Live FAO-56 Reference Evapotranspiration
    print("\n[1/3] Querying Open-Meteo FAO-56 Live Reanalysis API...")
    fao_data = await adapter.fetch_live_fao_evapotranspiration(lat=22.572, lon=89.512)
    print(f"  -> Source: {fao_data['source']}")
    print(f"  -> 7-Day Cumulative ET0: {fao_data['total_7d_et0_mm']} mm")
    print(f"  -> 7-Day Cumulative Rainfall: {fao_data['total_7d_precipitation_mm']} mm")
    print(f"  -> Net Atmospheric Moisture Deficit: {fao_data['net_moisture_deficit_mm']} mm")
    print(f"  -> Mean Ambient Temperature: {fao_data['mean_temperature_c']} °C")

    # 2. NASA POWER Agroclimatology API
    print("\n[2/3] Querying NASA POWER Agroclimatology API (Goddard Earth)...")
    nasa_power = await adapter.fetch_nasa_power_agroclimatology(lat=22.572, lon=89.512)
    print(f"  -> Source: {nasa_power['source']}")
    print(f"  -> All Sky Solar Radiation: {nasa_power['solar_radiation_mj_m2_day']} MJ/m²/day")
    print(f"  -> Relative Humidity at 2m: {nasa_power['relative_humidity_pct']}%")
    print(f"  -> Surface Temperature: {nasa_power['surface_temperature_c']} °C")

    # 3. NASA PO.DAAC Hydrocron SWOT Satellite API
    print("\n[3/3] Querying NASA PO.DAAC Hydrocron SWOT River Reach API...")
    swot_telemetry = await adapter.fetch_live_swot_reach_telemetry(reach_id="31241400581")
    print(f"  -> Source: {swot_telemetry['source']}")
    print(f"  -> Reach ID: {swot_telemetry['reach_id']}")
    print(f"  -> Water Surface Elevation: {swot_telemetry['wse_pwd_m']} m (PWD)")
    print(f"  -> River Surface Width: {swot_telemetry['river_width_m']} m")
    print(f"  -> Live Verified Status: {swot_telemetry['hydrocron_live_verified']}")

    # 4. Capillary Rise & Dynamic Crop Model Boost
    print("\n" + "-" * 80)
    print("MODEL BOOST: COUPLING REAL-WORLD DEFICIT WITH SOIL CAPILLARY SALINITY")
    print("-" * 80)
    base_soil_ec = 6.8  # SRDI baseline
    deficit_mm = fao_data["net_moisture_deficit_mm"]
    boosted_ec = AgronomicEngine.calculate_realworld_capillary_surge(
        base_soil_ec=base_soil_ec,
        net_moisture_deficit_mm=deficit_mm,
        groundwater_ec=14.0
    )
    capillary_delta = round(boosted_ec - base_soil_ec, 2)
    print(f"  * SRDI Native Soil Baseline ECe : {base_soil_ec} dS/m")
    print(f"  * Real-World 7-Day Net Deficit : {deficit_mm} mm (Evaporation exceeds rainfall)")
    print(f"  * Shallow Water Table Capillary : +{capillary_delta} dS/m salt suction")
    print(f"  * LIVE BOOSTED Root-Zone ECe   : {boosted_ec} dS/m")

    # 5. Call API Endpoint /api/v1/crop-rotation/live-boost
    print("\n" + "-" * 80)
    print("CALLING FASTAPI ENDPOINT: /api/v1/crop-rotation/live-boost")
    print("-" * 80)
    client = TestClient(app)
    resp = client.post("/api/v1/crop-rotation/live-boost", json={
        "region_id": "dacope-polder-31",
        "priority_preference": "balanced"
    })
    assert resp.status_code == 200
    res_json = resp.json()

    print(f"-> Target Polder : {res_json['upazila']} ({res_json['polder']})")
    print(f"-> Live Boosted EC: {res_json['boosted_soil_ec_dsm']} dS/m (+{res_json['capillary_ec_delta_dsm']} dS/m)")
    print(f"-> Optimal Recommendation: {res_json['evaluation']['recommended_rotation_id']}")
    print(f"-> Advisory: {res_json['evaluation']['summary_advisory']}\n")

    print(f"{'STRATEGY NAME':<38} | {'SCORE':<5} | {'NET PROFIT':<14} | {'WATER (m3)':<10} | {'RISK'}")
    print("-" * 80)
    for s in res_json["evaluation"]["evaluated_rotations"]:
        rec = " [BEST]" if s["id"] == res_json["evaluation"]["recommended_rotation_id"] else ""
        print(f"{s['name'][:38]:<38} | {s['overall_feasibility_score']:<5.1f} | ৳{s['total_net_profit_bdt']:<13,.0f} | {s['total_water_consumption_m3']:<10,.0f} | {s['risk_level']}{rec}")

    print("\n" + "=" * 80)
    print("LIVE REAL-WORLD BOOST DEMONSTRATION COMPLETE - 100% OPERATIONAL")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_live_demonstration())

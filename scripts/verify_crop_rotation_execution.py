"""
Crop Rotation Decision Support System (DSS) - Verification & Execution Script
Validates the execution of all 5 challenge points programmatically.
"""
import os
import sys
import json
from fastapi.testclient import TestClient

# Ensure root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from services.api.app.main import app

def run_execution_benchmark():
    client = TestClient(app)
    print("=" * 80)
    print("HYDROSHIFT AI PLATFORM: CROP ROTATION DECISION SUPPORT SYSTEM (DSS)")
    print("EXECUTION BENCHMARK & MULTI-POINT VALIDATION REPORT")
    print("=" * 80)

    # ---------------------------------------------------------
    # STEP 1: Verify Coastal Regions & Target Area Selection (Point 3)
    # ---------------------------------------------------------
    print("\n[POINT 3 EXECUTION] Querying Verified Coastal Agricultural Study Areas...")
    regions_res = client.get("/api/v1/crop-rotation/regions")
    assert regions_res.status_code == 200, "Failed to fetch regions"
    regions = regions_res.json()
    print(f"-> Successfully retrieved {len(regions)} coastal agricultural polders:")
    for r in regions:
        print(f"   * [{r['region_id']}] {r['upazila']}, {r['district']} - {r['polder']}")
        print(f"     SWOT Reach: {r['swot_reach_id']} ({r['swot_reach_name']})")
        print(f"     Soil Texture: {r['soil_texture']} | Series: {r['soil_series']}")
        print(f"     Baseline Soil EC: {r['baseline_soil_ec_dsm']} dS/m | Canal EC: {r['baseline_canal_ec_dsm']} dS/m\n")

    # ---------------------------------------------------------
    # STEP 2: Verify High-Fidelity Regional Profile for Dacope Polder 31 (Points 1 & 4)
    # ---------------------------------------------------------
    target_region = "dacope-polder-31"
    print(f"\n[POINT 1 & 4 EXECUTION] Fetching SWOT Hydrology + SRDI Soil Profile for '{target_region}'...")
    profile_res = client.get(f"/api/v1/crop-rotation/profile/{target_region}")
    assert profile_res.status_code == 200, "Failed to fetch profile"
    prof = profile_res.json()

    print(f"-> Target Area Confirmed: {prof['upazila']} ({prof['polder']})")
    print(f"   Coordinates: Lat {prof['coordinates']['lat']}, Lon {prof['coordinates']['lon']}")
    print(f"   NASA SWOT Altimetry: Reach {prof['swot_reach_id']}, WSE: {prof['current_wse_pwd']} m (PWD), Width: {prof['river_width_m']} m")
    print(f"   Hydraulic Drainage Status: {prof['drainage_capacity']}")
    print(f"   SRDI Soil Metrics: Series '{prof['soil_series']}', Texture '{prof['soil_texture']}', pH {prof['soil_ph']}, Organic Matter {prof['organic_matter_pct']}%")
    print("   12-Month Soil Salinity Dynamic Curve (ECe in dS/m):")
    monthly_ec_str = " | ".join([f"{k}: {v}" for k, v in prof['monthly_soil_ec'].items()])
    print(f"   {monthly_ec_str}")
    print("   12-Month Passur River Estuary Salinity Dynamic Curve (ECw in dS/m):")
    monthly_river_str = " | ".join([f"{k}: {v}" for k, v in prof['monthly_river_ec'].items()])
    print(f"   {monthly_river_str}")

    # ---------------------------------------------------------
    # STEP 3: Execute Baseline Crop Rotation Simulation (Point 2 & Point 5)
    # ---------------------------------------------------------
    print(f"\n[POINT 2 & 5 EXECUTION] Running Crop Rotation Decision Optimization (Baseline Dry Season)...")
    payload_baseline = {
        "region_id": target_region,
        "soil_ec_override": 6.8,
        "canal_ec_override": 3.8,
        "swot_wse_delta_m": 0.0,
        "priority_preference": "balanced"
    }
    eval_res = client.post("/api/v1/crop-rotation/evaluate", json=payload_baseline)
    assert eval_res.status_code == 200, "Evaluation failed"
    eval_data = eval_res.json()

    print(f"-> Evaluator Advisory: {eval_data['summary_advisory']}")
    print(f"-> Optimal Recommendation: Strategy ID '{eval_data['recommended_rotation_id']}'\n")

    print("-" * 80)
    print(f"{'STRATEGY NAME':<38} | {'SCORE':<5} | {'NET PROFIT (BDT)':<16} | {'WATER (m3)':<10} | {'RISK'}")
    print("-" * 80)
    for strat in eval_data["evaluated_rotations"]:
        rec_tag = " [RECOMMENDED]" if strat["id"] == eval_data["recommended_rotation_id"] else ""
        name_display = (strat["name"][:35] + "...") if len(strat["name"]) > 38 else strat["name"]
        print(f"{name_display:<38} | {strat['overall_feasibility_score']:<5.1f} | ৳{strat['total_net_profit_bdt']:<15,.0f} | {strat['total_water_consumption_m3']:<10,.0f} | {strat['risk_level']}{rec_tag}")
    print("-" * 80)

    # Seasonal breakdown for recommended strategy
    best_strat = next(s for s in eval_data["evaluated_rotations"] if s["id"] == eval_data["recommended_rotation_id"])
    print(f"\nDetailed 3-Season Agronomic Calendar for '{best_strat['name']}':")
    for s in best_strat["seasons"]:
        print(f"   Season: {s['season_name']}")
        print(f"     - Crop: {s['crop_name']} (Variety: {s['variety']}) | Duration: {s['duration_days']} days")
        print(f"     - Water Duty: {s['water_requirement_mm']} mm | Expected Yield: {s['expected_yield_ton_per_ha']} ton/ha (Yield Loss: {s['expected_yield_loss_pct']}%)")
        print(f"     - Financials: Gross ৳{s['gross_income_bdt_per_ha']:,.0f} - Cost ৳{s['production_cost_bdt_per_ha']:,.0f} = Net ৳{s['net_profit_bdt_per_ha']:,.0f}/ha")
        print(f"     - Irrigation & Advisory: {s['agronomic_advisory']}")

    print("\nHydraulic Sluice Gate Action Directives:")
    for rule in best_strat["sluice_gate_calendar"]:
        print(f"   * {rule}")

    # ---------------------------------------------------------
    # STEP 4: Stress-Testing Under Severe Climate Stress Scenario
    # ---------------------------------------------------------
    print("\n[STRESS TEST EXECUTION] Simulating Peak Pre-Monsoon Capillary Surge (Soil EC=14.0 dS/m, Canal EC=8.5 dS/m)...")
    payload_stress = {
        "region_id": target_region,
        "soil_ec_override": 14.0,
        "canal_ec_override": 8.5,
        "swot_wse_delta_m": 0.4,
        "priority_preference": "risk_aversion"
    }
    stress_res = client.post("/api/v1/crop-rotation/evaluate", json=payload_stress)
    assert stress_res.status_code == 200, "Stress evaluation failed"
    stress_data = stress_res.json()

    print(f"-> Under Extreme Salinity Stress:")
    print(f"   Advisory: {stress_data['summary_advisory']}")
    print(f"   Recommended: {stress_data['recommended_rotation_id']}")
    for s in stress_data["evaluated_rotations"]:
        print(f"   - {s['name'][:35]}: Score {s['overall_feasibility_score']}/100 | Risk: {s['risk_level']} | Net Profit: ৳{s['total_net_profit_bdt']:,.0f}")
        for season in s["seasons"]:
            if season["crop_name"] != "Fallow (অনাবাদি)":
                print(f"       * {season['crop_name']}: Yield Loss {season['expected_yield_loss_pct']}% | Feasibility: {season['feasibility_status']}")

    print("\n" + "=" * 80)
    print("ALL 5 CHALLENGE POINTS SUCCESSFULLY EXECUTED AND VERIFIED.")
    print("=" * 80)

if __name__ == "__main__":
    run_execution_benchmark()

import pytest
from services.api.app.services.crop_engine import AgronomicEngine, CropEvaluationInput

def test_maas_hoffman_below_threshold():
    # Below threshold -> 0% yield loss
    loss = AgronomicEngine.calculate_maas_hoffman_yield_loss(ece=4.0, threshold=8.0, slope_b=8.5)
    assert loss == 0.0

def test_maas_hoffman_above_threshold():
    # BRRI dhan67: threshold 8.0 dS/m, slope 8.5%
    # At 10.0 dS/m: loss = 8.5 * (10.0 - 8.0) = 17.0%
    loss = AgronomicEngine.calculate_maas_hoffman_yield_loss(ece=10.0, threshold=8.0, slope_b=8.5)
    assert loss == 17.0

def test_maas_hoffman_cap():
    # Extreme salinity cap at 100%
    loss = AgronomicEngine.calculate_maas_hoffman_yield_loss(ece=30.0, threshold=3.0, slope_b=12.0)
    assert loss == 100.0

def test_effective_root_zone_ec():
    # Non-irrigated uses native soil EC
    ec_rainfed = AgronomicEngine.calculate_effective_root_zone_ec(soil_ec=6.0, canal_ec=8.0, is_irrigated=False)
    assert ec_rainfed == 6.0

    # Irrigated factors in canal EC (5.0 dS/m canal water elevates effective EC to 6.6)
    ec_irrigated = AgronomicEngine.calculate_effective_root_zone_ec(soil_ec=6.0, canal_ec=5.0, is_irrigated=True)
    assert ec_irrigated == 6.6

def test_hydraulic_sluice_evaluation():
    # High river salinity (>6 dS/m) triggers strict shutoff
    res = AgronomicEngine.evaluate_hydraulic_sluice_gate(wse_pwd=1.80, river_ec=12.5)
    assert res["intake_status"] == "STRICT_SHUTOFF"
    assert "shut" in res["sluice_advisory"].lower()

    # Low river salinity (<2 dS/m) permits intake
    res_fresh = AgronomicEngine.evaluate_hydraulic_sluice_gate(wse_pwd=1.80, river_ec=1.2)
    assert res_fresh["intake_status"] == "ACTIVE_INTAKE_PERMITTED"

def test_evaluate_crop_season():
    inp = CropEvaluationInput(
        crop_name="Salt Boro",
        variety="BRRI dhan67",
        season_name="Rabi",
        duration_days=140,
        water_req_mm=850.0,
        threshold_ec=8.0,
        slope_b=8.5,
        potential_yield_ton=6.8,
        market_price_per_kg=30.0,
        production_cost_ha=90000.0,
        soil_ec=6.5,
        canal_ec=2.0,
        irrigation_source="Canal",
        advisory="Early seeding"
    )
    result = AgronomicEngine.evaluate_crop_season(inp)
    assert result.feasibility_status == "OPTIMAL"
    assert result.net_profit_bdt_per_ha > 0


def test_evaluate_crop_season_with_conformal_q():
    """Verify that group-conditional conformal_q modulates worst-case confidence bounds."""
    # Under tight upstream monsoon bounds (q=1.2)
    inp_tight = CropEvaluationInput(
        crop_name="Sunflower",
        variety="Hysun 33",
        season_name="Rabi",
        duration_days=110,
        water_req_mm=350.0,
        threshold_ec=4.8,
        slope_b=5.5,
        potential_yield_ton=2.5,
        market_price_per_kg=65.0,
        production_cost_ha=45000.0,
        soil_ec=4.5,
        canal_ec=1.5,
        irrigation_source="Canal",
        advisory="Low salinity regime",
        soil_ec_std=0.4,
        conformal_q=1.2
    )
    res_tight = AgronomicEngine.evaluate_crop_season(inp_tight)

    # Under wide estuarine dry season bounds (q=3.5)
    inp_wide = CropEvaluationInput(
        crop_name="Sunflower",
        variety="Hysun 33",
        season_name="Rabi",
        duration_days=110,
        water_req_mm=350.0,
        threshold_ec=4.8,
        slope_b=5.5,
        potential_yield_ton=2.5,
        market_price_per_kg=65.0,
        production_cost_ha=45000.0,
        soil_ec=4.5,
        canal_ec=1.5,
        irrigation_source="Canal",
        advisory="Estuarine boundary regime",
        soil_ec_std=0.4,
        conformal_q=3.5
    )
    res_wide = AgronomicEngine.evaluate_crop_season(inp_wide)

    # Worst-case EC bound and yield loss must be higher under wider seaward conformal intervals
    assert res_wide.confidence_interval_ec[1] > res_tight.confidence_interval_ec[1]
    assert res_wide.worst_case_yield_loss_pct >= res_tight.worst_case_yield_loss_pct


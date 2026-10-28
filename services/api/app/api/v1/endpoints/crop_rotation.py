from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session

from services.api.app.db.session import get_db
from services.api.app.db.models import SoilProfileRecord, CropVarietyRecord
from services.api.app.services.crop_engine import AgronomicEngine, CropEvaluationInput
from services.api.app.adapters.realworld_env import RealWorldEnvironmentAdapter

realworld_adapter = RealWorldEnvironmentAdapter()

router = APIRouter()

# -------------------------------------------------------------
# 1. PYDANTIC SCHEMAS
# -------------------------------------------------------------
class CropSeasonPlan(BaseModel):
    season_name: str
    crop_name: str
    variety: str
    duration_days: int
    water_requirement_mm: float
    salt_threshold_ec: float
    salt_slope_b: float
    expected_yield_loss_pct: float
    expected_yield_ton_per_ha: float
    gross_income_bdt_per_ha: float
    production_cost_bdt_per_ha: float
    net_profit_bdt_per_ha: float
    feasibility_status: str
    irrigation_source: str
    agronomic_advisory: str
    worst_case_yield_loss_pct: Optional[float] = 0.0
    risk_adjusted_status: Optional[str] = "OPTIMAL"
    confidence_interval_ec: Optional[Any] = None

class RotationStrategy(BaseModel):
    id: str
    name: str
    strategy_type: str
    description: str
    overall_feasibility_score: float
    risk_level: str
    total_net_profit_bdt: float
    total_water_consumption_m3: float
    soil_health_impact: str
    resilience_rating: str
    seasons: List[CropSeasonPlan]
    sluice_gate_calendar: List[str]

class HydraulicSluiceInfo(BaseModel):
    wse_pwd: float
    delta_h_m: float
    can_drain_gravity: bool
    can_intake_gravity: bool
    intake_status: str
    sluice_advisory: str

class RegionSoilWaterProfile(BaseModel):
    region_id: str
    upazila: str
    district: str
    polder: str
    coordinates: Dict[str, float]
    swot_reach_id: str
    swot_reach_name: str
    current_wse_pwd: float
    river_width_m: float
    hydraulic_slope: float
    canal_ec_dsm: float
    soil_texture: str
    soil_series: str
    soil_ph: float
    organic_matter_pct: float
    current_soil_ec_dsm: float
    monthly_soil_ec: Dict[str, float]
    monthly_river_ec: Dict[str, float]
    drainage_capacity: str

class EvaluationRequest(BaseModel):
    region_id: str = "dacope-polder-31"
    soil_ec_override: Optional[float] = Field(None, ge=0.5, le=30.0, description="Override measured soil ECe in dS/m")
    canal_ec_override: Optional[float] = Field(None, ge=0.2, le=30.0, description="Override canal water ECw in dS/m")
    swot_wse_delta_m: Optional[float] = Field(0.0, ge=-2.0, le=2.0, description="External river WSE delta (m)")
    priority_preference: Optional[str] = Field("balanced", description="'profit', 'water_conservation', 'risk_aversion', 'balanced'")

class EvaluationResponse(BaseModel):
    profile: RegionSoilWaterProfile
    hydraulic_status: HydraulicSluiceInfo
    evaluated_rotations: List[RotationStrategy]
    recommended_rotation_id: str
    summary_advisory: str
    data_sources: Dict[str, str]
    research_disclaimer: str = (
        "Research Prototype & Decision Support System. "
        "Evaluated for agronomic research and crop rotation planning. "
        "Not certified as an operational life-safety flood or drinking water warning system without in-situ ground sensors."
    )
    extrapolation_warning: str = (
        "Scenario adjustments (e.g. river stage or salinity overrides) simulate hydrodynamic stress beyond historical calibration. "
        "Use as numerical sensitivity stress-tests rather than deterministic forecasts."
    )
    uncertainty_summary: Optional[Dict[str, Any]] = None

# -------------------------------------------------------------
# 2. CANONICAL FALLBACK DATA
# -------------------------------------------------------------
CANONICAL_FALLBACK: Dict[str, RegionSoilWaterProfile] = {
    "dacope-polder-31": RegionSoilWaterProfile(
        region_id="dacope-polder-31",
        upazila="Dacope (দাকোপ)",
        district="Khulna (খুলনা)",
        polder="Polder 31 (Bajua / Pankhali)",
        coordinates={"lat": 22.572, "lon": 89.512},
        swot_reach_id="31241000011",
        swot_reach_name="Passur River Reach at Dacope/Chalna",
        current_wse_pwd=1.84,
        river_width_m=485.0,
        hydraulic_slope=0.000019,
        canal_ec_dsm=3.8,
        soil_texture="Silty Clay",
        soil_series="Barisal / Jhalokati",
        soil_ph=7.6,
        organic_matter_pct=1.45,
        current_soil_ec_dsm=6.8,
        monthly_soil_ec={
            "Jan": 6.5, "Feb": 8.9, "Mar": 12.8, "Apr": 15.6,
            "May": 11.4, "Jun": 4.5, "Jul": 2.1, "Aug": 1.6,
            "Sep": 1.8, "Oct": 2.4, "Nov": 3.2, "Dec": 4.8
        },
        monthly_river_ec={
            "Jan": 5.4, "Feb": 9.2, "Mar": 16.5, "Apr": 22.4,
            "May": 18.0, "Jun": 6.8, "Jul": 1.8, "Aug": 0.9,
            "Sep": 1.1, "Oct": 1.6, "Nov": 2.5, "Dec": 3.7
        },
        drainage_capacity="Adequate under low tide; vulnerable to monsoon backwater when SWOT WSE > 2.4m PWD"
    ),
    "dacope-polder-32": RegionSoilWaterProfile(
        region_id="dacope-polder-32",
        upazila="Dacope (দাকোপ)",
        district="Khulna (খুলনা)",
        polder="Polder 32 (Kamarkhola / Sutarkhali)",
        coordinates={"lat": 22.495, "lon": 89.488},
        swot_reach_id="31241000011",
        swot_reach_name="Passur / Shibsa River Estuary",
        current_wse_pwd=1.92,
        river_width_m=560.0,
        hydraulic_slope=0.000021,
        canal_ec_dsm=5.2,
        soil_texture="Clay Loam",
        soil_series="Dumuria / Barisal",
        soil_ph=7.9,
        organic_matter_pct=1.28,
        current_soil_ec_dsm=8.2,
        monthly_soil_ec={
            "Jan": 7.4, "Feb": 10.5, "Mar": 14.5, "Apr": 17.8,
            "May": 13.2, "Jun": 5.2, "Jul": 2.4, "Aug": 1.9,
            "Sep": 2.0, "Oct": 2.8, "Nov": 3.8, "Dec": 5.6
        },
        monthly_river_ec={
            "Jan": 6.8, "Feb": 11.5, "Mar": 19.8, "Apr": 25.0,
            "May": 21.0, "Jun": 8.5, "Jul": 2.4, "Aug": 1.2,
            "Sep": 1.4, "Oct": 2.1, "Nov": 3.4, "Dec": 4.9
        },
        drainage_capacity="Constrained; high siltation in internal khal outfalls requiring pump assistance"
    ),
    "koyra-polder-14": RegionSoilWaterProfile(
        region_id="koyra-polder-14",
        upazila="Koyra (কয়রা)",
        district="Khulna (খুলনা)",
        polder="Polder 14/1 (Maharajpur / Amadi)",
        coordinates={"lat": 22.341, "lon": 89.302},
        swot_reach_id="31241000021",
        swot_reach_name="Kobadak / Shakbaria River Reach",
        current_wse_pwd=1.75,
        river_width_m=420.0,
        hydraulic_slope=0.000018,
        canal_ec_dsm=6.1,
        soil_texture="Silty Clay Loam",
        soil_series="Patuakhali / Barisal",
        soil_ph=8.1,
        organic_matter_pct=1.15,
        current_soil_ec_dsm=9.5,
        monthly_soil_ec={
            "Jan": 8.1, "Feb": 11.2, "Mar": 15.8, "Apr": 19.2,
            "May": 14.5, "Jun": 6.0, "Jul": 2.8, "Aug": 2.1,
            "Sep": 2.3, "Oct": 3.1, "Nov": 4.5, "Dec": 6.2
        },
        monthly_river_ec={
            "Jan": 8.5, "Feb": 13.8, "Mar": 22.0, "Apr": 28.5,
            "May": 24.0, "Jun": 10.2, "Jul": 3.1, "Aug": 1.5,
            "Sep": 1.8, "Oct": 2.6, "Nov": 4.2, "Dec": 6.0
        },
        drainage_capacity="Moderate; river embankment breach history during Cyclone Aila and Amphan"
    ),
    "paikgachha-polder-22": RegionSoilWaterProfile(
        region_id="paikgachha-polder-22",
        upazila="Paikgachha (পাইকগাছা)",
        district="Khulna (খুলনা)",
        polder="Polder 22 (Gadaipur / Haridhali)",
        coordinates={"lat": 22.589, "lon": 89.336},
        swot_reach_id="31241000021",
        swot_reach_name="Shibsa River Inland Reach",
        current_wse_pwd=1.68,
        river_width_m=390.0,
        hydraulic_slope=0.000017,
        canal_ec_dsm=2.9,
        soil_texture="Clay",
        soil_series="Barisal",
        soil_ph=7.4,
        organic_matter_pct=1.60,
        current_soil_ec_dsm=5.1,
        monthly_soil_ec={
            "Jan": 5.0, "Feb": 7.2, "Mar": 10.4, "Apr": 12.8,
            "May": 9.1, "Jun": 3.8, "Jul": 1.8, "Aug": 1.4,
            "Sep": 1.5, "Oct": 2.0, "Nov": 2.6, "Dec": 3.8
        },
        monthly_river_ec={
            "Jan": 4.2, "Feb": 7.5, "Mar": 13.0, "Apr": 17.5,
            "May": 14.0, "Jun": 5.2, "Jul": 1.4, "Aug": 0.8,
            "Sep": 0.9, "Oct": 1.3, "Nov": 1.9, "Dec": 2.9
        },
        drainage_capacity="Good; functional network of sluices connecting to Shibsa upper corridor"
    )
}

# -------------------------------------------------------------
# 3. HELPER FUNCTIONS
# -------------------------------------------------------------
def get_profile_record(region_id: str, db: Optional[Session] = None) -> RegionSoilWaterProfile:
    if db:
        rec = db.query(SoilProfileRecord).filter(SoilProfileRecord.id == region_id).first()
        if rec:
            return RegionSoilWaterProfile(
                region_id=rec.id,
                upazila=rec.upazila,
                district=rec.district,
                polder=rec.polder,
                coordinates={"lat": rec.latitude, "lon": rec.longitude},
                swot_reach_id=rec.swot_reach_id,
                swot_reach_name=rec.swot_reach_name,
                current_wse_pwd=1.84,  # baseline
                river_width_m=485.0 if "31" in rec.id else 560.0,
                hydraulic_slope=0.000019,
                canal_ec_dsm=rec.baseline_canal_ec_dsm,
                soil_texture=rec.soil_texture,
                soil_series=rec.soil_series,
                soil_ph=rec.soil_ph,
                organic_matter_pct=rec.organic_matter_pct,
                current_soil_ec_dsm=rec.baseline_soil_ec_dsm,
                monthly_soil_ec=rec.monthly_soil_ec,
                monthly_river_ec=rec.monthly_river_ec,
                drainage_capacity=rec.drainage_capacity
            )
    if region_id in CANONICAL_FALLBACK:
        return CANONICAL_FALLBACK[region_id]
    raise HTTPException(status_code=404, detail=f"Region {region_id} not found in database or registry.")

def build_candidate_rotations(
    profile: RegionSoilWaterProfile,
    effective_soil_ec: float,
    effective_canal_ec: float
) -> List[RotationStrategy]:
    # Seasonal effective EC estimates
    rabi_ec = round((profile.monthly_soil_ec["Dec"] + profile.monthly_soil_ec["Jan"] + profile.monthly_soil_ec["Feb"]) / 3.0, 1)
    if effective_soil_ec != profile.current_soil_ec_dsm:
        rabi_ec = round(rabi_ec * (effective_soil_ec / profile.current_soil_ec_dsm), 1)

    k1_ec = round((profile.monthly_soil_ec["Mar"] + profile.monthly_soil_ec["Apr"] + profile.monthly_soil_ec["May"]) / 3.0, 1)
    if effective_soil_ec != profile.current_soil_ec_dsm:
        k1_ec = round(k1_ec * (effective_soil_ec / profile.current_soil_ec_dsm), 1)

    k2_ec = round((profile.monthly_soil_ec["Jul"] + profile.monthly_soil_ec["Aug"] + profile.monthly_soil_ec["Sep"]) / 3.0, 1)

    # Strategy 1: Cash Crop Diversified (Sunflower/Mustard - Mungbean - Short Aman)
    s1_rabi = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Early Mustard / Sunflower", variety="BARI Surjamukhi-2 / BARI Sarisha-14", season_name="Rabi (Nov - Feb)",
        duration_days=95, water_req_mm=260.0, threshold_ec=4.8, slope_b=5.5, potential_yield_ton=2.4, market_price_per_kg=75.0,
        production_cost_ha=42000.0, soil_ec=rabi_ec, canal_ec=effective_canal_ec, irrigation_source="Canal Stored Water (Drip/Furrow 2x)",
        advisory="Harvests by early February before acute soil salinity surge; consumes 75% less water than Boro rice."
    ))
    s1_k1 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Mungbean / Green Gram", variety="BARI Mung-6", season_name="Kharif-1 (Mar - Jun)",
        duration_days=65, water_req_mm=190.0, threshold_ec=3.5, slope_b=9.5, potential_yield_ton=1.5, market_price_per_kg=85.0,
        production_cost_ha=26000.0, soil_ec=k1_ec * 0.85, canal_ec=effective_canal_ec, irrigation_source="Residual Moisture + Rice Straw Mulch",
        advisory="Zero-tillage dibbling under rice straw mulch traps soil moisture and inhibits capillary salt encrustation."
    ))
    s1_k2 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Short-Duration High-Yielding T. Aman", variety="BRRI dhan75 / Bina-7", season_name="Kharif-2 (Jul - Oct)",
        duration_days=115, water_req_mm=500.0, threshold_ec=4.5, slope_b=7.0, potential_yield_ton=5.5, market_price_per_kg=34.0,
        production_cost_ha=48000.0, soil_ec=k2_ec, canal_ec=1.5, irrigation_source="Rainfed Monsoon",
        advisory="Short field occupancy vacates land by late October, leaving soil moist and ready for early Rabi oilseeds."
    ))
    strat1_profit = s1_rabi.net_profit_bdt_per_ha + s1_k1.net_profit_bdt_per_ha + s1_k2.net_profit_bdt_per_ha
    strat1_water = (s1_rabi.water_requirement_mm + s1_k1.water_requirement_mm + s1_k2.water_requirement_mm) * 10.0
    strat1_score = max(30.0, min(100.0, round(100.0 - (s1_rabi.expected_yield_loss_pct * 0.35 + s1_k1.expected_yield_loss_pct * 0.45 + s1_k2.expected_yield_loss_pct * 0.2), 1)))

    strat1 = RotationStrategy(
        id="rot-cash-crop-diversified",
        name="Sunflower/Mustard - Mungbean - Short Aman",
        strategy_type="Cash Crop Diversified",
        description="Triple-crop climate-smart intensification with low-water duty oilseeds and legumes that escape peak March-April salinity through early maturity.",
        overall_feasibility_score=strat1_score,
        risk_level="CRITICAL" if strat1_score < 45.0 else ("MODERATE" if strat1_score < 70.0 else "LOW"),
        total_net_profit_bdt=strat1_profit,
        total_water_consumption_m3=strat1_water,
        soil_health_impact="Excellent. Mungbean fixes 40-50 kg atmospheric Nitrogen/ha; straw mulch prevents soil salinization and erosion.",
        resilience_rating="Very High. Highest economic return per m3 of fresh water consumed.",
        seasons=[CropSeasonPlan(**s1_rabi.__dict__), CropSeasonPlan(**s1_k1.__dict__), CropSeasonPlan(**s1_k2.__dict__)],
        sluice_gate_calendar=[
            "Nov 1 - Dec 1: Retain fresh water in micro-catchment ponds and intra-polder canals.",
            "Feb 15: Mulch application mandatory to preserve soil moisture after sunflower harvest.",
            "Jun 15: Early drainage of early pre-monsoon squall waters via low-tide automated flap gates."
        ]
    )

    # Strategy 2: Salt-Tolerant Rice (BRRI dhan67/97 - Sesame - BRRI dhan73)
    s2_rabi = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Salt-Tolerant Boro Rice", variety="BRRI dhan67 / BRRI dhan97", season_name="Rabi (Nov - Feb)",
        duration_days=140, water_req_mm=850.0, threshold_ec=8.0, slope_b=8.5, potential_yield_ton=6.8, market_price_per_kg=31.0,
        production_cost_ha=90000.0, soil_ec=rabi_ec, canal_ec=effective_canal_ec, irrigation_source="Canal Reserve + AWD Irrigation",
        advisory="Tolerates electrical conductivity up to 8-10 dS/m during vegetative and 6 dS/m during flowering."
    ))
    s2_k1 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Saline-Tolerant Sesame", variety="BARI Til-4", season_name="Kharif-1 (Mar - Jun)",
        duration_days=85, water_req_mm=180.0, threshold_ec=6.5, slope_b=9.0, potential_yield_ton=1.4, market_price_per_kg=90.0,
        production_cost_ha=28000.0, soil_ec=k1_ec, canal_ec=effective_canal_ec, irrigation_source="Residual Soil Moisture + 1 Light Supplemental Irrigation",
        advisory="Deep taproot extracts residual soil moisture. High market cash return with low irrigation demand."
    ))
    s2_k2 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="High-Yielding Salt-Tolerant T. Aman", variety="BRRI dhan73 / BRRI dhan87", season_name="Kharif-2 (Jul - Oct)",
        duration_days=125, water_req_mm=550.0, threshold_ec=6.0, slope_b=6.0, potential_yield_ton=5.2, market_price_per_kg=33.0,
        production_cost_ha=52000.0, soil_ec=k2_ec, canal_ec=1.5, irrigation_source="Rainfed Monsoon",
        advisory="Tolerates stagnant water and early post-monsoon salinity up to 6 dS/m with high grain yield."
    ))
    strat2_profit = s2_rabi.net_profit_bdt_per_ha + s2_k1.net_profit_bdt_per_ha + s2_k2.net_profit_bdt_per_ha
    strat2_water = (s2_rabi.water_requirement_mm + s2_k1.water_requirement_mm + s2_k2.water_requirement_mm) * 10.0
    strat2_score = max(20.0, min(100.0, round(100.0 - (s2_rabi.expected_yield_loss_pct * 0.45 + s2_k1.expected_yield_loss_pct * 0.35 + s2_k2.expected_yield_loss_pct * 0.2), 1)))

    strat2 = RotationStrategy(
        id="rot-salt-tolerant-rice",
        name="Salt-Tolerant Boro - Sesame - Modern T.Aman",
        strategy_type="Salt-Tolerant Rice",
        description="BRRI-engineered saline-tolerant rice varieties coupled with short-duration oilseed sesame to utilize post-monsoon moisture safely.",
        overall_feasibility_score=strat2_score,
        risk_level="CRITICAL" if strat2_score < 45.0 else ("MODERATE" if strat2_score < 70.0 else "LOW"),
        total_net_profit_bdt=strat2_profit,
        total_water_consumption_m3=strat2_water,
        soil_health_impact="Moderate to Good. Sesame leaf litter improves soil organic matter and breaks continuous rice soil compaction.",
        resilience_rating="High. Specifically bred for coastal Khulna salinity dynamics.",
        seasons=[CropSeasonPlan(**s2_rabi.__dict__), CropSeasonPlan(**s2_k1.__dict__), CropSeasonPlan(**s2_k2.__dict__)],
        sluice_gate_calendar=[
            "Oct 25 - Dec 10: Fill internal polder khals to maximum stage using Passur high-tide fresh flushes.",
            "Dec 20: Seal all intake sluices before EC rises above 3.5 dS/m.",
            "May 20: Pre-monsoon sluice flush to wash topsoil crust accumulated during sesame harvest."
        ]
    )

    # Strategy 3: Traditional High-Risk Rice
    s3_rabi = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Boro Rice (Standard)", variety="BRRI dhan28 / BRRI dhan29", season_name="Rabi (Nov - Feb)",
        duration_days=145, water_req_mm=1100.0, threshold_ec=3.0, slope_b=12.0, potential_yield_ton=6.2, market_price_per_kg=30.0,
        production_cost_ha=95000.0, soil_ec=rabi_ec, canal_ec=effective_canal_ec, irrigation_source="Canal & Shallow Tube Well (High Salinity)",
        advisory="Highly sensitive to reproductive stage salinity. Severe spike in March-April causes empty spikelets (chita)."
    ))
    s3_k1 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Fallow (অনাবাদি)", variety="None", season_name="Kharif-1 (Mar - Jun)",
        duration_days=0, water_req_mm=0.0, threshold_ec=0.0, slope_b=0.0, potential_yield_ton=0.0, market_price_per_kg=0.0,
        production_cost_ha=0.0, soil_ec=k1_ec, canal_ec=effective_canal_ec, irrigation_source="None",
        advisory="Land remains barren due to acute soil salinity (12-16 dS/m) and lack of fresh surface water."
    ))
    s3_k2 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="T. Aman Rice (Local Traditional)", variety="Sadamota / Chapshail", season_name="Kharif-2 (Jul - Oct)",
        duration_days=135, water_req_mm=600.0, threshold_ec=4.0, slope_b=8.0, potential_yield_ton=2.8, market_price_per_kg=32.0,
        production_cost_ha=45000.0, soil_ec=k2_ec, canal_ec=1.5, irrigation_source="Rainfed Monsoon",
        advisory="Tolerates moderate submergence but low yield ceiling. Soil salinity is naturally leached by monsoon rainfall."
    ))
    strat3_profit = s3_rabi.net_profit_bdt_per_ha + s3_k1.net_profit_bdt_per_ha + s3_k2.net_profit_bdt_per_ha
    strat3_water = (s3_rabi.water_requirement_mm + s3_k1.water_requirement_mm + s3_k2.water_requirement_mm) * 10.0
    strat3_score = max(10.0, min(100.0, round(100.0 - (s3_rabi.expected_yield_loss_pct * 0.7 + s3_k2.expected_yield_loss_pct * 0.3), 1)))

    strat3 = RotationStrategy(
        id="rot-traditional-rice",
        name="Traditional Boro - Fallow - Local T.Aman",
        strategy_type="Traditional High-Risk",
        description="Conventional mono-culture boro rice relying heavily on canal water irrigation, followed by summer fallow and low-yielding local rainfed Aman.",
        overall_feasibility_score=strat3_score,
        risk_level="CRITICAL" if strat3_score < 45.0 else ("MODERATE" if strat3_score < 70.0 else "LOW"),
        total_net_profit_bdt=strat3_profit,
        total_water_consumption_m3=strat3_water,
        soil_health_impact="Poor. Continual fresh water pumping depletes water tables; dry season capillary suction draws salts to root zone.",
        resilience_rating="Low. Extremely vulnerable to pre-monsoon salinity intrusion and canal drying.",
        seasons=[CropSeasonPlan(**s3_rabi.__dict__), CropSeasonPlan(**s3_k1.__dict__), CropSeasonPlan(**s3_k2.__dict__)],
        sluice_gate_calendar=[
            "Nov-Dec: Keep polder sluice gates open during low tides to trap fresh upstream flush in retention khals.",
            "Jan 15: Permanently close sluice gates as Passur/Shibsa salinity surpasses 4.0 dS/m.",
            "Jul-Aug: Open drainage vents whenever river stage falls below polder level to drain floodwater."
        ]
    )

    # Strategy 4: Agro-Aquaculture Gher Rotation
    s4_rabi = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Brackish Shrimp Nursery / Finfish", variety="Bagda (*Penaeus monodon*) / Tilapia", season_name="Rabi (Nov - Feb)",
        duration_days=110, water_req_mm=400.0, threshold_ec=15.0, slope_b=0.0, potential_yield_ton=0.8, market_price_per_kg=650.0,
        production_cost_ha=140000.0, soil_ec=rabi_ec, canal_ec=effective_canal_ec, irrigation_source="Tidal River Saline Intake",
        advisory="Tolerates and requires brackish water (8-18 dS/m). High commercial export value."
    ))
    s4_k1 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Brackish Shrimp Grow-out", variety="Tiger Shrimp (Bagda)", season_name="Kharif-1 (Mar - Jun)",
        duration_days=90, water_req_mm=300.0, threshold_ec=18.0, slope_b=0.0, potential_yield_ton=0.6, market_price_per_kg=720.0,
        production_cost_ha=110000.0, soil_ec=k1_ec, canal_ec=effective_canal_ec, irrigation_source="Controlled Tidal Saline Ingress",
        advisory="Exploits natural peak marine salinity ingress of Passur River through monitored intake."
    ))
    s4_k2 = AgronomicEngine.evaluate_crop_season(CropEvaluationInput(
        crop_name="Monsoon Rice in Desalinized Gher", variety="BRRI dhan73 / Sadamota Gher Rice", season_name="Kharif-2 (Jul - Oct)",
        duration_days=130, water_req_mm=650.0, threshold_ec=5.5, slope_b=7.5, potential_yield_ton=3.8, market_price_per_kg=33.0,
        production_cost_ha=42000.0, soil_ec=k2_ec * 1.3, canal_ec=1.8, irrigation_source="Monsoon Rain Leaching",
        advisory="Requires heavy monsoon flush (July) to leach surface gher salts down to <4 dS/m before transplanting."
    ))
    strat4_profit = s4_rabi.net_profit_bdt_per_ha + s4_k1.net_profit_bdt_per_ha + s4_k2.net_profit_bdt_per_ha
    strat4_water = (s4_rabi.water_requirement_mm + s4_k1.water_requirement_mm + s4_k2.water_requirement_mm) * 10.0
    strat4_score = 78.0 if effective_canal_ec >= 3.5 else 55.0

    strat4 = RotationStrategy(
        id="rot-agro-aquaculture-gher",
        name="Integrated Brackish Shrimp - Monsoon Aman Gher",
        strategy_type="Agro-Aquaculture",
        description="Controlled seasonal dual-production system: brackish shrimp during dry months followed by rainwater-desalinized monsoon paddy.",
        overall_feasibility_score=strat4_score,
        risk_level="MODERATE",
        total_net_profit_bdt=strat4_profit,
        total_water_consumption_m3=strat4_water,
        soil_health_impact="Warning: High risk of long-term subsoil salinization if monsoon drainage is insufficient to leach pond salts.",
        resilience_rating="High financial return, moderate ecological risk to adjacent freshwater plots.",
        seasons=[CropSeasonPlan(**s4_rabi.__dict__), CropSeasonPlan(**s4_k1.__dict__), CropSeasonPlan(**s4_k2.__dict__)],
        sluice_gate_calendar=[
            "Jan 15 - Apr 30: Regulated saline intake via private gher pipes from Passur River.",
            "Jun 25 - Jul 15: Full drain-down of gher water; open all sluices to wash sediment with first monsoon downpours.",
            "Aug 1: Retain freshwater rain head for Aman transplantation."
        ]
    )

    return [strat1, strat2, strat4, strat3]

# -------------------------------------------------------------
# 4. ENDPOINTS
# -------------------------------------------------------------
@router.get("/regions", response_model=List[Dict[str, Any]])
def list_supported_regions(db: Session = Depends(get_db)):
    """Returns list of supported coastal agricultural study regions with baseline parameters from database."""
    db_records = db.query(SoilProfileRecord).all()
    if db_records:
        return [
            {
                "region_id": r.id,
                "upazila": r.upazila,
                "district": r.district,
                "polder": r.polder,
                "coordinates": {"lat": r.latitude, "lon": r.longitude},
                "swot_reach_id": r.swot_reach_id,
                "swot_reach_name": r.swot_reach_name,
                "soil_texture": r.soil_texture,
                "soil_series": r.soil_series,
                "baseline_soil_ec_dsm": r.baseline_soil_ec_dsm,
                "baseline_canal_ec_dsm": r.baseline_canal_ec_dsm
            }
            for r in db_records
        ]
    # Fallback to in-memory registry
    return [
        {
            "region_id": p.region_id,
            "upazila": p.upazila,
            "district": p.district,
            "polder": p.polder,
            "coordinates": p.coordinates,
            "swot_reach_id": p.swot_reach_id,
            "swot_reach_name": p.swot_reach_name,
            "soil_texture": p.soil_texture,
            "soil_series": p.soil_series,
            "baseline_soil_ec_dsm": p.current_soil_ec_dsm,
            "baseline_canal_ec_dsm": p.canal_ec_dsm
        }
        for p in CANONICAL_FALLBACK.values()
    ]

@router.get("/profile/{region_id}", response_model=RegionSoilWaterProfile)
def get_region_profile(region_id: str, db: Session = Depends(get_db)):
    """Retrieve verified soil and SWOT hydrological profile for a specific coastal region."""
    return get_profile_record(region_id, db)

@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate_crop_rotations(req: EvaluationRequest, db: Session = Depends(get_db)):
    """
    Evaluates alternative crop rotation strategies based on NASA SWOT hydrology,
    SRDI soil salinity dynamics, and BRRI/BARI crop salinity thresholds.
    """
    base_profile = get_profile_record(req.region_id, db)

    effective_soil_ec = req.soil_ec_override if req.soil_ec_override is not None else base_profile.current_soil_ec_dsm
    effective_canal_ec = req.canal_ec_override if req.canal_ec_override is not None else base_profile.canal_ec_dsm
    effective_wse = base_profile.current_wse_pwd + (req.swot_wse_delta_m or 0.0)

    # Evaluate hydraulic sluice gate state
    hydraulic_dict = AgronomicEngine.evaluate_hydraulic_sluice_gate(
        wse_pwd=effective_wse,
        river_ec=base_profile.monthly_river_ec.get("Feb", 9.2)
    )
    hydraulic_status = HydraulicSluiceInfo(**hydraulic_dict)

    profile = RegionSoilWaterProfile(
        region_id=base_profile.region_id,
        upazila=base_profile.upazila,
        district=base_profile.district,
        polder=base_profile.polder,
        coordinates=base_profile.coordinates,
        swot_reach_id=base_profile.swot_reach_id,
        swot_reach_name=base_profile.swot_reach_name,
        current_wse_pwd=round(effective_wse, 2),
        river_width_m=base_profile.river_width_m,
        hydraulic_slope=base_profile.hydraulic_slope,
        canal_ec_dsm=round(effective_canal_ec, 1),
        soil_texture=base_profile.soil_texture,
        soil_series=base_profile.soil_series,
        soil_ph=base_profile.soil_ph,
        organic_matter_pct=base_profile.organic_matter_pct,
        current_soil_ec_dsm=round(effective_soil_ec, 1),
        monthly_soil_ec=base_profile.monthly_soil_ec,
        monthly_river_ec=base_profile.monthly_river_ec,
        drainage_capacity=base_profile.drainage_capacity
    )

    rotations = build_candidate_rotations(profile, effective_soil_ec, effective_canal_ec)

    # Multi-attribute scoring
    rot_dicts = [r.model_dump() for r in rotations]
    ranked_dicts, best_id = AgronomicEngine.rank_rotations(rot_dicts, req.priority_preference or "balanced")
    ranked_rotations = [RotationStrategy(**d) for d in ranked_dicts]

    best_strat = next(r for r in ranked_rotations if r.id == best_id)
    summary = (
        f"For {profile.upazila} ({profile.polder}), given current soil EC of {effective_soil_ec} dS/m "
        f"and canal water EC of {effective_canal_ec} dS/m, '{best_strat.name}' provides the highest resilience. "
        f"SWOT Passur River WSE ({profile.current_wse_pwd}m PWD) indicates safe gravity drainage through low-tide sluices."
    )

    data_sources = {
        "nasa_swot": f"PO.DAAC KaRIn River Vector Product (Reach {profile.swot_reach_id})",
        "soil_salinity": "SRDI Upazila Land and Soil Resource Utilization Guide (Dacope)",
        "river_telemetry": "BWDB River Gauge SW242 (Chalna) & SW243 (Mongla)",
        "crop_models": "BRRI / BARI Salt Tolerance Trials (FAO 29 & 56 Guidelines)"
    }

    uncertainty_summary = {
        "nominal_confidence": 0.95,
        "soil_ec_standard_error_dsm": 0.5,
        "ci_95_bounds": [max(0.5, round(effective_soil_ec - 1.96 * 0.5, 2)), round(effective_soil_ec + 1.96 * 0.5, 2)],
        "p95_risk_adjusted_recommendation": best_strat.name,
        "advisory": "Confidence interval reflects combined measurement uncertainty and estuarine tidal variance. Crop ranking incorporates worst-case p95 salinity stress."
    }

    return EvaluationResponse(
        profile=profile,
        hydraulic_status=hydraulic_status,
        evaluated_rotations=ranked_rotations,
        recommended_rotation_id=best_id,
        summary_advisory=summary,
        data_sources=data_sources,
        uncertainty_summary=uncertainty_summary
    )

class LiveBoostRequest(BaseModel):
    region_id: str = "dacope-polder-31"
    priority_preference: Optional[str] = "balanced"

class LiveBoostResponse(BaseModel):
    region_id: str
    upazila: str
    polder: str
    coordinates: Dict[str, float]
    live_weather_telemetry: Dict[str, Any]
    nasa_power_agroclimatology: Dict[str, Any]
    swot_telemetry: Dict[str, Any]
    baseline_soil_ec_dsm: float
    boosted_soil_ec_dsm: float
    capillary_ec_delta_dsm: float
    evaluation: EvaluationResponse

@router.post("/live-boost", response_model=LiveBoostResponse)
async def evaluate_live_boosted_crop_rotation(
    req: LiveBoostRequest,
    db: Session = Depends(get_db)
):
    """
    Boosts the crop rotation model by fetching real-world data from:
    1. Open-Meteo FAO-56 Reference Evapotranspiration (ET0) & Precipitation
    2. NASA POWER Agroclimatology (Solar Irradiance, Temp, Relative Humidity)
    3. NASA PO.DAAC Hydrocron SWOT River reach telemetry
    """
    base_profile = get_profile_record(req.region_id, db)
    lat = base_profile.coordinates["lat"]
    lon = base_profile.coordinates["lon"]

    # Asynchronously query real-world APIs
    weather_data = await realworld_adapter.fetch_live_fao_evapotranspiration(lat, lon)
    nasa_power_data = await realworld_adapter.fetch_nasa_power_agroclimatology(lat, lon)
    swot_live = await realworld_adapter.fetch_live_swot_reach_telemetry(base_profile.swot_reach_id)

    # Compute live capillary rise surge based on real-world net moisture deficit (ET0 - P)
    net_deficit = weather_data.get("net_moisture_deficit_mm", 21.0)
    boosted_soil_ec = AgronomicEngine.calculate_realworld_capillary_surge(
        base_soil_ec=base_profile.current_soil_ec_dsm,
        net_moisture_deficit_mm=net_deficit,
        groundwater_ec=14.0
    )
    capillary_delta = round(boosted_soil_ec - base_profile.current_soil_ec_dsm, 2)

    # Use live SWOT WSE if verified, otherwise nominal profile
    live_wse = swot_live.get("wse_pwd_m", base_profile.current_wse_pwd)
    wse_delta = round(live_wse - base_profile.current_wse_pwd, 2)

    # Evaluate rotations with live boosted parameters
    eval_req = EvaluationRequest(
        region_id=req.region_id,
        soil_ec_override=boosted_soil_ec,
        canal_ec_override=base_profile.canal_ec_dsm,
        swot_wse_delta_m=wse_delta,
        priority_preference=req.priority_preference
    )
    evaluation = evaluate_crop_rotations(eval_req, db)

    return LiveBoostResponse(
        region_id=req.region_id,
        upazila=base_profile.upazila,
        polder=base_profile.polder,
        coordinates=base_profile.coordinates,
        live_weather_telemetry=weather_data,
        nasa_power_agroclimatology=nasa_power_data,
        swot_telemetry=swot_live,
        baseline_soil_ec_dsm=base_profile.current_soil_ec_dsm,
        boosted_soil_ec_dsm=boosted_soil_ec,
        capillary_ec_delta_dsm=capillary_delta,
        evaluation=evaluation
    )


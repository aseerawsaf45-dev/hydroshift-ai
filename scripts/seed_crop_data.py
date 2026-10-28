import os
import sys
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.api.app.db.session import engine, SessionLocal
from services.api.app.db.models import Base, SoilProfileRecord, CropVarietyRecord

def seed_soil_and_crops():
    print("Initializing Database Tables for Crop Rotation DSS...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Seed SRDI Regional Soil Profiles
    soil_profiles = [
        SoilProfileRecord(
            id="dacope-polder-31",
            upazila="Dacope",
            district="Khulna",
            polder="Polder 31 (Bajua / Pankhali)",
            latitude=22.572,
            longitude=89.512,
            swot_reach_id="31241000011",
            swot_reach_name="Passur River Reach at Dacope/Chalna",
            soil_texture="Silty Clay",
            soil_series="Barisal / Jhalokati",
            soil_ph=7.6,
            organic_matter_pct=1.45,
            baseline_soil_ec_dsm=6.8,
            baseline_canal_ec_dsm=3.8,
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
            drainage_capacity="Adequate under low tide; vulnerable to monsoon backwater when SWOT WSE > 2.4m PWD",
            source_agency="SRDI Khulna Regional Lab"
        ),
        SoilProfileRecord(
            id="dacope-polder-32",
            upazila="Dacope",
            district="Khulna",
            polder="Polder 32 (Kamarkhola / Sutarkhali)",
            latitude=22.495,
            longitude=89.488,
            swot_reach_id="31241000011",
            swot_reach_name="Passur / Shibsa River Estuary",
            soil_texture="Clay Loam",
            soil_series="Dumuria / Barisal",
            soil_ph=7.9,
            organic_matter_pct=1.28,
            baseline_soil_ec_dsm=8.2,
            baseline_canal_ec_dsm=5.2,
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
            drainage_capacity="Constrained; high siltation in internal khal outfalls requiring pump assistance",
            source_agency="SRDI Khulna Regional Lab"
        ),
        SoilProfileRecord(
            id="koyra-polder-14",
            upazila="Koyra",
            district="Khulna",
            polder="Polder 14/1 (Maharajpur / Amadi)",
            latitude=22.341,
            longitude=89.302,
            swot_reach_id="31241000021",
            swot_reach_name="Kobadak / Shakbaria River Reach",
            soil_texture="Silty Clay Loam",
            soil_series="Patuakhali / Barisal",
            soil_ph=8.1,
            organic_matter_pct=1.15,
            baseline_soil_ec_dsm=9.5,
            baseline_canal_ec_dsm=6.1,
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
            drainage_capacity="Moderate; river embankment breach history during Cyclone Aila and Amphan",
            source_agency="SRDI Satkhira & Khulna Labs"
        ),
        SoilProfileRecord(
            id="paikgachha-polder-22",
            upazila="Paikgachha",
            district="Khulna",
            polder="Polder 22 (Gadaipur / Haridhali)",
            latitude=22.589,
            longitude=89.336,
            swot_reach_id="31241000021",
            swot_reach_name="Shibsa River Inland Reach",
            soil_texture="Clay",
            soil_series="Barisal",
            soil_ph=7.4,
            organic_matter_pct=1.60,
            baseline_soil_ec_dsm=5.1,
            baseline_canal_ec_dsm=2.9,
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
            drainage_capacity="Good; functional network of sluices connecting to Shibsa upper corridor",
            source_agency="SRDI Khulna Regional Lab"
        )
    ]

    for sp in soil_profiles:
        existing = db.query(SoilProfileRecord).filter(SoilProfileRecord.id == sp.id).first()
        if existing:
            db.delete(existing)
        db.add(sp)
    db.commit()
    print(f"  -> Successfully seeded {len(soil_profiles)} SRDI Regional Soil Profiles.")

    # 2. Seed BRRI & BARI Crop Varieties
    crop_varieties = [
        CropVarietyRecord(
            id="brri-dhan67",
            crop_name="Salt-Tolerant Boro Rice",
            variety_name="BRRI dhan67",
            developing_agency="BRRI",
            season="Rabi",
            growth_duration_days=140,
            water_requirement_mm=850.0,
            salt_threshold_ec=8.0,
            salt_slope_b=8.5,
            potential_yield_ton_ha=6.8,
            market_price_per_kg=31.0,
            production_cost_ha=90000.0,
            description="Tolerates EC up to 8-10 dS/m during vegetative and 6 dS/m during flowering."
        ),
        CropVarietyRecord(
            id="brri-dhan28",
            crop_name="Standard Boro Rice",
            variety_name="BRRI dhan28",
            developing_agency="BRRI",
            season="Rabi",
            growth_duration_days=145,
            water_requirement_mm=1100.0,
            salt_threshold_ec=3.0,
            salt_slope_b=12.0,
            potential_yield_ton_ha=6.2,
            market_price_per_kg=30.0,
            production_cost_ha=95000.0,
            description="Conventional mega-variety, highly susceptible to reproductive salinity above 3.5 dS/m."
        ),
        CropVarietyRecord(
            id="bari-surjamukhi-2",
            crop_name="Sunflower",
            variety_name="BARI Surjamukhi-2",
            developing_agency="BARI",
            season="Rabi",
            growth_duration_days=95,
            water_requirement_mm=260.0,
            salt_threshold_ec=4.8,
            salt_slope_b=5.5,
            potential_yield_ton_ha=2.4,
            market_price_per_kg=75.0,
            production_cost_ha=42000.0,
            description="Short-duration oilseed; harvested in early February before acute March salinity."
        ),
        CropVarietyRecord(
            id="bari-mung-6",
            crop_name="Mungbean",
            variety_name="BARI Mung-6",
            developing_agency="BARI",
            season="Kharif-1",
            growth_duration_days=65,
            water_requirement_mm=190.0,
            salt_threshold_ec=3.5,
            salt_slope_b=9.5,
            potential_yield_ton_ha=1.5,
            market_price_per_kg=85.0,
            production_cost_ha=26000.0,
            description="Zero-tillage under straw mulch traps moisture and fixes 40-50 kg atmospheric Nitrogen/ha."
        ),
        CropVarietyRecord(
            id="bari-til-4",
            crop_name="Sesame",
            variety_name="BARI Til-4",
            developing_agency="BARI",
            season="Kharif-1",
            growth_duration_days=85,
            water_requirement_mm=180.0,
            salt_threshold_ec=6.5,
            salt_slope_b=9.0,
            potential_yield_ton_ha=1.4,
            market_price_per_kg=90.0,
            production_cost_ha=28000.0,
            description="Deep taproot extracts subsoil residual moisture; high cash return with minimal irrigation."
        ),
        CropVarietyRecord(
            id="brri-dhan73",
            crop_name="Salt-Tolerant T. Aman Rice",
            variety_name="BRRI dhan73",
            developing_agency="BRRI",
            season="Kharif-2",
            growth_duration_days=125,
            water_requirement_mm=550.0,
            salt_threshold_ec=6.0,
            salt_slope_b=6.0,
            potential_yield_ton_ha=5.2,
            market_price_per_kg=33.0,
            production_cost_ha=52000.0,
            description="Tolerates early post-monsoon salinity up to 6 dS/m; ideal for coastal polders."
        ),
        CropVarietyRecord(
            id="brri-dhan75",
            crop_name="Short-Duration T. Aman Rice",
            variety_name="BRRI dhan75",
            developing_agency="BRRI",
            season="Kharif-2",
            growth_duration_days=115,
            water_requirement_mm=500.0,
            salt_threshold_ec=4.5,
            salt_slope_b=7.0,
            potential_yield_ton_ha=5.5,
            market_price_per_kg=34.0,
            production_cost_ha=48000.0,
            description="Vacates field by late October, leaving soil moist and ready for early Rabi oilseeds."
        )
    ]

    for cv in crop_varieties:
        existing = db.query(CropVarietyRecord).filter(CropVarietyRecord.id == cv.id).first()
        if existing:
            db.delete(existing)
        db.add(cv)
    db.commit()
    print(f"  -> Successfully seeded {len(crop_varieties)} BRRI/BARI Crop Varieties.")
    db.close()
    print("Database seeding completed cleanly!")

if __name__ == "__main__":
    seed_soil_and_crops()

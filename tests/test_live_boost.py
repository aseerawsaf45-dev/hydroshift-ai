import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app

client = TestClient(app)

def test_live_boost_endpoint():
    payload = {
        "region_id": "dacope-polder-31",
        "priority_preference": "balanced"
    }
    response = client.post("/api/v1/crop-rotation/live-boost", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["region_id"] == "dacope-polder-31"
    assert "live_weather_telemetry" in data
    assert "nasa_power_agroclimatology" in data
    assert "swot_telemetry" in data
    assert "boosted_soil_ec_dsm" in data
    assert data["boosted_soil_ec_dsm"] > 0
    assert "evaluation" in data
    assert len(data["evaluation"]["evaluated_rotations"]) == 4

    # Verify weather telemetry structure
    weather = data["live_weather_telemetry"]
    assert "net_moisture_deficit_mm" in weather

    # Verify NASA POWER structure
    nasa = data["nasa_power_agroclimatology"]
    assert "solar_radiation_mj_m2_day" in nasa

import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app

client = TestClient(app)

def test_crop_rotation_regions():
    response = client.get("/api/v1/crop-rotation/regions")
    assert response.status_code == 200
    regions = response.json()
    assert len(regions) >= 4
    region_ids = [r["region_id"] for r in regions]
    assert "dacope-polder-31" in region_ids
    assert "dacope-polder-32" in region_ids

def test_crop_rotation_profile():
    response = client.get("/api/v1/crop-rotation/profile/dacope-polder-31")
    assert response.status_code == 200
    data = response.json()
    assert "Dacope" in data["upazila"]
    assert data["soil_texture"] == "Silty Clay"
    assert "Jan" in data["monthly_soil_ec"]
    assert data["monthly_soil_ec"]["Apr"] > 14.0  # Peak dry season salinity

def test_crop_rotation_evaluation():
    payload = {
        "region_id": "dacope-polder-31",
        "soil_ec_override": 7.5,
        "canal_ec_override": 4.0,
        "swot_wse_delta_m": 0.2,
        "priority_preference": "balanced"
    }
    response = client.post("/api/v1/crop-rotation/evaluate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "evaluated_rotations" in res
    assert len(res["evaluated_rotations"]) == 4
    assert res["recommended_rotation_id"] in ["rot-cash-crop-diversified", "rot-salt-tolerant-rice", "rot-traditional-rice", "rot-agro-aquaculture-gher"]
    assert "data_sources" in res
    assert "SRDI" in res["data_sources"]["soil_salinity"]

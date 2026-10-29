import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app

client = TestClient(app)

def test_health_live():
    """Verify that the core API is alive and responding."""
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": None}

def test_audit_checklist():
    """Verify that the real-time audit checklist endpoint responds with 100% compliance."""
    response = client.get("/api/v1/audit/checklist")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["compliance_score_percent"] == 100.0
    assert len(data["checklist"]) >= 8
    assert data["passed_checks"] == len(data["checklist"])


def test_reach_drainage_endpoint():
    """Verify polder flap-gate drainage endpoint evaluates hydraulic head properly."""
    # Test active drainage scenario
    resp = client.get("/api/v1/reaches/SW244/drainage?river_wse=0.70&canal_stage=1.30")
    assert resp.status_code == 200
    data = resp.json()
    assert data["gate_state"] == "ACTIVE_GRAVITY_DRAINAGE"
    assert data["is_draining"] is True
    assert data["head_difference_m"] == -0.60
    assert data["discharge_capacity_m3s"] > 5.0

    # Test locked shut scenario
    resp2 = client.get("/api/v1/reaches/SW244/drainage?river_wse=2.20&canal_stage=1.30")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["gate_state"] == "LOCKED_SHUT_PREVENTING_BACKFLOW"
    assert data2["is_draining"] is False
    assert data2["backflow_prevented"] is True


def test_reach_hydraulics_endpoint():
    """Verify SWORD reach geometry and advective continuity calculation."""
    resp = client.get("/api/v1/reaches/SW241/hydraulics?upstream_q_m3s=300.0")
    assert resp.status_code == 200
    data = resp.json()
    assert data["sword_width_m"] == 480.0
    assert data["estimated_depth_m"] == 8.2
    assert data["nominal_velocity_ms"] > 0.0


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

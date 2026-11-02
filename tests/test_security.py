import pytest
import os
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app.core.security import mask_secret, is_api_key_valid

client = TestClient(app)

def test_mask_secret():
    assert mask_secret(None) == "<none>"
    assert mask_secret("") == "<none>"
    assert mask_secret("short") == "***"
    assert mask_secret("rnd_rzAQFm6O7gTiADo8EU55IxiEi2tu") == "rnd_***2tu"
    assert mask_secret("secret_api_key_12345") == "secr***345"

def test_security_headers_present():
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-xss-protection") == "1; mode=block"
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

def test_auth_status_endpoint():
    response = client.get("/api/v1/auth/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "environment" in data
    assert "auth_enforced" in data

def test_api_key_validation_with_keys(monkeypatch):
    monkeypatch.setenv("API_SECRET_KEY", "super-secret-key-999")
    monkeypatch.setenv("SWOT_API_KEYS", "client-a-key,client-b-key")
    monkeypatch.setenv("ENVIRONMENT", "production")

    assert is_api_key_valid("super-secret-key-999") is True
    assert is_api_key_valid("client-a-key") is True
    assert is_api_key_valid("client-b-key") is True
    assert is_api_key_valid("wrong-key") is False
    assert is_api_key_valid("") is False
    assert is_api_key_valid(None) is False

    # Test verify-key endpoint with valid X-API-Key
    resp_valid = client.get("/api/v1/auth/verify-key", headers={"X-API-Key": "super-secret-key-999"})
    assert resp_valid.status_code == 200
    assert resp_valid.json()["status"] == "valid"

    # Test verify-key endpoint with valid Authorization Bearer
    resp_bearer = client.get("/api/v1/auth/verify-key", headers={"Authorization": "Bearer client-a-key"})
    assert resp_bearer.status_code == 200
    assert resp_bearer.json()["status"] == "valid"

    # Test verify-key endpoint with invalid key
    resp_invalid = client.get("/api/v1/auth/verify-key", headers={"X-API-Key": "invalid-token"})
    assert resp_invalid.status_code == 401
    assert "Invalid API Key" in resp_invalid.json()["detail"]

    # Test verify-key endpoint with missing key
    resp_missing = client.get("/api/v1/auth/verify-key")
    assert resp_missing.status_code == 401
    assert "Missing API Key" in resp_missing.json()["detail"]

    # Test protected upload endpoint rejected without key
    resp_upload = client.post("/api/v1/data/upload/csv")
    assert resp_upload.status_code == 401

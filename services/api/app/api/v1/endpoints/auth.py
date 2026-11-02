from fastapi import APIRouter, Depends
from typing import Dict, Any
import os

from services.api.app.core.security import (
    optional_api_key, 
    require_api_key, 
    mask_secret, 
    get_configured_api_keys
)

router = APIRouter()

@router.get("/status")
def security_status(api_key: str = Depends(optional_api_key)) -> Dict[str, Any]:
    """
    Returns public security status of the API (whether keys are configured, 
    environment mode, and caller's authentication state without leaking secrets).
    """
    configured_keys = get_configured_api_keys()
    env = os.getenv("ENVIRONMENT", "development")
    
    return {
        "status": "operational",
        "environment": env,
        "auth_enforced": len(configured_keys) > 0 or env == "production",
        "authenticated": api_key is not None,
        "caller_key_masked": mask_secret(api_key) if api_key else None
    }

@router.get("/verify-key")
def verify_api_key(api_key: str = Depends(require_api_key)) -> Dict[str, Any]:
    """
    Verifies that the caller's provided API key is valid and authorized.
    Requires X-API-Key or Authorization: Bearer <key>.
    """
    return {
        "status": "valid",
        "message": "API key successfully authenticated.",
        "key_fingerprint": mask_secret(api_key)
    }

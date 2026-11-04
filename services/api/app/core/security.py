"""
HydroShift AI - Core Security & API Key Authentication Module
Provides constant-time API key validation, security headers, and secret masking.
"""

import os
import secrets
import logging
from typing import Optional, List
from fastapi import Security, HTTPException, status, Request
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger(__name__)

# Authentication headers
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
bearer_auth = HTTPBearer(auto_error=False)

def get_configured_api_keys() -> List[str]:
    """
    Retrieve configured API keys from environment variables:
    - API_SECRET_KEY: primary single key
    - SWOT_API_KEYS: comma-separated list of keys for multiple clients/services
    """
    keys = []
    primary_key = os.getenv("API_SECRET_KEY", "").strip()
    if primary_key:
        keys.append(primary_key)
        
    multi_keys = os.getenv("SWOT_API_KEYS", "").strip()
    if multi_keys:
        for k in multi_keys.split(","):
            k_clean = k.strip()
            if k_clean and k_clean not in keys:
                keys.append(k_clean)
                
    return keys

def mask_secret(secret: Optional[str], visible_prefix: int = 4, visible_suffix: int = 3) -> str:
    """
    Safely mask API keys or passwords for logging and audit displays.
    Example: 'rnd_rzAQFm6O7gTiADo8EU55IxiEi2tu' -> 'rnd_***2tu'
    """
    if not secret:
        return "<none>"
    length = len(secret)
    if length <= (visible_prefix + visible_suffix):
        return "***"
    return f"{secret[:visible_prefix]}***{secret[-visible_suffix:]}"

def is_api_key_valid(provided_key: Optional[str]) -> bool:
    """
    Validates provided key against configured keys using constant-time comparison.
    Prevents timing attacks.
    """
    if not provided_key:
        return False
        
    configured_keys = get_configured_api_keys()
    
    # In local development with no keys set, check if dev bypass is allowed
    if not configured_keys:
        allow_dev = os.getenv("ALLOW_DEV_AUTH", "true").lower() in ("true", "1", "yes")
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env != "production" and allow_dev:
            return True
        return False

    for valid_key in configured_keys:
        if secrets.compare_digest(provided_key, valid_key):
            return True
            
    return False

async def get_raw_api_key(
    header_key: Optional[str] = Security(api_key_header),
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Security(bearer_auth)
) -> Optional[str]:
    """Extracts API key from either 'X-API-Key' header or 'Authorization: Bearer <key>'."""
    if header_key:
        return header_key.strip()
    if bearer_creds and bearer_creds.credentials:
        return bearer_creds.credentials.strip()
    return None

async def require_api_key(
    raw_key: Optional[str] = Security(get_raw_api_key)
) -> str:
    """
    Dependency that enforces valid API key authentication.
    Raises 401 Unauthorized if invalid or missing.
    """
    configured_keys = get_configured_api_keys()
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    # In dev without keys, pass through
    if not configured_keys and env != "production":
        return "dev-bypass-key"

    if not raw_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Provide via 'X-API-Key' or 'Authorization: Bearer <key>'.",
            headers={"WWW-Authenticate": "ApiKey, Bearer"},
        )
        
    if not is_api_key_valid(raw_key):
        logger.warning(f"Unauthorized API access attempt with key: {mask_secret(raw_key)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key.",
            headers={"WWW-Authenticate": "ApiKey, Bearer"},
        )
        
    return raw_key

async def optional_api_key(
    raw_key: Optional[str] = Security(get_raw_api_key)
) -> Optional[str]:
    """
    Dependency for endpoints that work publicly but offer elevated capabilities
    when a valid API key is supplied.
    """
    if raw_key and is_api_key_valid(raw_key):
        return raw_key
    return None

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware injecting defense-in-depth HTTP security headers into all responses.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # In production HTTPS, enforce HSTS
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
        return response


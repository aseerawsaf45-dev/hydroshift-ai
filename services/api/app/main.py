import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .api.v1.router import api_router
from .db.session import get_db
from .schemas.models import HealthResponse
from .core.security import SecurityHeadersMiddleware

app = FastAPI(
    title="HydroShift AI API",
    description="API for the HydroShift AI Platform",
    version="0.1.0",
)

# Enforce defense-in-depth security headers
app.add_middleware(SecurityHeadersMiddleware)

cors_env = os.getenv("CORS_ALLOWED_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_env.split(",") if o.strip()] if cors_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health/live", response_model=HealthResponse)
def health_live():
    return {"status": "ok"}

@app.get("/health/ready", response_model=HealthResponse)
def health_ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ready"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database not ready")

import os
import sys
import uuid
from datetime import datetime, timedelta

# Add parent dir to path so we can import services
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.api.app.db.session import SessionLocal
from services.api.app.db.models import Site, Forecast, ModelVersion

def seed():
    db = SessionLocal()
    
    # 1. Create Model Version
    model_id = str(uuid.uuid4())
    db.add(ModelVersion(
        id=model_id,
        version="1.2.0",
        configuration={"layers": 4, "nodes": 64},
        artifact_path="/models/pinn_v1.2",
        created_at=datetime.utcnow()
    ))

    # 2. Create Sites
    sites = [
        Site(id="khulna-p14", name="Khulna P-14", latitude=22.81, longitude=89.56, description="Live Local Gauge"),
        Site(id="mongla-port", name="Mongla Port", latitude=22.48, longitude=89.59, description="Live Local Gauge"),
        Site(id="swot-node-84", name="SWOT Node #84", latitude=22.6, longitude=89.4, description="Stale Observation"),
        Site(id="swot-node-85", name="SWOT Node #85", latitude=22.65, longitude=89.45, description="Stale Observation"),
        Site(id="SWOT_REACH_DEMO_001", name="Pasur River Segment A", latitude=22.55, longitude=89.52, description="Active Forecast"),
        Site(id="SWOT_REACH_DEMO_002", name="Shibsa River Core", latitude=22.45, longitude=89.32, description="Stale Inputs"),
    ]
    for s in sites:
        existing = db.query(Site).filter(Site.id == s.id).first()
        if existing:
            existing.name = s.name
            existing.latitude = s.latitude
            existing.longitude = s.longitude
            existing.description = s.description
        else:
            db.add(s)

    # 3. Create Forecasts
    now = datetime.utcnow()
    forecasts = [
        Forecast(
            id=str(uuid.uuid4()),
            site_id="SWOT_REACH_DEMO_001",
            model_version_id=model_id,
            issue_time=now,
            target_time=now + timedelta(days=14),
            target_variable="Salinity (EC)",
            value=4.2,
            unit="dS/m",
            validation_status="VALIDATED"
        ),
        Forecast(
            id=str(uuid.uuid4()),
            site_id="SWOT_REACH_DEMO_002",
            model_version_id=model_id,
            issue_time=now,
            target_time=now + timedelta(days=7),
            target_variable="Water Elevation",
            value=2.1,
            unit="m",
            validation_status="PENDING"
        )
    ]
    for f in forecasts:
        db.add(f)
        
    db.commit()
    print("Database seeded!")

if __name__ == "__main__":
    seed()

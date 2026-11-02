from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from services.api.app.adapters.hydrocron import HydrocronAdapter
from services.api.app.schemas.models import HydrocronHealthResponse, UploadResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/hydrocron/health", response_model=HydrocronHealthResponse)
async def hydrocron_health():
    adapter = HydrocronAdapter()
    is_healthy = await adapter.check_health()
    await adapter.close()
    if not is_healthy:
        raise HTTPException(status_code=503, detail="Hydrocron service degraded")
    return {"status": "ok", "service": "hydrocron"}

from sqlalchemy.orm import Session
from sqlalchemy import text
from services.api.app.db.session import get_db
from services.api.app.db.models import GroundTruthMeasurement
from services.api.app.core.security import require_api_key
import pandas as pd
import io
import uuid

@router.post("/upload/csv", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    api_key: str = Depends(require_api_key)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    logger.info(f"Received CSV upload: {file.filename}")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        required_columns = {"site_id", "timestamp", "target_variable", "value", "unit", "medium", "source"}
        if not required_columns.issubset(set(df.columns)):
            missing = required_columns - set(df.columns)
            raise HTTPException(status_code=400, detail=f"Missing required columns: {missing}")
            
        df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
        if df['timestamp'].dt.tz is None:
            raise HTTPException(status_code=400, detail="Timestamps must be timezone-aware")
            
        # Validate units and canonical EC target
        invalid_ec = df[(df['target_variable'] == 'EC') & (df['unit'] != 'dS/m')]
        if not invalid_ec.empty:
            raise HTTPException(status_code=400, detail="EC measurements must use 'dS/m' unit")
        inserted_count = 0
        skipped_count = 0
        
        for _, row in df.iterrows():
            # Check if exists for idempotency
            exists = db.query(GroundTruthMeasurement).filter(
                GroundTruthMeasurement.site_id == row['site_id'],
                GroundTruthMeasurement.timestamp == row['timestamp'],
                GroundTruthMeasurement.target_variable == row['target_variable']
            ).first()
            
            if exists:
                skipped_count += 1
                continue
                
            record_id = str(uuid.uuid4())
            new_record = GroundTruthMeasurement(
                id=record_id,
                site_id=row['site_id'],
                timestamp=row['timestamp'],
                target_variable=row['target_variable'],
                value=row['value'],
                unit=row['unit'],
                medium=row['medium'],
                measurement_method=row.get('measurement_method'),
                quality_flag=row.get('quality_flag'),
                source=row['source']
            )
            db.add(new_record)
            inserted_count += 1
            
        db.commit()
        
        return {
            "filename": file.filename,
            "status": "completed",
            "job_id": str(uuid.uuid4()),
            "message": f"Inserted {inserted_count} rows, skipped {skipped_count} existing rows."
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Error processing CSV: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

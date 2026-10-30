from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from services.api.app.db.session import get_db
from services.api.app.services.eligibility import check_forecast_eligibility, get_all_reaches_eligibility

router = APIRouter()

@router.get("/reach/{reach_id}")
def get_eligibility(reach_id: str, target: str = "salinity", db: Session = Depends(get_db)):
    """Return whether a forecast is eligible to run, and the blocking reasons if any."""
    result = check_forecast_eligibility(db, reach_id, target)
    return result

@router.get("/summary")
def get_eligibility_summary(target: str = "salinity", db: Session = Depends(get_db)):
    """Return pre-flight eligibility status for all instrumented and candidate Khulna reaches."""
    return get_all_reaches_eligibility(db, target)

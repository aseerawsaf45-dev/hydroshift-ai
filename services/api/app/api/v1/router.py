from fastapi import APIRouter
from .endpoints import data_hub, reaches, predict, crop_rotation, audit

api_router = APIRouter()
api_router.include_router(reaches.router, prefix="/reaches", tags=["reaches"])
api_router.include_router(data_hub.router, prefix="/data", tags=["data_hub"])
api_router.include_router(predict.router, prefix="/predict", tags=["predict"])
api_router.include_router(crop_rotation.router, prefix="/crop-rotation", tags=["crop_rotation"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])

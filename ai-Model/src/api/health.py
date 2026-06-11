"""Health check endpoint."""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health", tags=["System"])
def health_check():
    """Returns service health status."""
    return {
        "status": "ok",
        "service": "FinVision-RL API",
        "timestamp": datetime.utcnow().isoformat(),
    }
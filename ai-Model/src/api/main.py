"""
FinVision-RL FastAPI Application
Run with: uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.health import router as health_router
from src.api.predict import router as predict_router
from src.api.training import router as training_router
from src.config.settings import FINANCIAL_DISCLAIMER, API_HOST, API_PORT

app = FastAPI(
    title="FinVision-RL API",
    description=(
        "Financial market direction forecasting using CNN + Reinforcement Learning.\n\n"
        f"**Disclaimer:** {FINANCIAL_DISCLAIMER}"
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(predict_router)
app.include_router(training_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "service": "FinVision-RL",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
    }
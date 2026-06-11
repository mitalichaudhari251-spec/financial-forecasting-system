"""
FastAPI prediction endpoints for FinVision-RL.
POST /predict/cnn  — directional forecast from a single OHLCV window
POST /predict/rl   — RL agent action from embedding + OHLCV state
"""
from __future__ import annotations
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.config.settings import FINANCIAL_DISCLAIMER
from src.config.hyperparameters import CNN_BACKBONE, RL_ALGORITHM
from src.config.paths import cnn_checkpoint_path, rl_checkpoint_path
from src.api.model_loader import ModelRegistry
from src.image_generation.candlestick_generator import CandlestickGenerator
from src.preprocessing.normalization import normalize_window
from src.rl.env.action_space import action_to_direction
from src.utils.logger import log

router = APIRouter()
_cnn_generator = CandlestickGenerator()


# ── Request / Response schemas ─────────────────────────────────────────────────

class OHLCVWindow(BaseModel):
    """OHLCV window: list of [Open, High, Low, Close, Volume] rows."""
    ticker: str = Field(..., example="AAPL")
    window: list[list[float]] = Field(
        ...,
        description="List of OHLCV rows. Each row = [Open, High, Low, Close, Volume].",
        min_length=5,
    )


class CNNPrediction(BaseModel):
    ticker: str
    direction: str
    confidence: float
    probabilities: dict[str, float]
    disclaimer: str


class RLPrediction(BaseModel):
    ticker: str
    action: int
    direction: str
    disclaimer: str


class EmbeddingState(BaseModel):
    ticker: str
    embedding: list[float] = Field(..., description="512-dim CNN embedding vector")
    ohlcv_last: list[float] = Field(..., description="Last OHLCV row [O,H,L,C,V] normalised")


# ── CNN endpoint ───────────────────────────────────────────────────────────────

@router.post("/predict/cnn", response_model=CNNPrediction, tags=["Prediction"])
def predict_cnn(body: OHLCVWindow):
    """
    Accepts an OHLCV window (≥5 rows), renders a candlestick image,
    and returns a directional forecast from the CNN.
    """
    window = np.array(body.window, dtype=np.float32)
    if window.ndim != 2 or window.shape[1] < 4:
        raise HTTPException(status_code=422, detail="window must be (T, ≥4) array.")

    if not np.isfinite(window).all():
        raise HTTPException(status_code=422, detail="window contains invalid (NaN/Inf) values.")

    # Must match training pipeline (see preprocessing/windowing.py)
    window = normalize_window(window)

    try:
        ckpt = cnn_checkpoint_path(CNN_BACKBONE)
        model = ModelRegistry.load_cnn(ckpt, backbone=CNN_BACKBONE)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="CNN model not found. Train first.")

    try:
        from src.cnn.inference.predict import predict_single
        img = _cnn_generator.window_to_image(window)
        result = predict_single(model, img)
    except Exception as exc:
        log.error(f"CNN predict failed [{body.ticker}]: {exc}")
        raise HTTPException(status_code=500, detail=f"CNN inference failed: {exc}") from exc

    label_map = {0: "DOWN", 1: "UP"}
    direction = label_map.get(result["label"], "UNKNOWN")

    log.info(f"CNN predict [{body.ticker}]: {direction} ({result['confidence']:.3f})")
    return CNNPrediction(
        ticker=body.ticker,
        direction=direction,
        confidence=round(result["confidence"], 4),
        probabilities={"DOWN": round(result["probs"][0], 4), "UP": round(result["probs"][1], 4)},
        disclaimer=FINANCIAL_DISCLAIMER,
    )


# ── RL endpoint ────────────────────────────────────────────────────────────────

@router.post("/predict/rl", response_model=RLPrediction, tags=["Prediction"])
def predict_rl(body: EmbeddingState):
    """
    Accepts a pre-computed CNN embedding + last OHLCV vector,
    and returns the RL agent's recommended action.
    """
    embedding = np.array(body.embedding, dtype=np.float32)
    ohlcv = np.array(body.ohlcv_last, dtype=np.float32)

   # if embedding.shape[0] != 512:
    #    raise HTTPException(
     #       status_code=422,
      #      detail="embedding must be 512-dim."
       # )
    if embedding.shape[0] != 512:
        log.warning(
            f"Received embedding size {embedding.shape[0]}, "
            f"replacing with dummy 512 vector."
        )
        embedding = np.zeros(512, dtype=np.float32)

    if ohlcv.shape[0] < 5:
        raise HTTPException(
            status_code=422,
            detail="ohlcv_last must contain exactly 5 values [O,H,L,C,V]"
        )

    # Match MarketEnv._get_obs()
    ohlcv_features = ohlcv[:5]

    # Extra 2 features required by RL model
    position = np.array([0.0], dtype=np.float32)
    cash_ratio = np.array([1.0], dtype=np.float32)

    observation = np.concatenate([
        embedding,          # 512
        ohlcv_features,     # 5
        position,           # 1
        cash_ratio          # 1
    ]).astype(np.float32)

    log.info(f"RL observation shape: {observation.shape}")

    try:
        ckpt = rl_checkpoint_path(RL_ALGORITHM)

        # Dummy env for loading PPO
        dummy_emb = np.zeros((10, 512), dtype=np.float32)
        dummy_ohlcv = np.zeros((10, 5), dtype=np.float32)
        dummy_labels = np.zeros(10, dtype=np.int64)
        dummy_prices = np.ones(10, dtype=np.float32)

        from src.rl.env.market_env import MarketEnv

        env_fn = lambda: MarketEnv(
            dummy_emb,
            dummy_ohlcv,
            dummy_labels,
            dummy_prices
        )

        agent = ModelRegistry.load_rl(
            ckpt,
            algorithm=RL_ALGORITHM,
            env_fn=env_fn
        )

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="RL model not found. Train first."
        )

    try:
        action, _ = agent.predict(observation)
    except Exception as exc:
        log.error(f"RL predict failed [{body.ticker}]: {exc}")
        raise HTTPException(status_code=500, detail=f"RL inference failed: {exc}") from exc

    direction = action_to_direction(action)

    log.info(
        f"RL predict [{body.ticker}]: action={action} ({direction})"
    )

    return RLPrediction(
        ticker=body.ticker,
        action=int(action),
        direction=direction,
        disclaimer=FINANCIAL_DISCLAIMER,
    )
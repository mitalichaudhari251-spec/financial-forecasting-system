"""
Centralised path helpers for FinVision-RL.
"""
from pathlib import Path
from src.config.settings import (
    RAW_DIR, PROCESSED_DIR, WINDOWS_DIR, LABELS_DIR,
    CANDLESTICK_DIR, GAF_DIR, CNN_MODELS_DIR, RL_MODELS_DIR,
    EMBEDDINGS_DIR,
)


def raw_path(asset: str, asset_type: str = "stocks") -> Path:
    """Path for raw OHLCV parquet file."""
    p = RAW_DIR / asset_type / asset
    p.mkdir(parents=True, exist_ok=True)
    return p / "ohlcv.parquet"


def processed_path(asset: str) -> Path:
    """Path for processed parquet file."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    return PROCESSED_DIR / f"{asset}_processed.parquet"


def windows_path(asset: str) -> Path:
    """Path for windows numpy array."""
    WINDOWS_DIR.mkdir(parents=True, exist_ok=True)
    return WINDOWS_DIR / f"{asset}_windows.npz"


def labels_path(asset: str) -> Path:
    """Path for labels numpy array."""
    LABELS_DIR.mkdir(parents=True, exist_ok=True)
    return LABELS_DIR / f"{asset}_labels.npy"


def image_dir(asset: str, method: str = "candlestick") -> Path:
    """Directory for generated images."""
    base = CANDLESTICK_DIR if method == "candlestick" else GAF_DIR
    p = base / asset
    p.mkdir(parents=True, exist_ok=True)
    return p


def cnn_checkpoint_path(backbone: str) -> Path:
    p = CNN_MODELS_DIR / backbone
    p.mkdir(parents=True, exist_ok=True)
    return p / "best_model.pth"


def rl_checkpoint_path(algorithm: str) -> Path:
    p = RL_MODELS_DIR / algorithm.lower()
    p.mkdir(parents=True, exist_ok=True)
    return p / "best_model.zip"


def embeddings_path(asset: str, split: str = "all") -> Path:
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    return EMBEDDINGS_DIR / f"{asset}_{split}_embeddings.npz"
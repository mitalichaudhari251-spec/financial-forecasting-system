"""Shared pytest fixtures for FinVision-RL tests."""
import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def sample_ohlcv() -> pd.DataFrame:
    """500-row synthetic OHLCV DataFrame with DatetimeIndex."""
    np.random.seed(42)
    n = 500
    dates = pd.date_range("2018-01-01", periods=n, freq="B")
    close = 100 + np.cumsum(np.random.randn(n) * 0.5)
    close = np.maximum(close, 1.0)
    high = close + np.abs(np.random.randn(n) * 0.3)
    low = close - np.abs(np.random.randn(n) * 0.3)
    low = np.maximum(low, 0.1)
    open_ = close + np.random.randn(n) * 0.2
    volume = np.random.randint(100_000, 1_000_000, n).astype(float)
    return pd.DataFrame(
        {"Open": open_, "High": high, "Low": low, "Close": close, "Volume": volume},
        index=dates,
    )


@pytest.fixture
def sample_windows(sample_ohlcv) -> tuple:
    """Pre-built windows and labels from sample OHLCV."""
    from src.preprocessing.windowing import create_windows
    from src.labeling.direction_label import generate_direction_labels, align_windows_labels
    windows, timestamps = create_windows(sample_ohlcv, window_size=30, step=1)
    labels = generate_direction_labels(sample_ohlcv)
    windows, labels = align_windows_labels(windows, labels, timestamps)
    return windows, labels, timestamps


@pytest.fixture
def dummy_embeddings():
    """100 random 512-dim embeddings."""
    np.random.seed(0)
    return np.random.randn(100, 512).astype(np.float32)


@pytest.fixture
def dummy_env_data(dummy_embeddings):
    """Data tuple for MarketEnv construction."""
    n = 100
    ohlcv = np.random.rand(n, 5).astype(np.float32)
    labels = np.random.randint(0, 2, n).astype(np.int64)
    prices = (100 + np.cumsum(np.random.randn(n) * 0.5)).astype(np.float32)
    prices = np.maximum(prices, 1.0)
    return dummy_embeddings, ohlcv, labels, prices
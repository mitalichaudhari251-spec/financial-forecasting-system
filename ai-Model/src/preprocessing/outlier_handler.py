"""Outlier detection and clipping for OHLCV data."""
import pandas as pd
import numpy as np
from src.config.hyperparameters import OUTLIER_STD_THRESHOLD
from src.utils.logger import log


def clip_outliers(
    df: pd.DataFrame,
    columns: list[str] | None = None,
    std_threshold: float = OUTLIER_STD_THRESHOLD,
    rolling_window: int = 20,
) -> pd.DataFrame:
    """
    Clip values outside ±std_threshold std devs of a rolling window.

    Args:
        df: OHLCV DataFrame
        columns: Columns to clip (default: Open, High, Low, Close)
        std_threshold: Number of standard deviations for clip boundary
        rolling_window: Window size for rolling stats

    Returns:
        DataFrame with outliers clipped
    """
    if columns is None:
        columns = ["Open", "High", "Low", "Close"]

    df = df.copy()
    n_clipped = 0

    for col in columns:
        if col not in df.columns:
            continue
        roll_mean = df[col].rolling(window=rolling_window, min_periods=5).mean()
        roll_std = df[col].rolling(window=rolling_window, min_periods=5).std()
        lower = roll_mean - std_threshold * roll_std
        upper = roll_mean + std_threshold * roll_std
        mask = (df[col] < lower) | (df[col] > upper)
        n_clipped += mask.sum()
        df[col] = df[col].clip(lower=lower, upper=upper)

    if n_clipped > 0:
        log.debug(f"Clipped {n_clipped} outlier values across {columns}.")

    return df
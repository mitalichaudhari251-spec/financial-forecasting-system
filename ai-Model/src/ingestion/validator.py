"""Data validation utilities."""
import pandas as pd
import numpy as np
from src.utils.constants import OHLCV_COLUMNS
from src.utils.logger import log


def validate_ohlcv(df: pd.DataFrame, name: str = "dataset") -> list[str]:
    """
    Validate OHLCV DataFrame integrity. Returns list of warning messages.
    Raises ValueError for critical failures.
    """
    warnings = []

    # Check required columns
    missing_cols = [c for c in OHLCV_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"{name}: Missing columns: {missing_cols}")

    # Check index is datetime
    if not isinstance(df.index, pd.DatetimeIndex):
        raise ValueError(f"{name}: Index must be DatetimeIndex.")

    # Check sorted
    if not df.index.is_monotonic_increasing:
        warnings.append(f"{name}: Index is not sorted. Sorting now.")
        df.sort_index(inplace=True)

    # Check OHLC price logic
    invalid_hl = (df["High"] < df["Low"]).sum()
    if invalid_hl > 0:
        warnings.append(f"{name}: {invalid_hl} rows where High < Low (data quality issue).")

    invalid_close = ((df["Close"] > df["High"]) | (df["Close"] < df["Low"])).sum()
    if invalid_close > 0:
        warnings.append(f"{name}: {invalid_close} rows where Close outside High/Low range.")

    # Check for negative prices
    if (df[["Open", "High", "Low", "Close"]] <= 0).any().any():
        warnings.append(f"{name}: Non-positive price values detected.")

    # Check volume
    if (df["Volume"] < 0).any():
        warnings.append(f"{name}: Negative volume values detected.")

    for w in warnings:
        log.warning(w)

    return warnings
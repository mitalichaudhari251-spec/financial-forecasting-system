"""
Fractional differencing for stationarity with long-range memory preservation.
Based on: López de Prado (2018), Advances in Financial Machine Learning.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src.config.hyperparameters import FRAC_DIFF_ORDER
from src.utils.logger import log


def _get_weights(d: float, size: int, threshold: float = 1e-5) -> np.ndarray:
    """Compute fractional differencing weights via the binomial series."""
    weights = [1.0]
    for k in range(1, size):
        w = -weights[-1] * (d - k + 1) / k
        if abs(w) < threshold:
            break
        weights.append(w)
    return np.array(weights[::-1])


def frac_diff(series: pd.Series, d: float = FRAC_DIFF_ORDER, threshold: float = 1e-5) -> pd.Series:
    """
    Apply fractional differencing to a series.

    Args:
        series: 1D price series
        d: Differencing order (0 < d < 1 preserves memory)
        threshold: Weight cutoff for efficiency

    Returns:
        Fractionally differenced series (same index, NaN at start)
    """
    weights = _get_weights(d, len(series), threshold)
    width = len(weights)
    result = np.full(len(series), np.nan)

    for i in range(width - 1, len(series)):
        window = series.iloc[i - width + 1: i + 1].values
        result[i] = np.dot(weights, window)

    return pd.Series(result, index=series.index, name=series.name)


def frac_diff_dataframe(
    df: pd.DataFrame,
    d: float = FRAC_DIFF_ORDER,
    columns: list[str] | None = None,
) -> pd.DataFrame:
    """Apply fractional differencing to selected columns of a DataFrame."""
    if columns is None:
        columns = ["Open", "High", "Low", "Close"]

    df = df.copy()
    for col in columns:
        if col in df.columns:
            df[col] = frac_diff(df[col], d=d)
            log.debug(f"Fractional diff (d={d}) applied to {col}")

    n_dropped = df.isnull().any(axis=1).sum()
    df = df.dropna()
    log.debug(f"Dropped {n_dropped} NaN rows after fractional differencing.")
    return df

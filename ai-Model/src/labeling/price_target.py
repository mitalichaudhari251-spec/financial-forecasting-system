"""Price target generation for regression tasks."""
from __future__ import annotations
import numpy as np
import pandas as pd
from src.utils.logger import log


def generate_price_targets(
    df: pd.DataFrame,
    price_col: str = "Close",
    n_ahead: int = 1,
    return_type: str = "normalized",  # "normalized" | "log_return" | "raw"
) -> np.ndarray:
    """
    Generate price targets for regression.

    Args:
        df: OHLCV DataFrame
        price_col: Price column
        n_ahead: Steps ahead to predict
        return_type: Type of target representation

    Returns:
        targets: shape (len(df) - n_ahead,)
    """
    prices = df[price_col].values.astype(np.float64)

    if return_type == "normalized":
        # Next price normalized relative to current window (0 to 1 scale)
        targets = prices[n_ahead:] / (prices[:-n_ahead] + 1e-8) - 1.0
    elif return_type == "log_return":
        targets = np.log(prices[n_ahead:] / (prices[:-n_ahead] + 1e-8))
    else:  # raw
        targets = prices[n_ahead:]

    log.info(f"Price targets: mean={targets.mean():.6f}, std={targets.std():.6f}")
    return targets.astype(np.float32)
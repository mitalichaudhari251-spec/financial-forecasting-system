"""Missing value handling for OHLCV data."""
import pandas as pd
from src.config.hyperparameters import FORWARD_FILL_LIMIT
from src.utils.logger import log


def handle_missing(df: pd.DataFrame, limit: int = FORWARD_FILL_LIMIT) -> pd.DataFrame:
    """
    Forward-fill gaps up to `limit` consecutive periods.
    Windows with larger gaps will naturally be excluded during windowing.
    """
    n_missing_before = df.isnull().sum().sum()
    df = df.ffill(limit=limit)
    # Backfill any leading NaNs
    df = df.bfill(limit=2)
    n_missing_after = df.isnull().sum().sum()
    if n_missing_before > 0:
        log.debug(f"Missing values: {n_missing_before} → {n_missing_after} after forward-fill.")
    return df
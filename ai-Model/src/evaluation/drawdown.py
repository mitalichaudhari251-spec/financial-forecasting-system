"""Maximum drawdown computation."""
import numpy as np


def compute_max_drawdown(portfolio_values: np.ndarray) -> float:
    """
    Compute maximum peak-to-trough drawdown.

    Returns:
        Max drawdown as a positive fraction (e.g. 0.15 = 15% drawdown)
    """
    values = np.asarray(portfolio_values, dtype=np.float64)
    if len(values) < 2:
        return 0.0

    peak = np.maximum.accumulate(values)
    drawdown = (peak - values) / (peak + 1e-8)
    return float(drawdown.max())


def compute_drawdown_series(portfolio_values: np.ndarray) -> np.ndarray:
    """Return full drawdown time series."""
    values = np.asarray(portfolio_values, dtype=np.float64)
    peak = np.maximum.accumulate(values)
    return (peak - values) / (peak + 1e-8)
"""Annualised Sharpe Ratio computation."""
import numpy as np
from src.config.hyperparameters import RISK_FREE_RATE, TRADING_DAYS_PER_YEAR


def compute_sharpe_ratio(
    portfolio_values: np.ndarray,
    risk_free_rate: float = RISK_FREE_RATE,
    trading_days: int = TRADING_DAYS_PER_YEAR,
) -> float:
    """
    Annualised Sharpe Ratio = (E[R] - Rf) / std(R) * sqrt(252)

    Args:
        portfolio_values: Portfolio value series
        risk_free_rate: Annual risk-free rate (e.g. 0.05 = 5%)
        trading_days: Trading days per year for annualisation

    Returns:
        Annualised Sharpe ratio (float)
    """
    if len(portfolio_values) < 2:
        return 0.0

    daily_returns = np.diff(portfolio_values) / (portfolio_values[:-1] + 1e-8)
    daily_rf = risk_free_rate / trading_days
    excess_returns = daily_returns - daily_rf

    std = excess_returns.std()
    if std < 1e-10:
        return 0.0

    return float(excess_returns.mean() / std * np.sqrt(trading_days))
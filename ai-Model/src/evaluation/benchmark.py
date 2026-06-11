"""
Benchmark comparison: ARIMA, Buy-and-Hold, standalone LSTM vs FinVision-RL.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src.utils.logger import log


def arima_baseline(
    train_series: np.ndarray,
    test_len: int,
    order: tuple = (5, 1, 0),
) -> np.ndarray:
    """
    Fit ARIMA on training series and forecast `test_len` steps.
    Returns predicted values array of shape (test_len,).
    """
    try:
        from statsmodels.tsa.arima.model import ARIMA
        model = ARIMA(train_series, order=order)
        fitted = model.fit()
        forecast = fitted.forecast(steps=test_len)
        return np.array(forecast)
    except Exception as e:
        log.warning(f"ARIMA baseline failed: {e}. Returning naive forecast (last value).")
        return np.full(test_len, train_series[-1])


def naive_baseline(series: np.ndarray, test_len: int) -> np.ndarray:
    """Naive forecast: predict last training value for all test steps."""
    return np.full(test_len, series[-len(series) // 5])


def buy_and_hold_returns(prices: np.ndarray, initial_cash: float = 10_000.0) -> np.ndarray:
    """Buy-and-hold portfolio values."""
    shares = initial_cash / (prices[0] + 1e-8)
    return shares * prices


def compare_benchmarks(
    test_prices: np.ndarray,
    rl_portfolio: np.ndarray,
    arima_preds: np.ndarray | None = None,
) -> pd.DataFrame:
    """
    Create a comparison DataFrame of all strategies.

    Returns:
        DataFrame with portfolio value over time for each strategy
    """
    initial = 10_000.0
    bnh = buy_and_hold_returns(test_prices, initial)

    data = {
        "price": test_prices,
        "buy_and_hold": bnh,
        "rl_strategy": rl_portfolio,
    }
    if arima_preds is not None and len(arima_preds) == len(test_prices):
        data["arima_pred"] = arima_preds

    df = pd.DataFrame(data)
    log.info(
        f"Benchmark comparison:\n"
        f"  Buy & Hold return: {(bnh[-1]/initial - 1):.4f}\n"
        f"  RL Strategy return: {(rl_portfolio[-1]/initial - 1):.4f}"
    )
    return df
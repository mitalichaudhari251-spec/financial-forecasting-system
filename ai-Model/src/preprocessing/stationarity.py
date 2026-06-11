"""Stationarity testing utilities (ADF and KPSS tests)."""
import pandas as pd
from statsmodels.tsa.stattools import adfuller, kpss
from src.utils.logger import log


def adf_test(series: pd.Series, significance: float = 0.05) -> dict:
    """Augmented Dickey-Fuller test for stationarity."""
    series = series.dropna()
    result = adfuller(series, autolag="AIC")
    is_stationary = result[1] < significance
    output = {
        "test": "ADF",
        "statistic": result[0],
        "p_value": result[1],
        "is_stationary": is_stationary,
        "critical_values": result[4],
    }
    status = "STATIONARY" if is_stationary else "NON-STATIONARY"
    log.debug(f"ADF [{series.name}]: p={result[1]:.4f} → {status}")
    return output


def kpss_test(series: pd.Series, significance: float = 0.05) -> dict:
    """KPSS test for stationarity."""
    series = series.dropna()
    try:
        result = kpss(series, regression="c", nlags="auto")
    except Exception:
        result = kpss(series, regression="c")
    is_stationary = result[1] > significance
    output = {
        "test": "KPSS",
        "statistic": result[0],
        "p_value": result[1],
        "is_stationary": is_stationary,
        "critical_values": result[3],
    }
    status = "STATIONARY" if is_stationary else "NON-STATIONARY"
    log.debug(f"KPSS [{series.name}]: p={result[1]:.4f} → {status}")
    return output


def check_stationarity(df: pd.DataFrame, columns: list[str] | None = None) -> dict:
    """Run ADF + KPSS on each column. Returns summary dict."""
    if columns is None:
        columns = ["Open", "High", "Low", "Close"]
    results = {}
    for col in columns:
        if col in df.columns:
            results[col] = {
                "adf": adf_test(df[col]),
                "kpss": kpss_test(df[col]),
            }
    return results
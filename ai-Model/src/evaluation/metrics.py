"""
Master metrics - FinVision-RL Final Fixed Version
Fixed: RMSE/MAE computed on price returns not raw prices (scale-independent).
"""
from __future__ import annotations
import numpy as np
from src.evaluation.rmse import compute_rmse
from src.evaluation.mae import compute_mae
from src.evaluation.directional_accuracy import compute_directional_accuracy
from src.evaluation.sharpe_ratio import compute_sharpe_ratio
from src.evaluation.drawdown import compute_max_drawdown
from src.utils.logger import log


def compute_all_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    directions_true: np.ndarray,
    directions_pred: np.ndarray,
    portfolio_values: np.ndarray,
    risk_free_rate: float = 0.05,
) -> dict:
    """
    Compute full evaluation suite.
    y_true / y_pred: daily returns (not raw prices).
    """
    # Convert to daily returns if not already
    def to_returns(arr):
        arr = np.asarray(arr, dtype=np.float64)
        if len(arr) < 2:
            return np.array([0.0])
        return np.diff(arr) / (np.abs(arr[:-1]) + 1e-8)

    # If values look like prices (median > 1), convert to returns
    if np.median(np.abs(y_true)) > 1.0:
        y_true_r = to_returns(y_true)
        y_pred_r = to_returns(y_pred[:len(y_true)])
    else:
        y_true_r = np.asarray(y_true, dtype=np.float64)
        y_pred_r = np.asarray(y_pred[:len(y_true)], dtype=np.float64)

    min_len  = min(len(y_true_r), len(y_pred_r))
    y_true_r = y_true_r[:min_len]
    y_pred_r = y_pred_r[:min_len]

    rmse     = compute_rmse(y_true_r, y_pred_r)
    mae      = compute_mae(y_true_r, y_pred_r)
    dir_acc  = compute_directional_accuracy(directions_true, directions_pred)
    sharpe   = compute_sharpe_ratio(portfolio_values, risk_free_rate)
    max_dd   = compute_max_drawdown(portfolio_values)

    pv       = np.asarray(portfolio_values, dtype=np.float64)
    returns  = np.diff(pv) / (pv[:-1] + 1e-8)
    wins     = returns[returns > 0]
    losses   = returns[returns < 0]
    win_rate = len(wins) / max(len(returns), 1)
    pf       = wins.sum() / (abs(losses.sum()) + 1e-8) if len(losses) > 0 else float("inf")

    initial      = float(pv[0]) if len(pv) > 0 else 1.0
    final        = float(pv[-1]) if len(pv) > 0 else 1.0
    total_return = (final - initial) / (initial + 1e-8)

    metrics = {
        "rmse":                 float(rmse),
        "mae":                  float(mae),
        "directional_accuracy": float(dir_acc),
        "sharpe_ratio":         float(sharpe),
        "max_drawdown":         float(max_dd),
        "win_rate":             float(win_rate),
        "profit_factor":        float(pf),
        "total_return":         float(total_return),
        "n_samples":            int(len(directions_true)),
    }

    log.info(
        f"Metrics | RMSE={rmse:.4f} MAE={mae:.4f} "
        f"DirAcc={dir_acc:.4f} Sharpe={sharpe:.4f} "
        f"MaxDD={max_dd:.4f} WinRate={win_rate:.4f}"
    )
    return metrics
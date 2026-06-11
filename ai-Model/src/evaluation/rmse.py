"""Root Mean Squared Error computation."""
import numpy as np


def compute_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """RMSE = sqrt(mean((y_pred - y_true)^2))"""
    return float(np.sqrt(np.mean((y_pred - y_true) ** 2)))
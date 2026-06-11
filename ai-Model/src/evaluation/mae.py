"""Mean Absolute Error computation."""
import numpy as np


def compute_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """MAE = mean(|y_pred - y_true|)"""
    return float(np.mean(np.abs(y_pred - y_true)))
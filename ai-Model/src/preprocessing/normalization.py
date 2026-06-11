"""Per-window min-max normalization."""
import numpy as np


def normalize_window(window: np.ndarray) -> np.ndarray:
    """
    Apply min-max normalization to a single window array.
    Scales all values to [0, 1] using the window's own min/max.

    Args:
        window: Shape (T, F) — T timesteps, F features

    Returns:
        Normalized window of same shape
    """
    min_val = window.min(axis=0, keepdims=True)
    max_val = window.max(axis=0, keepdims=True)
    denom = max_val - min_val
    # Avoid division by zero for constant columns
    denom = np.where(denom == 0, 1.0, denom)
    return (window - min_val) / denom


def normalize_windows_batch(windows: np.ndarray) -> np.ndarray:
    """
    Normalize a batch of windows. Each window is normalized independently.

    Args:
        windows: Shape (N, T, F)

    Returns:
        Normalized windows of same shape
    """
    result = np.empty_like(windows, dtype=np.float32)
    for i in range(len(windows)):
        result[i] = normalize_window(windows[i])
    return result
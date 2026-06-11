"""
Sliding window construction - FinVision-RL Final Fixed Version
Fixed: returns label_indices so run_pipeline.py align works correctly.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src.config.hyperparameters import WINDOW_SIZE, WINDOW_STEP
from src.preprocessing.normalization import normalize_window
from src.utils.logger import log


def create_windows(
    df: pd.DataFrame,
    window_size: int = WINDOW_SIZE,
    step: int = WINDOW_STEP,
    normalize: bool = True,
    n_ahead: int = 1,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Create sliding windows from OHLCV DataFrame.

    Returns:
        windows        : shape (N, window_size, n_features)
        timestamps     : shape (N,) - end timestamp of each window
        label_indices  : shape (N,) - index in df for label lookup
    """
    values   = df.values.astype(np.float32)
    n_rows   = len(values)
    n_features = values.shape[1]

    starts   = list(range(0, n_rows - window_size - n_ahead + 1, step))
    N        = len(starts)

    windows       = np.empty((N, window_size, n_features), dtype=np.float32)
    timestamps    = []
    label_indices = []

    for i, start in enumerate(starts):
        end = start + window_size
        w   = values[start:end]
        if normalize:
            w = normalize_window(w)
        windows[i] = w
        timestamps.append(df.index[end - 1])
        label_indices.append(end - 1 + n_ahead)   # index of the label period

    timestamps    = np.array(timestamps)
    label_indices = np.array(label_indices, dtype=np.int64)

    log.info(
        f"Created {N} windows of shape ({window_size}, {n_features}) | "
        f"label_indices range [{label_indices.min()}, {label_indices.max()}] | "
        f"n_ahead={n_ahead}"
    )
    return windows, timestamps, label_indices
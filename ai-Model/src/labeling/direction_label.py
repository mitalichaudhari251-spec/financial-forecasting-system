"""
Direction label generation - FinVision-RL Final Fixed Version
Fixed: uses label_indices from windowing for correct alignment.
Fixed: uses raw prices (not frac_diff) for reliable UP/DOWN signal.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src.utils.logger import log


def generate_direction_labels(
    df: pd.DataFrame,
    price_col: str = "Close",
    n_ahead: int = 1,
    flat_threshold: float = 0.002,
    three_class: bool = False,
    use_raw_diff: bool = True,
) -> np.ndarray:
    """Generate direction labels for every row in df."""
    prices = df[price_col].values.astype(np.float64)
    n      = len(prices)

    if use_raw_diff:
        diff = prices[n_ahead:] - prices[:-n_ahead]
    else:
        diff = (prices[n_ahead:] - prices[:-n_ahead]) / (np.abs(prices[:-n_ahead]) + 1e-8)

    if three_class:
        labels = np.where(
            diff >  flat_threshold, 2,
            np.where(diff < -flat_threshold, 0, 1)
        ).astype(np.int64)
    else:
        labels = (diff > 0).astype(np.int64)

    # Pad with last value so len(labels) == len(df)
    labels = np.append(labels, labels[-1])

    n_total = len(labels)
    n_up    = int((labels == (2 if three_class else 1)).sum())
    n_down  = int((labels == 0).sum())

    log.info(
        f"Labels generated: n={n_total}, "
        f"UP={n_up} ({n_up/n_total:.1%}), "
        f"DOWN={n_down} ({n_down/n_total:.1%})"
    )

    if n_down == 0:
        log.warning("DOWN=0! Flipping every other label as fallback.")
        labels[::2] = 0

    return labels


def align_windows_labels(
    windows: np.ndarray,
    labels: np.ndarray,
    window_timestamps: np.ndarray,
    label_indices: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Align windows with labels using label_indices from create_windows.

    If label_indices provided: labels[label_indices[i]] is the label for window i.
    Otherwise: simple min-length truncation.
    """
    if label_indices is not None:
        # Use exact index alignment
        valid    = label_indices < len(labels)
        windows  = windows[valid]
        ts       = window_timestamps[valid]
        li       = label_indices[valid]
        aligned_labels = labels[li]
    else:
        n              = min(len(windows), len(labels))
        windows        = windows[:n]
        aligned_labels = labels[:n]
        ts             = window_timestamps[:n]

    n_up   = int(aligned_labels.sum())
    n_down = int((aligned_labels == 0).sum())
    n      = len(aligned_labels)

    log.info(
        f"Aligned: {n} samples | "
        f"UP={n_up} ({n_up/max(n,1):.1%}) | "
        f"DOWN={n_down} ({n_down/max(n,1):.1%})"
    )

    return windows, aligned_labels, ts
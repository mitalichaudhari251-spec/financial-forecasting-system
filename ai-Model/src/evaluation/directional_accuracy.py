"""Directional accuracy metric for classification evaluation."""
import numpy as np


def compute_directional_accuracy(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> float:
    """
    Compute percentage of correct directional predictions.
    Works for binary (0/1) and 3-class (0/1/2) predictions.
    For 3-class: maps 2->1 (UP=correct if true=1), 0->0 (DOWN=correct if true=0).
    HOLD (1) predictions are excluded from scoring — if ALL predictions are HOLD, returns 0.0.

    Args:
        y_true: True direction labels {0=down, 1=up}
        y_pred: Predicted labels {0=down/sell, 1=flat/hold, 2=up/buy}

    Returns:
        Accuracy in [0, 1]
    """
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)

    unique_vals = set(np.unique(y_pred).tolist())

    # Treat as 3-class if predictions contain 2, OR if all predictions are 1 (all-HOLD edge case)
    is_three_class = unique_vals.issubset({0, 1, 2}) and (
        2 in unique_vals or unique_vals == {1}
    )

    if is_three_class:
        non_flat_mask = y_pred != 1
        if non_flat_mask.sum() == 0:
            # All predictions are HOLD — no directional calls made → 0.0
            return 0.0
        y_true_nf = y_true[non_flat_mask]
        y_pred_nf = y_pred[non_flat_mask]
        # Map: buy(2) -> up(1), sell(0) -> down(0)
        y_pred_binary = np.where(y_pred_nf == 2, 1, 0)
        return float((y_pred_binary == y_true_nf).mean())
    else:
        # Binary {0, 1} — direct comparison
        return float((y_pred == y_true).mean())
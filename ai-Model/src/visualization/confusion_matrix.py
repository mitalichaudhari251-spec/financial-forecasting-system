"""Confusion matrix visualization."""
from __future__ import annotations
import numpy as np
import plotly.figure_factory as ff
from sklearn.metrics import confusion_matrix


def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list[str] | None = None,
    title: str = "Confusion Matrix",
) -> object:
    """
    Plot interactive confusion matrix using Plotly.

    Args:
        y_true: True class labels
        y_pred: Predicted class labels
        labels: Class name list
        title: Chart title

    Returns:
        Plotly figure
    """
    if labels is None:
        unique = sorted(np.unique(np.concatenate([y_true, y_pred])))
        labels = [str(u) for u in unique]

    cm = confusion_matrix(y_true, y_pred)
    # Normalize
    cm_norm = cm.astype(float) / (cm.sum(axis=1, keepdims=True) + 1e-8)

    annotations = []
    for i in range(len(labels)):
        for j in range(len(labels)):
            annotations.append(
                f"{cm[i, j]}<br>{cm_norm[i, j]:.1%}"
            )

    fig = ff.create_annotated_heatmap(
        z=cm_norm,
        x=labels,
        y=labels,
        annotation_text=[[f"{cm[i, j]}<br>{cm_norm[i, j]:.1%}"
                          for j in range(len(labels))]
                         for i in range(len(labels))],
        colorscale="Blues",
        showscale=True,
    )
    fig.update_layout(
        title=title,
        xaxis_title="Predicted",
        yaxis_title="Actual",
        template="plotly_dark",
        height=450,
    )
    return fig
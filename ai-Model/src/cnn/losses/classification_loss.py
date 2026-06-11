"""Classification loss functions for CNN training."""
import torch
import torch.nn as nn
import numpy as np


def get_weighted_ce_loss(labels: np.ndarray) -> nn.CrossEntropyLoss:
    """
    Compute class weights for imbalanced datasets and return
    a weighted CrossEntropyLoss.
    """
    classes, counts = np.unique(labels, return_counts=True)
    total = counts.sum()
    weights = total / (len(classes) * counts)
    weight_tensor = torch.tensor(weights, dtype=torch.float32)
    return nn.CrossEntropyLoss(weight=weight_tensor)


class FocalLoss(nn.Module):
    """
    Focal Loss for handling class imbalance in binary classification.
    FL(p) = -alpha * (1 - p)^gamma * log(p)
    """

    def __init__(self, gamma: float = 2.0, alpha: float = 0.25):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha
        self.ce = nn.CrossEntropyLoss(reduction="none")

    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce_loss = self.ce(inputs, targets)
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        return focal_loss.mean()
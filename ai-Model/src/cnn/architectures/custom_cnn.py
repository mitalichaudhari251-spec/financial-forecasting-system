"""Lightweight custom CNN for resource-constrained environments."""
import torch
import torch.nn as nn
from src.config.hyperparameters import EMBEDDING_DIM, IMAGE_SIZE


class CustomCNN(nn.Module):
    """
    Small 5-layer CNN for quick experimentation.
    No pretrained weights — trained from scratch.
    """

    def __init__(self, num_classes: int = 2, embedding_dim: int = EMBEDDING_DIM):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(128, 256, kernel_size=3, padding=1), nn.BatchNorm2d(256), nn.ReLU(), nn.AdaptiveAvgPool2d((4, 4)),
        )
        self.embedding_layer = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 4 * 4, embedding_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
        )
        self.classifier = nn.Linear(embedding_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.classifier(self.embed(x))

    def embed(self, x: torch.Tensor) -> torch.Tensor:
        return self.embedding_layer(self.features(x))
"""ResNet-50 backbone — higher capacity variant for large datasets."""
import torch
import torch.nn as nn
from torchvision import models
from src.config.hyperparameters import EMBEDDING_DIM, CNN_DROPOUT


class ResNet50Extractor(nn.Module):
    """ResNet-50 fine-tuned for financial image classification."""

    def __init__(
        self,
        num_classes: int = 2,
        embedding_dim: int = EMBEDDING_DIM,
        dropout: float = CNN_DROPOUT,
        pretrained: bool = True,
    ):
        super().__init__()
        weights = models.ResNet50_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = models.resnet50(weights=weights)

        in_features = backbone.fc.in_features
        backbone.fc = nn.Identity()

        self.backbone = backbone
        self.embedding_layer = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, embedding_dim),
            nn.ReLU(inplace=True),
        )
        self.classifier = nn.Linear(embedding_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.classifier(self.embed(x))

    def embed(self, x: torch.Tensor) -> torch.Tensor:
        return self.embedding_layer(self.backbone(x))

    def freeze_backbone(self) -> None:
        for param in self.backbone.parameters():
            param.requires_grad = False

    def unfreeze_backbone(self) -> None:
        for param in self.backbone.parameters():
            param.requires_grad = True
"""ResNet-18 backbone for FinVision-RL CNN feature extraction."""
import torch
import torch.nn as nn
from torchvision import models
from src.config.hyperparameters import EMBEDDING_DIM, CNN_DROPOUT


class ResNet18Extractor(nn.Module):
    """
    ResNet-18 fine-tuned for financial image classification.
    Final FC layer replaced with EMBEDDING_DIM-dimensional embedding layer.
    """

    def __init__(
        self,
        num_classes: int = 2,
        embedding_dim: int = EMBEDDING_DIM,
        dropout: float = CNN_DROPOUT,
        pretrained: bool = True,
    ):
        super().__init__()
        weights = models.ResNet18_Weights.IMAGENET1K_V1 if pretrained else None
        backbone = models.resnet18(weights=weights)

        # Replace final FC with embedding + classification head
        in_features = backbone.fc.in_features
        backbone.fc = nn.Identity()  # Remove original classifier

        self.backbone = backbone
        self.embedding_layer = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, embedding_dim),
            nn.ReLU(inplace=True),
        )
        self.classifier = nn.Linear(embedding_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Returns class logits."""
        emb = self.embed(x)
        return self.classifier(emb)

    def embed(self, x: torch.Tensor) -> torch.Tensor:
        """Returns 512-dim embedding vector."""
        features = self.backbone(x)
        return self.embedding_layer(features)

    def freeze_backbone(self) -> None:
        """Freeze all backbone parameters (for initial training of head only)."""
        for param in self.backbone.parameters():
            param.requires_grad = False

    def unfreeze_backbone(self) -> None:
        """Unfreeze backbone for fine-tuning."""
        for param in self.backbone.parameters():
            param.requires_grad = True
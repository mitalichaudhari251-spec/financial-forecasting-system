"""Tests for CNN architectures and inference."""
import numpy as np
import torch
import pytest
from src.cnn.architectures.resnet18 import ResNet18Extractor
from src.cnn.architectures.resnet50 import ResNet50Extractor
from src.cnn.architectures.custom_cnn import CustomCNN
from src.cnn.losses.classification_loss import get_weighted_ce_loss, FocalLoss


BATCH = 4
C, H, W = 3, 128, 128


@pytest.fixture
def dummy_batch():
    return torch.randn(BATCH, C, H, W)


# ── Architecture forward pass ──────────────────────────────────────────────────

def test_resnet18_forward(dummy_batch):
    model = ResNet18Extractor(num_classes=2, pretrained=False)
    model.eval()
    with torch.no_grad():
        out = model(dummy_batch)
    assert out.shape == (BATCH, 2)


def test_resnet18_embed(dummy_batch):
    model = ResNet18Extractor(num_classes=2, pretrained=False)
    model.eval()
    with torch.no_grad():
        emb = model.embed(dummy_batch)
    assert emb.shape == (BATCH, 512)


def test_resnet50_forward(dummy_batch):
    model = ResNet50Extractor(num_classes=2, pretrained=False)
    model.eval()
    with torch.no_grad():
        out = model(dummy_batch)
    assert out.shape == (BATCH, 2)


def test_custom_cnn_forward(dummy_batch):
    model = CustomCNN(num_classes=2)
    model.eval()
    with torch.no_grad():
        out = model(dummy_batch)
    assert out.shape == (BATCH, 2)


def test_custom_cnn_embed(dummy_batch):
    model = CustomCNN(num_classes=2)
    model.eval()
    with torch.no_grad():
        emb = model.embed(dummy_batch)
    assert emb.shape == (BATCH, 512)


# ── Freeze / unfreeze ──────────────────────────────────────────────────────────

def test_freeze_backbone():
    model = ResNet18Extractor(pretrained=False)
    model.freeze_backbone()
    for p in model.backbone.parameters():
        assert not p.requires_grad


def test_unfreeze_backbone():
    model = ResNet18Extractor(pretrained=False)
    model.freeze_backbone()
    model.unfreeze_backbone()
    for p in model.backbone.parameters():
        assert p.requires_grad


# ── Loss functions ─────────────────────────────────────────────────────────────

def test_weighted_ce_loss():
    labels = np.array([0, 0, 0, 1, 1])  # Imbalanced
    criterion = get_weighted_ce_loss(labels)
    logits = torch.randn(5, 2)
    targets = torch.tensor([0, 0, 0, 1, 1])
    loss = criterion(logits, targets)
    assert loss.item() > 0


def test_focal_loss():
    criterion = FocalLoss()
    logits = torch.randn(8, 2)
    targets = torch.randint(0, 2, (8,))
    loss = criterion(logits, targets)
    assert loss.item() > 0
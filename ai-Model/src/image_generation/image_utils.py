"""Image utility functions."""
from __future__ import annotations
import numpy as np
from PIL import Image
import torch
from torchvision import transforms
from src.config.hyperparameters import IMAGE_SIZE


def get_transforms(train: bool = True) -> transforms.Compose:
    """Return torchvision transforms for CNN input."""
    if train:
        return transforms.Compose([
            transforms.Resize(IMAGE_SIZE),
            transforms.RandomHorizontalFlip(p=0.1),
            transforms.ColorJitter(brightness=0.1, contrast=0.1),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
    else:
        return transforms.Compose([
            transforms.Resize(IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])


def pil_to_tensor(img: Image.Image, train: bool = False) -> torch.Tensor:
    """Convert PIL image to normalized tensor."""
    t = get_transforms(train=train)
    return t(img)


def tensor_to_pil(tensor: torch.Tensor) -> Image.Image:
    """Convert tensor back to PIL image (denormalize)."""
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
    img = tensor.cpu().clone()
    img = img * std + mean
    img = img.clamp(0, 1)
    return transforms.ToPILImage()(img)
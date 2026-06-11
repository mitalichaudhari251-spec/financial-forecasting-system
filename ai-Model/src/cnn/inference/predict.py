"""CNN inference — single image and batch prediction."""
from __future__ import annotations
import numpy as np
import torch
from PIL import Image
from src.image_generation.image_utils import pil_to_tensor
from src.utils.device import DEVICE


@torch.no_grad()
def predict_single(model, img: Image.Image) -> dict:
    """
    Predict direction for a single PIL image.

    Returns:
        {'label': int, 'confidence': float, 'probs': list}
    """
    model = model.to(DEVICE)
    model.eval()
    tensor = pil_to_tensor(img, train=False).unsqueeze(0).to(DEVICE)
    logits = model(tensor)
    probs = torch.softmax(logits, dim=1).squeeze().cpu().numpy()
    label = int(probs.argmax())
    return {"label": label, "confidence": float(probs[label]), "probs": probs.tolist()}

@torch.no_grad()
def extract_embedding(model, img: Image.Image) -> np.ndarray:
    """
    Extract 512-dim CNN embedding.
    """
    model = model.to(DEVICE)
    model.eval()

    tensor = pil_to_tensor(
        img,
        train=False
    ).unsqueeze(0).to(DEVICE)

    embedding = model.embed(tensor)

    return embedding.squeeze(0).cpu().numpy()

@torch.no_grad()
def predict_batch(model, images: list[Image.Image], batch_size: int = 64) -> list[dict]:
    """Predict direction for a list of PIL images."""
    model = model.to(DEVICE)
    model.eval()
    results = []

    for i in range(0, len(images), batch_size):
        batch = images[i: i + batch_size]
        tensors = torch.stack([pil_to_tensor(img, train=False) for img in batch]).to(DEVICE)
        logits = model(tensors)
        probs = torch.softmax(logits, dim=1).cpu().numpy()
        for p in probs:
            label = int(p.argmax())
            results.append({"label": label, "confidence": float(p[label]), "probs": p.tolist()})

    return results
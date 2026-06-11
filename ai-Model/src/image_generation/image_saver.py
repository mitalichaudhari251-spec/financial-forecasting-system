"""Utilities for saving and loading generated images."""
from __future__ import annotations
from pathlib import Path
import numpy as np
from PIL import Image
from tqdm import tqdm
from src.utils.logger import log


def save_images(
    images: list[Image.Image],
    labels: np.ndarray,
    output_dir: Path,
    asset: str,
    start_idx: int = 0,
) -> list[dict]:
    """
    Save images to disk organised by label.

    Directory structure: output_dir/asset/{label}/{window_id}.png

    Returns:
        List of metadata dicts {path, label, window_id}
    """
    output_dir = Path(output_dir)
    metadata = []

    for i, (img, label) in enumerate(tqdm(zip(images, labels), total=len(images), desc="Saving images")):
        window_id = start_idx + i
        label_dir = output_dir / asset / str(int(label))
        label_dir.mkdir(parents=True, exist_ok=True)
        path = label_dir / f"{window_id:06d}.png"
        img.save(path, format="PNG")
        metadata.append({"path": str(path), "label": int(label), "window_id": window_id})

    log.info(f"Saved {len(images)} images to {output_dir / asset}")
    return metadata


def load_image(path: Path) -> Image.Image:
    """Load a single image as PIL Image."""
    return Image.open(path).convert("RGB")
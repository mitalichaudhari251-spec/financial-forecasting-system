"""Extract CNN embeddings from trained model for all images."""
from __future__ import annotations
import numpy as np
import torch
from torch.utils.data import DataLoader
from tqdm import tqdm
from src.utils.device import DEVICE
from src.utils.logger import log


@torch.no_grad()
def extract_embeddings(
    model,
    dataset,
    batch_size: int = 64,
    num_workers: int = 4,
) -> np.ndarray:
    """
    Extract 512-dim embeddings for all samples in a dataset.

    Args:
        model: Trained CNN with .embed() method
        dataset: ImageDataset instance
        batch_size: Batch size for inference

    Returns:
        embeddings: shape (N, embedding_dim)
    """
    model = model.to(DEVICE)
    model.eval()

    loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )

    all_embeddings = []
    for imgs, _ in tqdm(loader, desc="Extracting embeddings"):
        imgs = imgs.to(DEVICE)
        emb = model.embed(imgs)
        all_embeddings.append(emb.cpu().numpy())

    embeddings = np.vstack(all_embeddings)
    log.info(f"Extracted embeddings: shape={embeddings.shape}")
    return embeddings
"""
CNN training entry point. Wires together dataset, model, trainer.
"""
from __future__ import annotations
import numpy as np

from src.cnn.architectures.resnet18 import ResNet18Extractor
from src.cnn.architectures.resnet50 import ResNet50Extractor
from src.cnn.architectures.custom_cnn import CustomCNN
from src.cnn.training.trainer import CNNTrainer
from src.cnn.training.optimizer import get_optimizer
from src.cnn.training.scheduler import get_scheduler
from src.cnn.losses.classification_loss import get_weighted_ce_loss
from src.datasets.image_dataset import ImageDataset
from src.datasets.dataloader import create_dataloaders
from src.config.hyperparameters import CNN_BACKBONE, CNN_EPOCHS, CNN_BATCH_SIZE
from src.config.paths import cnn_checkpoint_path
from src.utils.seed import set_seed
from src.utils.logger import log


def build_model(backbone: str = CNN_BACKBONE, num_classes: int = 2):
    if backbone == "resnet18":
        return ResNet18Extractor(num_classes=num_classes)
    elif backbone == "resnet50":
        return ResNet50Extractor(num_classes=num_classes)
    elif backbone == "custom":
        return CustomCNN(num_classes=num_classes)
    else:
        raise ValueError(f"Unknown backbone: {backbone}")


def train_cnn(
    metadata: list[dict],
    backbone: str = CNN_BACKBONE,
    epochs: int = CNN_EPOCHS,
    batch_size: int = CNN_BATCH_SIZE,
) -> tuple:
    """
    Full CNN training pipeline.

    Phase 1: Train head only at lr=1e-3 (backbone frozen), 15 epochs.
    Phase 2: Fine-tune full network at lr=1e-4 (10x smaller to avoid
             overwriting Phase 1 weights), up to `epochs` epochs.

    Returns:
        (model, history)
    """
    set_seed()
    log.info(f"Starting CNN training: backbone={backbone}, epochs={epochs}")

    dataset      = ImageDataset(metadata, train=True)
    train_loader, val_loader = create_dataloaders(dataset, batch_size=batch_size)
    model        = build_model(backbone)
    labels       = np.array([m["label"] for m in metadata])
    criterion    = get_weighted_ce_loss(labels)
    ckpt_path    = cnn_checkpoint_path(backbone)

    # ── Phase 1: head only, lr=1e-3 ─────────────────────────────────────────
    optimizer_p1 = get_optimizer(model, lr=1e-3)
    scheduler_p1 = get_scheduler(optimizer_p1, scheduler_type="cosine", epochs=15)

    trainer = CNNTrainer(
        model=model,
        optimizer=optimizer_p1,
        criterion=criterion,
        scheduler=scheduler_p1,
        checkpoint_path=ckpt_path,
        patience=15,
    )

    model.freeze_backbone()
    log.info("Phase 1: Training head only (backbone frozen, lr=1e-3)")
    trainer.fit(train_loader, val_loader, epochs=15)

    # ── Phase 2: full network, lr=1e-4 (10x smaller) ─────────────────────────
    # FIX: Phase 2 was using the same lr as Phase 1 which overwrote the good
    # Phase 1 weights. 1e-4 preserves them while still allowing fine-tuning.
    optimizer_p2 = get_optimizer(model, lr=1e-4)
    scheduler_p2 = get_scheduler(
        optimizer_p2, scheduler_type="cosine", epochs=epochs
    )
    trainer.optimizer = optimizer_p2
    trainer.scheduler = scheduler_p2

    model.unfreeze_backbone()
    log.info("Phase 2: Fine-tuning entire network (lr=1e-4)")
    history = trainer.fit(train_loader, val_loader, epochs=epochs)

    trainer.load_best()
    return model, history
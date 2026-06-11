"""LR scheduler factory."""
import torch.optim as optim


def get_scheduler(optimizer, scheduler_type: str = "cosine", epochs: int = 20, warmup_epochs: int = 3):
    """
    Get learning rate scheduler.

    Args:
        scheduler_type: 'cosine' | 'step' | 'plateau'
        epochs: Total training epochs
        warmup_epochs: Warmup epochs (linear LR ramp-up)
    """
    if scheduler_type == "cosine":
        return optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs - warmup_epochs, eta_min=1e-6)
    elif scheduler_type == "step":
        return optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    elif scheduler_type == "plateau":
        return optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode="max", patience=3, factor=0.5, min_lr=1e-7, verbose=True
        )
    else:
        raise ValueError(f"Unknown scheduler: {scheduler_type}")
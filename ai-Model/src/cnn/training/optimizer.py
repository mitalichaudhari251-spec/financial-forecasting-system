"""Optimizer factory with differential learning rates for fine-tuning."""
import torch.optim as optim
from src.config.hyperparameters import CNN_LR_HEAD, CNN_LR_BACKBONE, CNN_WEIGHT_DECAY


def get_optimizer(
    model,
    lr_head: float = CNN_LR_HEAD,
    lr_backbone: float = CNN_LR_BACKBONE,
    lr: float | None = None,          # FIX: override for Phase 2
):
    """
    Create Adam optimizer with differential learning rates.
    Pass lr= to override both groups with a single rate (used for Phase 2).
    """
    backbone_params = (
        list(model.backbone.parameters())
        if hasattr(model, "backbone") else []
    )
    head_params = (
        list(model.embedding_layer.parameters()) +
        list(model.classifier.parameters())
        if hasattr(model, "embedding_layer")
        else list(model.parameters())
    )

    # If a single lr override is given, use it for everything
    if lr is not None:
        lr_head     = lr
        lr_backbone = lr

    if backbone_params:
        param_groups = [
            {"params": backbone_params, "lr": lr_backbone,
             "weight_decay": CNN_WEIGHT_DECAY},
            {"params": head_params,     "lr": lr_head,
             "weight_decay": CNN_WEIGHT_DECAY},
        ]
    else:
        param_groups = [
            {"params": head_params, "lr": lr_head,
             "weight_decay": CNN_WEIGHT_DECAY}
        ]

    return optim.Adam(param_groups)
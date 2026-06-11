"""Device detection and management."""
import torch
from src.utils.logger import log

_WARNED = False

def get_device() -> torch.device:
    """Return the best available device. Warning fires once only."""
    global _WARNED
    if torch.cuda.is_available():
        device = torch.device("cuda")
        log.info(f"GPU detected: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        if not _WARNED:
            log.warning("No GPU detected. Running on CPU — training will be slower.")
            _WARNED = True
    return device

DEVICE = get_device()
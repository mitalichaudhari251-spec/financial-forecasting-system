"""
Grad-CAM visualization for CNN interpretability.
Uses pytorch-grad-cam library.
"""
from __future__ import annotations
import numpy as np
import torch
from PIL import Image
import cv2
from src.image_generation.image_utils import pil_to_tensor
from src.utils.device import DEVICE
from src.utils.logger import log


def get_gradcam_heatmap(model, img: Image.Image, target_class: int | None = None) -> Image.Image:
    """
    Generate Grad-CAM heatmap overlay for a single image.

    Args:
        model: Trained ResNet model
        img: Input PIL image
        target_class: Class to visualize (None = argmax)

    Returns:
        PIL Image with heatmap overlay
    """
    try:
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.image import show_cam_on_image
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
    except ImportError:
        log.warning("pytorch-grad-cam not installed. Run: pip install pytorch-grad-cam")
        return img

    model = model.to(DEVICE)
    model.eval()

    # Target layer: last conv layer of ResNet
    if hasattr(model, "backbone"):
        target_layers = [model.backbone.layer4[-1]]
    else:
        # Custom CNN fallback
        target_layers = [model.features[-3]]

    input_tensor = pil_to_tensor(img, train=False).unsqueeze(0).to(DEVICE)

    with GradCAM(model=model, target_layers=target_layers) as cam:
        targets = [ClassifierOutputTarget(target_class)] if target_class is not None else None
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        grayscale_cam = grayscale_cam[0]

    # Convert original image to numpy for overlay
    img_resized = img.resize((128, 128))
    img_np = np.array(img_resized).astype(np.float32) / 255.0
    visualization = show_cam_on_image(img_np, grayscale_cam, use_rgb=True)
    return Image.fromarray(visualization)
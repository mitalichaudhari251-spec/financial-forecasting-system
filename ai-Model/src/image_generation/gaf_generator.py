"""
Gramian Angular Field (GAF) image generator.
Encodes 1D time series as 2D images via angular correlations.
"""
from __future__ import annotations
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from src.config.hyperparameters import IMAGE_SIZE, GAF_METHOD
from src.utils.logger import log


class GAFGenerator:
    """
    Generates Gramian Angular Field images from time-series windows.

    GASF (Summation): G[i,j] = cos(phi_i + phi_j)
    GADF (Difference): G[i,j] = sin(phi_i - phi_j)
    """

    def __init__(
        self,
        method: str = GAF_METHOD,
        image_size: tuple[int, int] = IMAGE_SIZE,
        colormap: str = "jet",
    ):
        if method not in ("summation", "difference"):
            raise ValueError(f"method must be 'summation' or 'difference', got '{method}'")
        self.method = method
        self.image_size = image_size
        self.colormap = colormap

    def _to_polar(self, series: np.ndarray) -> np.ndarray:
        """Map series values in [-1, 1] to angles via arccos."""
        # Clip to valid arccos range
        clipped = np.clip(series, -1.0, 1.0)
        return np.arccos(clipped)

    def _compute_gaf(self, phi: np.ndarray) -> np.ndarray:
        """Compute GASF or GADF matrix from angle array."""
        if self.method == "summation":
            # GASF: cos(phi_i + phi_j)
            return np.cos(np.add.outer(phi, phi))
        else:
            # GADF: sin(phi_i - phi_j)
            return np.sin(np.subtract.outer(phi, phi))

    def series_to_gaf(self, series: np.ndarray) -> np.ndarray:
        """
        Convert 1D series to GAF matrix.

        Args:
            series: 1D array, should be in [0, 1] range

        Returns:
            GAF matrix of shape (T, T)
        """
        # Scale to [-1, 1]
        scaled = 2.0 * series - 1.0
        phi = self._to_polar(scaled)
        return self._compute_gaf(phi)

    def window_to_image(self, window: np.ndarray, channel: int = 3) -> Image.Image:
        """
        Convert OHLCV window to a GAF image.

        Args:
            window: shape (T, F) — uses Close price (column 3)
            channel: Feature column index (3 = Close)

        Returns:
            PIL Image
        """
        series = window[:, channel]
        # Normalize to [0, 1]
        mn, mx = series.min(), series.max()
        if mx - mn < 1e-8:
            series = np.zeros_like(series)
        else:
            series = (series - mn) / (mx - mn)

        gaf = self.series_to_gaf(series)

        # Convert matrix to colormap image
        fig, ax = plt.subplots(figsize=(1, 1), dpi=self.image_size[0])
        ax.imshow(gaf, cmap=self.colormap, vmin=-1, vmax=1, aspect="auto")
        ax.axis("off")
        fig.tight_layout(pad=0)

        import io
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
        plt.close(fig)
        buf.seek(0)

        img = Image.open(buf).convert("RGB")
        img = img.resize(self.image_size, Image.LANCZOS)
        return img

    def batch_to_images(self, windows: np.ndarray) -> list[Image.Image]:
        """Convert batch of windows to GAF images."""
        images = []
        for i, w in enumerate(windows):
            try:
                images.append(self.window_to_image(w))
            except Exception as e:
                log.warning(f"GAF render failed for window {i}: {e}")
                images.append(Image.new("RGB", self.image_size, (128, 128, 128)))
        return images
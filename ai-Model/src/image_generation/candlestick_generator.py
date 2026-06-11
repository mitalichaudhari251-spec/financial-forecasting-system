"""
Candlestick chart image generator using mplfinance.
Converts OHLCV windows into PNG candlestick images.
"""
from __future__ import annotations
import io
import numpy as np
import pandas as pd
import mplfinance as mpf
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from PIL import Image
from src.config.hyperparameters import IMAGE_SIZE, WINDOW_SIZE
from src.utils.constants import OHLCV_COLUMNS
from src.utils.logger import log


class CandlestickGenerator:
    """Renders OHLCV windows as candlestick chart images."""

    def __init__(self, image_size: tuple[int, int] = IMAGE_SIZE):
        self.image_size = image_size
        self._style = mpf.make_mpf_style(
            base_mpl_style="seaborn-v0_8-white",
            marketcolors=mpf.make_marketcolors(
                up="green", down="red", edge="inherit",
                wick="inherit", volume="inherit",
            ),
        )

    def window_to_image(self, window: np.ndarray) -> Image.Image:
        """
        Convert a single OHLCV window to a PIL Image.

        Args:
            window: shape (T, 5) — T timesteps, [Open, High, Low, Close, Volume]

        Returns:
            PIL Image of size self.image_size
        """
        df = self._window_to_dataframe(window)
        fig, ax = mpf.plot(
            df,
            type="candle",
            style=self._style,
            volume=False,
            returnfig=True,
            figsize=(2.0, 2.0),
            tight_layout=True,
        )
        ax[0].axis("off")

        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", pad_inches=0, dpi=64)
        plt.close(fig)
        buf.seek(0)

        img = Image.open(buf).convert("RGB")
        img = img.resize(self.image_size, Image.LANCZOS)
        return img

    def _window_to_dataframe(self, window: np.ndarray) -> pd.DataFrame:
        """Convert numpy window to mplfinance-compatible DataFrame."""
        n = len(window)
        dates = pd.date_range("2000-01-01", periods=n, freq="B")
        cols = OHLCV_COLUMNS[:window.shape[1]]
        df = pd.DataFrame(window, index=dates, columns=cols)
        # Ensure Open <= High and Open >= Low (clamp after normalization)
        df["High"] = df[["Open", "High", "Close"]].max(axis=1)
        df["Low"] = df[["Open", "Low", "Close"]].min(axis=1)
        return df

    def batch_to_images(self, windows: np.ndarray) -> list[Image.Image]:
        """Convert a batch of windows to images."""
        images = []
        for i, w in enumerate(windows):
            try:
                images.append(self.window_to_image(w))
            except Exception as e:
                log.warning(f"Failed to render window {i}: {e}")
                images.append(Image.new("RGB", self.image_size, color=(128, 128, 128)))
        return images
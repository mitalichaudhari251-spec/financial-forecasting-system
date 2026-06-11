"""Abstract base class for RL agents."""
from abc import ABC, abstractmethod
from pathlib import Path
import numpy as np


class BaseAgent(ABC):
    """Abstract interface that all RL agents must implement."""

    @abstractmethod
    def train(self, env, total_timesteps: int, **kwargs) -> None:
        """Train the agent in the given environment."""

    @abstractmethod
    def predict(self, observation: np.ndarray) -> tuple[int, dict]:
        """Predict action given observation. Returns (action, info)."""

    @abstractmethod
    def save(self, path: Path) -> None:
        """Save model to disk."""

    @abstractmethod
    def load(self, path: Path) -> None:
        """Load model from disk."""
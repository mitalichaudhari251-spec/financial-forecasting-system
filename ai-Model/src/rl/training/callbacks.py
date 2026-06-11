"""Custom SB3 callbacks for RL training monitoring."""
from __future__ import annotations
import numpy as np
from stable_baselines3.common.callbacks import BaseCallback
from src.utils.logger import log


class RewardLoggerCallback(BaseCallback):
    """Logs episode rewards and directional accuracy during training."""

    def __init__(self, log_freq: int = 1000, verbose: int = 0):
        super().__init__(verbose)
        self.log_freq = log_freq
        self.episode_rewards: list[float] = []
        self._episode_reward = 0.0

    def _on_step(self) -> bool:
        reward = self.locals["rewards"][0]
        self._episode_reward += reward

        done = self.locals["dones"][0]
        if done:
            self.episode_rewards.append(self._episode_reward)
            self._episode_reward = 0.0

        if self.n_calls % self.log_freq == 0 and self.episode_rewards:
            recent = self.episode_rewards[-50:]
            log.info(
                f"Step {self.num_timesteps} | "
                f"Mean episode reward (last 50): {np.mean(recent):.4f} | "
                f"Episodes: {len(self.episode_rewards)}"
            )
        return True


class PortfolioTrackerCallback(BaseCallback):
    """Tracks portfolio value evolution during training."""

    def __init__(self, verbose: int = 0):
        super().__init__(verbose)
        self.portfolio_values: list[float] = []

    def _on_step(self) -> bool:
        info = self.locals.get("infos", [{}])[0]
        if "portfolio_value" in info:
            self.portfolio_values.append(info["portfolio_value"])
        return True
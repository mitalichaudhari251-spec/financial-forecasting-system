"""DQN agent wrapper using stable-baselines3."""
from __future__ import annotations
from pathlib import Path
import numpy as np
from stable_baselines3 import DQN
from stable_baselines3.common.vec_env import DummyVecEnv
from src.rl.agents.base_agent import BaseAgent
from src.config.hyperparameters import (
    RL_LEARNING_RATE, RL_BATCH_SIZE, RL_GAMMA,
    RL_BUFFER_SIZE, RL_LEARNING_STARTS, RL_EXPLORATION_FRACTION,
    RL_TOTAL_TIMESTEPS,
)
from src.utils.logger import log


class DQNAgent(BaseAgent):
    """Deep Q-Network agent for market forecasting."""

    def __init__(self, env_fn, verbose: int = 1):
        vec_env = DummyVecEnv([env_fn])
        self.vec_env = vec_env

        self.model = DQN(
            policy="MlpPolicy",
            env=self.vec_env,
            learning_rate=RL_LEARNING_RATE,
            batch_size=RL_BATCH_SIZE,
            gamma=RL_GAMMA,
            buffer_size=RL_BUFFER_SIZE,
            learning_starts=RL_LEARNING_STARTS,
            exploration_fraction=RL_EXPLORATION_FRACTION,
            exploration_final_eps=0.05,
            target_update_interval=1000,
            verbose=verbose,
        )
        log.info("DQN agent initialised")

    def train(
        self,
        env=None,
        total_timesteps: int = RL_TOTAL_TIMESTEPS,
        checkpoint_path: Path | None = None,
        **kwargs,
    ) -> None:
        log.info(f"DQN training started: {total_timesteps} timesteps")
        self.model.learn(total_timesteps=total_timesteps, progress_bar=True)
        if checkpoint_path:
            self.save(checkpoint_path)
        log.info("DQN training complete")

    def predict(self, observation: np.ndarray) -> tuple[int, dict]:
        action, _states = self.model.predict(observation.reshape(1, -1), deterministic=True)
        return int(action[0]), {}

    def save(self, path: Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.model.save(str(path))
        log.info(f"DQN model saved: {path}")

    def load(self, path: Path) -> None:
        self.model = DQN.load(str(path), env=self.vec_env)
        log.info(f"DQN model loaded: {path}")
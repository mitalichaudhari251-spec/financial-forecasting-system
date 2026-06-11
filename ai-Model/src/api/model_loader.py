"""
Singleton model loader — loads CNN and RL models once and caches them.
"""
from __future__ import annotations
import torch
from pathlib import Path
from src.utils.device import DEVICE
from src.utils.logger import log


class ModelRegistry:
    """Thread-safe singleton registry for loaded models."""

    _cnn_model = None
    _rl_agent = None

    @classmethod
    def load_cnn(cls, checkpoint_path: Path, backbone: str = "resnet18"):
        if cls._cnn_model is not None:
            return cls._cnn_model

        from src.cnn.training.train import build_model
        model = build_model(backbone=backbone)
        ckpt = torch.load(str(checkpoint_path), map_location=DEVICE)
        model.load_state_dict(ckpt["model_state_dict"])
        model = model.to(DEVICE)
        model.eval()
        cls._cnn_model = model
        log.info(f"CNN model loaded from {checkpoint_path}")
        return model

    @classmethod
    def load_rl(cls, checkpoint_path: Path, algorithm: str = "PPO", env_fn=None):
        log.info(f"Loading RL agent from {checkpoint_path}")
        if cls._rl_agent is not None:
            log.info("Using cached RL agent")
            return cls._rl_agent

        if algorithm.upper() == "PPO":
            from src.rl.agents.ppo_agent import PPOAgent
            agent = PPOAgent(env_fn=env_fn)
        else:
            from src.rl.agents.dqn_agent import DQNAgent
            agent = DQNAgent(env_fn=env_fn)

        agent.load(checkpoint_path)
        cls._rl_agent = agent
        log.info(f"RL agent ({algorithm}) loaded from {checkpoint_path}")
        return agent

    @classmethod
    def clear(cls):
        cls._cnn_model = None
        cls._rl_agent = None
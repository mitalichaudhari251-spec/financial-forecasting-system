"""
RL training entry point. Sets up MarketEnv and trains PPO or DQN agent.
"""
from __future__ import annotations
import numpy as np
from src.rl.env.market_env import MarketEnv
from src.rl.agents.ppo_agent import PPOAgent
from src.rl.agents.dqn_agent import DQNAgent
from src.config.hyperparameters import RL_ALGORITHM, RL_TOTAL_TIMESTEPS
from src.config.paths import rl_checkpoint_path
from src.utils.seed import set_seed
from src.utils.logger import log


def train_rl_agent(
    embeddings: np.ndarray,
    ohlcv: np.ndarray,
    labels: np.ndarray,
    prices: np.ndarray,
    algorithm: str = RL_ALGORITHM,
    total_timesteps: int = RL_TOTAL_TIMESTEPS,
) -> object:
    """
    Train an RL agent on the market environment.

    Args:
        embeddings: (N, 512) CNN embeddings
        ohlcv: (N, 5) OHLCV vectors
        labels: (N,) direction labels
        prices: (N,) close prices
        algorithm: 'PPO' or 'DQN'
        total_timesteps: Total environment steps

    Returns:
        Trained agent instance
    """
    set_seed()
    log.info(f"Starting RL training: algorithm={algorithm}, timesteps={total_timesteps}")

    # Split: 80% train for RL, 20% kept for evaluation (no data leakage)
    n = len(embeddings)
    train_end = int(n * 0.80)

    train_emb = embeddings[:train_end]
    train_ohlcv = ohlcv[:train_end]
    train_labels = labels[:train_end]
    train_prices = prices[:train_end]

    def make_env():
        return MarketEnv(train_emb, train_ohlcv, train_labels, train_prices)

    ckpt_path = rl_checkpoint_path(algorithm)

    if algorithm.upper() == "PPO":
        agent = PPOAgent(env_fn=make_env)
    elif algorithm.upper() == "DQN":
        agent = DQNAgent(env_fn=make_env)
    else:
        raise ValueError(f"Unknown RL algorithm: {algorithm}")

    agent.train(total_timesteps=total_timesteps, checkpoint_path=ckpt_path)
    agent.save(ckpt_path)
    # ── RL reward log save karo (frontend ke liye) ─────────────────────
    try:
        import json
        from pathlib import Path
        log_path = Path(f"logs/rl_reward_log_{algorithm.lower()}.json")
        log_path.parent.mkdir(parents=True, exist_ok=True)

        reward_log = []
        try:
            ep_buffer = agent.model.ep_info_buffer if hasattr(agent, 'model') else []
            for i, info in enumerate(ep_buffer):
                reward_log.append({
                    "episode":        i + 1,
                    "reward":         round(float(info.get("r", 0)), 4),
                    "total_episodes": len(ep_buffer),
                })
        except Exception:
            reward_log = []

        if reward_log:
            with open(log_path, "w") as f:
                json.dump(reward_log, f, indent=2)
            log.info(f"RL reward log saved: {log_path}")

    except Exception as _log_err:
        log.warning(f"Could not save RL reward log: {_log_err}")
    # ───────────────────────────────────────────────────────────────────

    return agent
"""
RL inference — run trained agent on test data.
Fixed: removed step-0 bankruptcy stop.
"""
from __future__ import annotations
import numpy as np
from src.rl.env.market_env import MarketEnv
from src.rl.env.action_space import action_to_direction
from src.utils.logger import log


def run_inference(
    agent,
    embeddings: np.ndarray,
    ohlcv: np.ndarray,
    labels: np.ndarray,
    prices: np.ndarray,
) -> dict:
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    obs, _ = env.reset()

    actions          = []
    directions       = []
    rewards          = []
    portfolio_values = [env.initial_cash]
    done             = False
    step             = 0

    while not done:
        action, _ = agent.predict(obs)
        obs, reward, terminated, truncated, info = env.step(action)
        done = terminated or truncated

        actions.append(int(action))
        directions.append(action_to_direction(action))
        rewards.append(float(reward))
        portfolio_values.append(float(info["portfolio_value"]))
        step += 1

        # FIXED: sirf bahut late stage pe stop karo, step 0 pe nahi
        if info["portfolio_value"] <= 0 and step > max(10, len(prices) // 10):
            log.warning(f"Portfolio hit 0 at step {step}. Stopping.")
            break

    actions          = np.array(actions,    dtype=np.int64)
    portfolio_values = np.array(portfolio_values, dtype=np.float32)

    if len(actions) == 0:
        log.warning("No actions taken — returning zeros.")
        return {
            "actions": np.zeros(1, dtype=np.int64),
            "directions": ["FLAT"],
            "portfolio_values": np.array([env.initial_cash], dtype=np.float32),
            "rewards": np.zeros(1, dtype=np.float32),
            "correct_predictions": np.zeros(1, dtype=bool),
            "directional_accuracy": 0.0,
            "total_return": 0.0,
        }

    labels_trimmed = labels[:len(actions)]
    correct = (
        ((actions == 2) & (labels_trimmed == 1)) |
        ((actions == 0) & (labels_trimmed == 0))
    )
    non_flat_mask        = actions != 1
    non_flat_correct     = correct[non_flat_mask]
    directional_accuracy = float(non_flat_correct.mean()) if non_flat_mask.sum() > 0 else 0.0

    initial      = float(portfolio_values[0])
    final        = float(portfolio_values[-1])
    total_return = (final - initial) / (initial + 1e-8)

    log.info(
        f"Inference complete: {len(actions)} steps | "
        f"Dir. accuracy={directional_accuracy:.4f} | "
        f"Portfolio return={total_return:.4f}"
    )

    return {
        "actions":              actions,
        "directions":           directions,
        "portfolio_values":     portfolio_values,
        "rewards":              np.array(rewards, dtype=np.float32),
        "correct_predictions":  correct,
        "directional_accuracy": directional_accuracy,
        "total_return":         total_return,
    }
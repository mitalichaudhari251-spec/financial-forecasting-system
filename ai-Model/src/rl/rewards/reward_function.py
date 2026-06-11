"""
Reward function logic for FinVision-RL.
R = alpha * pred_accuracy + beta * sim_return - gamma * transaction_cost
"""
from src.config.hyperparameters import REWARD_ALPHA, REWARD_BETA, REWARD_GAMMA


def compute_reward(
    pred_correct: int,
    sim_return: float,
    transaction_cost: float,
    alpha: float = REWARD_ALPHA,
    beta: float = REWARD_BETA,
    gamma: float = REWARD_GAMMA,
) -> float:
    """
    Composite reward function.

    Args:
        pred_correct: 1 if directional prediction was correct, else 0
        sim_return: Simulated portfolio return for this step
        transaction_cost: Cost incurred for trade (0 if hold)
        alpha: Weight for prediction accuracy
        beta: Weight for simulated return
        gamma: Weight for transaction cost penalty

    Returns:
        Scalar reward
    """
    return alpha * pred_correct + beta * sim_return - gamma * transaction_cost
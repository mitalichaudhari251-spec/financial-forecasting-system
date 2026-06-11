"""Tests for RL environment and reward function."""
import numpy as np
import pytest
from src.rl.env.market_env import MarketEnv
from src.rl.rewards.reward_function import compute_reward
from src.rl.env.action_space import action_to_direction, describe_action
from src.utils.constants import ACTION_BUY, ACTION_SELL, ACTION_HOLD


# ── MarketEnv ──────────────────────────────────────────────────────────────────

def test_market_env_reset(dummy_env_data):
    embeddings, ohlcv, labels, prices = dummy_env_data
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    obs, info = env.reset()
    assert obs.shape == (512 + 5,)
    assert isinstance(info, dict)


def test_market_env_step_returns_correct_shape(dummy_env_data):
    embeddings, ohlcv, labels, prices = dummy_env_data
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    obs, _ = env.reset()
    obs2, reward, done, truncated, info = env.step(ACTION_BUY)
    assert obs2.shape == (512 + 5,)
    assert isinstance(reward, float)
    assert isinstance(done, bool)


def test_market_env_full_episode(dummy_env_data):
    embeddings, ohlcv, labels, prices = dummy_env_data
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    obs, _ = env.reset()
    done = False
    steps = 0
    while not done:
        action = env.action_space.sample()
        obs, reward, done, truncated, info = env.step(action)
        steps += 1
        if steps > 200:
            break
    assert steps > 0


def test_market_env_observation_space(dummy_env_data):
    embeddings, ohlcv, labels, prices = dummy_env_data
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    assert env.observation_space.shape == (512 + 5,)
    assert env.action_space.n == 3


def test_market_env_buy_increases_shares(dummy_env_data):
    embeddings, ohlcv, labels, prices = dummy_env_data
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    env.reset()
    env.step(ACTION_BUY)
    assert env._shares > 0 or env._cash == 0  # Cash converted to shares


def test_market_env_sell_after_buy(dummy_env_data):
    embeddings, ohlcv, labels, prices = dummy_env_data
    env = MarketEnv(embeddings, ohlcv, labels, prices)
    env.reset()
    env.step(ACTION_BUY)
    env.step(ACTION_SELL)
    assert env._shares == 0.0


# ── Reward function ────────────────────────────────────────────────────────────

def test_reward_correct_prediction():
    r = compute_reward(pred_correct=1, sim_return=0.01, transaction_cost=0.0)
    assert r > 0


def test_reward_wrong_prediction():
    r = compute_reward(pred_correct=0, sim_return=-0.01, transaction_cost=0.001)
    assert r < 0.5


def test_reward_with_cost():
    r_no_cost = compute_reward(pred_correct=1, sim_return=0.01, transaction_cost=0.0)
    r_with_cost = compute_reward(pred_correct=1, sim_return=0.01, transaction_cost=0.01)
    assert r_no_cost > r_with_cost


# ── Action space helpers ───────────────────────────────────────────────────────

def test_action_to_direction():
    assert action_to_direction(ACTION_BUY) == "UP"
    assert action_to_direction(ACTION_SELL) == "DOWN"
    assert action_to_direction(ACTION_HOLD) == "FLAT"


def test_describe_action():
    assert "Buy" in describe_action(ACTION_BUY) or "Up" in describe_action(ACTION_BUY)
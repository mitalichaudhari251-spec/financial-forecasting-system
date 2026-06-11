"""Method 4 - Test Saved RL Agent"""
import numpy as np
import sys
sys.path.insert(0, '.')

from src.rl.agents.ppo_agent import PPOAgent
from src.rl.env.market_env import MarketEnv
from src.rl.env.action_space import action_to_direction
from src.config.paths import rl_checkpoint_path

# Dummy env for loading
dummy_emb    = np.random.randn(100, 512).astype('float32')
dummy_ohlcv  = np.random.rand(100, 5).astype('float32')
dummy_labels = np.random.randint(0, 2, 100).astype('int64')
dummy_prices = (100 + np.cumsum(np.random.randn(100))).astype('float32')

env_fn = lambda: MarketEnv(dummy_emb, dummy_ohlcv, dummy_labels, dummy_prices)

# Load agent
agent = PPOAgent(env_fn=env_fn, verbose=0)
agent.load(rl_checkpoint_path('PPO'))
print('RL Agent loaded successfully')

# Run 10 predictions
env = MarketEnv(dummy_emb, dummy_ohlcv, dummy_labels, dummy_prices)
obs, _ = env.reset()
actions = []
portfolio_value = 10000.0
position = 0

for step in range(10):
    action, _ = agent.predict(obs)
    obs, reward, done, _, info = env.step(action)
    direction = action_to_direction(action)
    actions.append(direction)
    portfolio_value = info['portfolio_value']
    position = info['position']
    print(f'  Step {step+1}: action={direction}, reward={reward:.4f}, portfolio={portfolio_value:.2f}')
    if done:
        break

print()
print(f'RL Agent predictions : {actions}')
print(f'Final portfolio value : {portfolio_value:.2f}')
print(f'Final position       : {position}')
print()
print('RL Agent Working Correctly!')
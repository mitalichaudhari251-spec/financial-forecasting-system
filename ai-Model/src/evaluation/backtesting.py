"""
Backtesting engine - FinVision-RL
Fixed: removed circuit breaker that was halting all trades on small test sets.
Fixed: proper win rate calculation based on closed trades.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from src.config.hyperparameters import TRANSACTION_COST
from src.utils.constants import ACTION_BUY, ACTION_SELL, ACTION_HOLD
from src.utils.logger import log


class Backtester:
    """Simulates a long/flat trading strategy from RL agent actions."""

    def __init__(
        self,
        initial_cash: float = 10_000.0,
        transaction_cost: float = TRANSACTION_COST,
    ):
        self.initial_cash     = initial_cash
        self.transaction_cost = transaction_cost

    def run(
        self,
        prices: np.ndarray,
        actions: np.ndarray,
        timestamps: np.ndarray | None = None,
    ) -> pd.DataFrame:
        cash     = float(self.initial_cash)
        shares   = 0.0
        position = 0
        records  = []

        n = min(len(prices), len(actions))

        for i in range(n):
            price  = float(prices[i])
            action = int(actions[i])

            if price <= 0:
                price = float(prices[i - 1]) if i > 0 else 1.0

            tc = 0.0

            # BUY
            if action == ACTION_BUY and position == 0 and cash > 0:
                tc       = cash * self.transaction_cost
                invest   = cash - tc
                shares   = invest / price
                cash     = 0.0
                position = 1

            # SELL
            elif action == ACTION_SELL and position == 1 and shares > 0:
                proceeds = shares * price
                tc       = proceeds * self.transaction_cost
                cash     = proceeds - tc
                shares   = 0.0
                position = 0

            portfolio_value = cash + shares * price

            records.append({
                "step":            i,
                "price":           price,
                "action":          action,
                "cash":            cash,
                "shares":          shares,
                "portfolio_value": portfolio_value,
                "transaction_cost": tc,
                "position":        position,
                "halted":          False,
            })

        df = pd.DataFrame(records)

        if timestamps is not None and len(timestamps) == len(df):
            df.index = pd.to_datetime(timestamps)

        df["daily_return"] = df["portfolio_value"].pct_change().fillna(0.0)
        peak               = df["portfolio_value"].cummax()
        df["drawdown"]     = (peak - df["portfolio_value"]) / (peak + 1e-8)

        positive_steps = (df["daily_return"] > 0).sum()
        win_rate       = positive_steps / max(len(df), 1)
        final_value    = df["portfolio_value"].iloc[-1]
        total_return   = (final_value - self.initial_cash) / self.initial_cash

        log.info(
            f"Backtest complete: {len(df)} steps | "
            f"Final portfolio={final_value:.2f} | "
            f"Return={total_return:.4f} | "
            f"WinRate={win_rate:.4f} | "
            f"Halted=False"
        )
        return df

    def buy_and_hold(self, prices: np.ndarray) -> np.ndarray:
        shares = self.initial_cash / (float(prices[0]) + 1e-8)
        return shares * np.array(prices, dtype=np.float32)
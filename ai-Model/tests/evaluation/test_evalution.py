"""Tests for all evaluation metrics and backtesting."""
import numpy as np
import pytest
from src.evaluation.rmse import compute_rmse
from src.evaluation.mae import compute_mae
from src.evaluation.directional_accuracy import compute_directional_accuracy
from src.evaluation.sharpe_ratio import compute_sharpe_ratio
from src.evaluation.drawdown import compute_max_drawdown, compute_drawdown_series
from src.evaluation.backtesting import Backtester


# ── RMSE ──────────────────────────────────────────────────────────────────────

def test_rmse_perfect():
    y = np.array([1.0, 2.0, 3.0])
    assert compute_rmse(y, y) == pytest.approx(0.0, abs=1e-8)


def test_rmse_value():
    y_true = np.array([0.0, 0.0])
    y_pred = np.array([1.0, 1.0])
    assert compute_rmse(y_true, y_pred) == pytest.approx(1.0, abs=1e-6)


# ── MAE ───────────────────────────────────────────────────────────────────────

def test_mae_perfect():
    y = np.array([1.0, 2.0, 3.0])
    assert compute_mae(y, y) == pytest.approx(0.0, abs=1e-8)


def test_mae_value():
    y_true = np.array([0.0, 2.0])
    y_pred = np.array([1.0, 1.0])
    assert compute_mae(y_true, y_pred) == pytest.approx(1.0, abs=1e-6)


# ── Directional accuracy ───────────────────────────────────────────────────────

def test_dir_acc_perfect_binary():
    y_true = np.array([0, 1, 0, 1])
    assert compute_directional_accuracy(y_true, y_true) == pytest.approx(1.0)


def test_dir_acc_all_wrong():
    y_true = np.array([0, 1, 0, 1])
    y_pred = np.array([1, 0, 1, 0])
    assert compute_directional_accuracy(y_true, y_pred) == pytest.approx(0.0)


def test_dir_acc_three_class():
    y_true = np.array([0, 1, 0, 1])
    y_pred = np.array([0, 2, 0, 2])  # sell=0→down, buy=2→up
    assert compute_directional_accuracy(y_true, y_pred) == pytest.approx(1.0)


def test_dir_acc_three_class_all_flat():
    y_true = np.array([0, 1, 0, 1])
    y_pred = np.array([1, 1, 1, 1])  # all HOLD
    assert compute_directional_accuracy(y_true, y_pred) == pytest.approx(0.0)


# ── Sharpe ratio ──────────────────────────────────────────────────────────────

def test_sharpe_constant_growth():
    # Portfolio growing steadily
    pv = np.linspace(10_000, 12_000, 252)
    sharpe = compute_sharpe_ratio(pv)
    assert sharpe > 0  # Positive return → positive Sharpe


def test_sharpe_flat():
    pv = np.full(252, 10_000.0)
    sharpe = compute_sharpe_ratio(pv)
    assert sharpe == pytest.approx(0.0, abs=0.5)


# ── Max drawdown ──────────────────────────────────────────────────────────────

def test_max_drawdown_no_drawdown():
    pv = np.linspace(100, 200, 50)
    assert compute_max_drawdown(pv) == pytest.approx(0.0, abs=1e-6)


def test_max_drawdown_50pct():
    pv = np.array([100.0, 80.0, 60.0, 50.0, 60.0, 70.0])
    dd = compute_max_drawdown(pv)
    assert dd == pytest.approx(0.50, abs=0.01)


def test_drawdown_series_length():
    pv = np.linspace(100, 50, 100)  # Declining
    series = compute_drawdown_series(pv)
    assert len(series) == 100
    assert series[-1] > 0  # Should be in drawdown at end


# ── Backtester ────────────────────────────────────────────────────────────────

def test_backtest_buy_and_hold():
    prices = np.linspace(100, 150, 50)
    actions = np.full(50, 2)  # Always buy
    backtester = Backtester(initial_cash=10_000.0)
    df = backtester.run(prices, actions)
    assert "portfolio_value" in df.columns
    assert len(df) == 50
    assert df["portfolio_value"].iloc[-1] > 10_000  # Should profit


def test_backtest_always_sell():
    prices = np.linspace(100, 150, 50)
    actions = np.full(50, 0)  # Always sell
    backtester = Backtester(initial_cash=10_000.0)
    df = backtester.run(prices, actions)
    assert len(df) == 50


def test_buy_and_hold_benchmark():
    prices = np.array([100.0, 110.0, 120.0])
    backtester = Backtester(initial_cash=1000.0)
    bnh = backtester.buy_and_hold(prices)
    assert len(bnh) == 3
    assert bnh[0] == pytest.approx(1000.0, rel=0.01)


def test_backtest_daily_return_column():
    prices = np.ones(20) * 100
    actions = np.zeros(20, dtype=int)
    backtester = Backtester()
    df = backtester.run(prices, actions)
    assert "daily_return" in df.columns
    assert "drawdown" in df.columns
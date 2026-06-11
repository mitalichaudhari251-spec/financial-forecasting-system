'use client';

import { useState } from 'react';
import { generateEquityCurve } from '@/lib/chart-utils';
import type { BacktestMetrics } from '@/types/analytics';

// Mock hook for demo; replace with real API calls
export function useBacktesting() {
  const [isRunning, setRunning] = useState(false);
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null);
  const [equityCurve, setEquityCurve] = useState(generateEquityCurve());

  const run = async () => {
    setRunning(true);

    // Simulate a "real-time" backtest run: regenerate the series and recompute summary metrics.
    await new Promise((r) => setTimeout(r, 800));

    const seed = Date.now();
    const curve = generateEquityCurve(90, 100_000, seed);
    setEquityCurve(curve);

    const initial = curve[0]?.value ?? 100_000;
    const final = curve[curve.length - 1]?.value ?? initial;
    const totalReturnPct = ((final / initial) - 1) * 100;

    const values = curve.map((p) => p.value);
    const returns = values.slice(1).map((v, i) => (v - values[i]) / (values[i] || 1));

    const mean = returns.reduce((a, b) => a + b, 0) / Math.max(1, returns.length);
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, returns.length);
    const std = Math.sqrt(variance) || 0.0001;

    const downside = returns.filter((r) => r < 0);
    const downsideDev = Math.sqrt(
      downside.reduce((a, b) => a + b ** 2, 0) / Math.max(1, downside.length)
    ) || 0.0001;

    const maxDrawdown = Math.min(...curve.map((d) => d.drawdown));
    const annualizedReturn = Math.pow(1 + totalReturnPct / 100, 252 / Math.max(1, returns.length)) - 1;

    const volatility = std * Math.sqrt(252) * 100;
    const sharpeRatio = ((mean / std) * Math.sqrt(252)) || 0;
    const sortinoRatio = (mean / downsideDev) * Math.sqrt(252) || 0;
    const calmarRatio = annualizedReturn / Math.abs(maxDrawdown / 100 || 1e-6);

    const pos = returns.filter((r) => r > 0);
    const neg = returns.filter((r) => r < 0);
    const winRate = (pos.length / Math.max(1, returns.length)) * 100;

    const profitFactor =
      (pos.reduce((a, b) => a + b, 0) || 0) / Math.max(1e-8, Math.abs(neg.reduce((a, b) => a + b, 0) || 0));

    const totalTrades = returns.length;
    const winningTrades = pos.length;
    const losingTrades = neg.length;
    const avgWin = pos.length ? (pos.reduce((a, b) => a + b, 0) / pos.length) * 100 : 0;
    const avgLoss = neg.length ? (neg.reduce((a, b) => a + b, 0) / neg.length) * 100 : 0;

    const mae = returns.reduce((a, r) => a + Math.abs(r - mean), 0) / Math.max(1, returns.length);
    const rmse = Math.sqrt(returns.reduce((a, r) => a + (r - mean) ** 2, 0) / Math.max(1, returns.length));

    setMetrics({
      rmse,
      mae,
      directionalAccuracy: winRate,
      sharpeRatio,
      winRate,
      maxDrawdown,
      totalReturn: totalReturnPct,
      annualizedReturn: annualizedReturn * 100,
      volatility,
      calmarRatio,
      sortinoRatio,
      profitFactor,
      totalTrades,
      winningTrades,
      losingTrades,
      avgWin,
      avgLoss,
    });
    setRunning(false);
  };

  return { isRunning, metrics, equityCurve, run };
}

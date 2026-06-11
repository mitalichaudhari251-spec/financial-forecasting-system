'use client';

// RLRewardCard, SharpeRatioCard, PortfolioCard — grouped metric cards

import { Award, TrendingUp, DollarSign } from 'lucide-react';
import AccuracyCard from './AccuracyCard';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export function RLRewardCard() {
  const { rewardCurve: rewards } = useRealtimeMetrics();

  const avgLast20 =
    rewards.slice(-20).reduce((a, b) => a + b.reward, 0) / Math.max(1, rewards.slice(-20).length);
  const avgPrev20 =
    rewards.slice(-40, -20).reduce((a, b) => a + b.reward, 0) / Math.max(1, rewards.slice(-40, -20).length);

  const trend = (avgLast20 - avgPrev20) * 20; // scale for UI readability

  return (
    <AccuracyCard
      title="Avg RL Reward"
      value={avgLast20.toFixed(2)}
      trend={trend}
      trendLabel="vs previous bucket"
      icon={<Award className="w-4 h-4" />}
      color="indigo"
      delay={0.2}
    />
  );
}

export function SharpeRatioCard() {
  const { metrics } = useRealtimeMetrics();
  const sharpe = metrics.sharpeRatio;

  return (
    <AccuracyCard
      title="Sharpe Ratio"
      value={sharpe.toFixed(2)}
      trend={metrics.winRate}
      trendLabel="win rate %"
      icon={<TrendingUp className="w-4 h-4" />}
      color="teal"
      delay={0.3}
    />
  );
}

export function PortfolioCard() {
  const { metrics } = useRealtimeMetrics();
  const totalReturn = metrics.totalReturn;

  return (
    <AccuracyCard
      title="Portfolio Return"
      value={`${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`}
      trend={totalReturn}
      trendLabel="live backtest"
      icon={<DollarSign className="w-4 h-4" />}
      color="green"
      delay={0.4}
    />
  );
}

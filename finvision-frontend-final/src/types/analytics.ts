export interface BacktestMetrics {
  rmse: number;
  mae: number;
  directionalAccuracy: number;
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  calmarRatio: number;
  sortinoRatio: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
}

export interface EquityPoint {
  date: string;
  value: number;
  drawdown: number;
  benchmark?: number;
}

export interface TradeMarker {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  profit?: number;
}

export interface BenchmarkComparison {
  strategy: string;
  sharpeRatio: number;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  directionalAccuracy: number;
}

export interface StrategyComparison {
  name: 'CNN Only' | 'RL Only' | 'CNN + RL Hybrid';
  metrics: BacktestMetrics;
  color: string;
}

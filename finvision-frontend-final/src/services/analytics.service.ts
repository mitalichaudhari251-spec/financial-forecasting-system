import { api } from './api';
import type { BacktestMetrics, EquityPoint, BenchmarkComparison } from '@/types/analytics';

export const analyticsService = {
  runBacktest: (params: {
    asset: string;
    strategy: 'cnn' | 'rl' | 'hybrid';
    startDate: string;
    endDate: string;
    initialCapital?: number;
  }) => api.post<{ metrics: BacktestMetrics; equityCurve: EquityPoint[] }>('/analytics/backtest', params),

  getBenchmarkComparison: (asset: string, startDate: string, endDate: string) =>
    api.get<BenchmarkComparison[]>('/analytics/benchmark', { params: { asset, startDate, endDate } }),

  getPortfolioSimulation: (params: {
    assets: string[];
    weights: number[];
    startDate: string;
    endDate: string;
  }) => api.post('/analytics/portfolio', params),

  getRiskMetrics: (asset: string, period: string) =>
    api.get('/analytics/risk', { params: { asset, period } }),
};

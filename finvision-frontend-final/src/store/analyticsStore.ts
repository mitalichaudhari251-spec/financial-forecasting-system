import { create } from 'zustand';
import type { BacktestMetrics, EquityPoint, TradeMarker, BenchmarkComparison } from '@/types/analytics';

interface AnalyticsState {
  metrics: BacktestMetrics | null;
  equityCurve: EquityPoint[];
  trades: TradeMarker[];
  benchmarks: BenchmarkComparison[];
  isLoading: boolean;
  setMetrics: (m: BacktestMetrics) => void;
  setEquityCurve: (e: EquityPoint[]) => void;
  setTrades: (t: TradeMarker[]) => void;
  setBenchmarks: (b: BenchmarkComparison[]) => void;
  setLoading: (l: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  metrics: null,
  equityCurve: [],
  trades: [],
  benchmarks: [],
  isLoading: false,
  setMetrics: (metrics) => set({ metrics }),
  setEquityCurve: (equityCurve) => set({ equityCurve }),
  setTrades: (trades) => set({ trades }),
  setBenchmarks: (benchmarks) => set({ benchmarks }),
  setLoading: (isLoading) => set({ isLoading }),
}));

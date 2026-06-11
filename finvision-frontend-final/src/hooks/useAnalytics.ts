'use client';

import { useState, useCallback } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { useAnalyticsStore } from '@/store/analyticsStore';
import toast from 'react-hot-toast';

export function useAnalytics() {
  const { setMetrics, setEquityCurve, setBenchmarks, setLoading } = useAnalyticsStore();
  const [running, setRunning] = useState(false);

  const runBacktest = useCallback(async (
    asset: string,
    strategy: 'cnn' | 'rl' | 'hybrid',
    startDate: string,
    endDate: string
  ) => {
    setRunning(true);
    setLoading(true);
    try {
      const result = await analyticsService.runBacktest({ asset, strategy, startDate, endDate });
      setMetrics(result.metrics);
      setEquityCurve(result.equityCurve);
      toast.success('Backtest completed');
      return result;
    } catch {
      toast.error('Backtest failed');
      return null;
    } finally {
      setRunning(false);
      setLoading(false);
    }
  }, [setMetrics, setEquityCurve, setLoading]);

  const fetchBenchmarks = useCallback(async (asset: string, startDate: string, endDate: string) => {
    try {
      const benchmarks = await analyticsService.getBenchmarkComparison(asset, startDate, endDate);
      setBenchmarks(benchmarks);
    } catch {}
  }, [setBenchmarks]);

  return { runBacktest, fetchBenchmarks, running };
}

'use client';

import { useState, useCallback } from 'react';
import { forecastService } from '@/services/forecast.service';
import { useForecastStore } from '@/store/forecastStore';
import type { ForecastHorizon } from '@/types/forecast';
import toast from 'react-hot-toast';

export function useForecast() {
  const { setCurrentForecast, setRunning, setError, addToHistory } = useForecastStore();
  const [loading, setLoading] = useState(false);

  const runForecast = useCallback(
    async (asset: string, horizon: ForecastHorizon, rlAlgorithm: 'PPO' | 'DQN' = 'PPO') => {
      setLoading(true);
      setRunning(true);
      setError(null);
      try {
        const result = await forecastService.runForecast({ asset, horizon, rlAlgorithm });
        setCurrentForecast(result);
        addToHistory({
          id: result.id,
          asset: result.asset,
          direction: result.direction,
          confidence: result.confidence,
          sharpeRatio: result.sharpeRatio ?? 0,
          timestamp: result.timestamp,
          modelVersion: result.modelVersion,
          rlAlgorithm,
          horizon,
          status: 'completed',
        });
        toast.success(`Forecast for ${asset} completed`);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Forecast failed';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
        setRunning(false);
      }
    },
    [setCurrentForecast, setRunning, setError, addToHistory]
  );

  return { runForecast, loading };
}

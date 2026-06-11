import { api } from './api';
import type { ForecastResult, ForecastCase, ForecastFilters, ForecastHorizon } from '@/types/forecast';
import type { BackendForecast } from '@/lib/map-forecast';
import { mapBackendToForecastResult, mapBackendToForecastCase } from '@/lib/map-forecast';

type ApiRes<T> = { success: boolean; data: T };

export const forecastService = {
  runForecast: async (params: {
    asset: string;
    horizon: ForecastHorizon;
    rlAlgorithm?: 'PPO' | 'DQN';
  }) => {
    const res = await api.post<ApiRes<BackendForecast>>('/forecast', {
      ticker: params.asset,
      horizon: params.horizon,
      algorithm: params.rlAlgorithm ?? 'PPO',
    });
    return mapBackendToForecastResult(res.data);
  },

  getHistory: async (_filters?: ForecastFilters, _page = 1, _limit = 20) => {
    const res = await api.get<ApiRes<BackendForecast[]>>('/forecast/history');
    const items = (res.data ?? []).map(mapBackendToForecastCase);
    return { items, total: items.length, page: 1 };
  },

  getForecastById: async (id: string) => {
    const { items } = await forecastService.getHistory();
    const found = items.find((f) => f.id === id);
    if (!found) throw new Error('Forecast not found');
    const res = await api.get<ApiRes<BackendForecast[]>>('/forecast/history');
    const raw = (res.data ?? []).find((f) => f.id === id);
    return raw ? mapBackendToForecastResult(raw) : mapBackendToForecastResult({
      id: found.id,
      ticker: found.asset,
      direction: found.direction,
      confidence: found.confidence,
      probabilities: { bullish: 0.33, bearish: 0.33, neutral: 0.34 },
      sharpe_ratio: found.sharpeRatio,
      created_at: found.timestamp,
      algorithm: found.rlAlgorithm,
    });
  },

  rerunForecast: (id: string) => forecastService.getForecastById(id),

  getGradCAM: async (_id: string) => ({ url: '', heatmapUrl: '' }),

  exportForecast: async (_id: string, _format: 'csv' | 'json') => new Blob(),
};

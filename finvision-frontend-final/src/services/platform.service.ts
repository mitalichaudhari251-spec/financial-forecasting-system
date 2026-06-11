import { api } from './api';
import type { ForecastResult } from '@/types/forecast';
import type { BackendForecast } from '@/lib/map-forecast';
import { mapBackendToForecastResult, mapBackendToForecastCase } from '@/lib/map-forecast';

type ApiData<T> = { success: boolean; data: T; error?: string };

export interface DatasetItem {
  id: string;
  name: string;
  ticker: string;
  rowCount: number;
  sizeBytes: number;
  uploadedAt: string;
}

export interface DashboardSummary {
  aiOnline: boolean;
  modelStatus: string;
  datasetsCount: number;
  forecastsCount: number;
  latestForecast: BackendForecast | null;
  recentForecasts: BackendForecast[];
  sentiment: { total: number; bullish: number; bearish: number; neutral: number };
  metrics: { forecastAccuracy: number; sharpeRatio: number; winRate: number; totalReturn: number };
  equityCurve: { date: string; value: number }[];
  defaultTicker: string;
  updatedAt: string;
}

export const platformService = {
  getDashboard: () =>
    api.get<ApiData<DashboardSummary>>('/dashboard/summary').then((r) => r.data),

  getDatasets: () =>
    api.get<ApiData<DatasetItem[]>>('/data/datasets').then((r) => r.data),

  getForecastHistory: () =>
    api
      .get<ApiData<BackendForecast[]>>('/forecast/history')
      .then((r) => (r.data ?? []).map(mapBackendToForecastCase)),

  runForecast: (ticker: string, algorithm: 'PPO' | 'DQN' = 'PPO', horizon: '1d' | '7d' | '30d' = '7d') =>
    api
      .post<ApiData<BackendForecast>>('/forecast', { ticker, algorithm, horizon })
      .then((r) => mapBackendToForecastResult(r.data)),

  getMarketOHLCV: (ticker: string, days = 365) =>
    api.get<ApiData<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]>>(
      `/market/ohlcv/${encodeURIComponent(ticker)}`,
      { params: { days } }
    ).then((r) => r.data),

  fetchTicker: (ticker: string, startDate?: string, endDate?: string) =>
    api.post<ApiData<{ datasetId: string }>>('/data/fetch-ticker', { ticker, startDate, endDate }).then((r) => r.data),

  validateDataset: (id: string) =>
    api.get<ApiData<{ valid: boolean; rowCount: number; warnings: string[]; errors: string[] }>>(
      `/data/${id}/validate`
    ).then((r) => r.data),

  previewDataset: (id: string, rows = 50) =>
    api.get<ApiData<{ ticker: string; bars: unknown[]; startDate: string; endDate: string; schema: { rowCount: number } }>>(
      `/data/${id}/preview`,
      { params: { rows } }
    ).then((r) => r.data),

  preprocess: (datasetId: string, config: Record<string, unknown>) =>
    api.post<ApiData<{ processedId: string; series: { date: string; raw: number; processed: number }[]; stats: Record<string, number> }>>(
      '/data/preprocess',
      { datasetId, config }
    ).then((r) => r.data),

  generateImages: (datasetId: string, types: string[]) =>
    api.post<ApiData<{ jobId: string }>>('/data/generate-images', { datasetId, types }).then((r) => r.data),

  getImageJob: (jobId: string) =>
    api.get<ApiData<{ status: string; progress: number; images: { id: string; type: string; dataUrl: string; startDate: string; endDate: string; detectedPatterns: string[] }[] }>>(
      `/data/jobs/${jobId}`
    ).then((r) => r.data),

  getReports: () => api.get<ApiData<unknown[]>>('/reports').then((r) => r.data),

  generateReport: (forecastId: string) =>
    api.post<ApiData<unknown>>('/reports/generate', { forecastId }).then((r) => r.data),

  getTrainingStatus: () => api.get<ApiData<unknown>>('/training/status').then((r) => r.data),

  runBacktest: (asset: string) =>
    api.post<ApiData<{ metrics: Record<string, number>; equityCurve: { date: string; value: number; benchmark: number }[] }>>(
      '/analytics/backtest',
      { asset }
    ).then((r) => r.data),

  getBenchmark: (asset: string) =>
    api.get<ApiData<unknown[]>>('/analytics/benchmark', { params: { asset } }).then((r) => r.data),

  getRisk: (asset: string) =>
    api.get<ApiData<Record<string, number>>>('/analytics/risk', { params: { asset } }).then((r) => r.data),

  getPortfolio: (assets: string[], weights: number[]) =>
    api.post<ApiData<{ equityCurve: { date: string; value: number }[]; metrics: Record<string, number> }>>(
      '/analytics/portfolio',
      { assets, weights }
    ).then((r) => r.data),

  getAiHealth: () => api.get<ApiData<unknown>>('/forecast/ai-health').then((r) => r.data),
};

export type { ForecastResult };

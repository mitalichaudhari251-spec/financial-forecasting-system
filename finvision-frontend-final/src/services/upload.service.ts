import { api } from './api';
import type { MarketDataset, PreprocessingConfig } from '@/types/market';

interface UploadResponse {
  success: boolean;
  data: { datasetId: string; dataset: MarketDataset };
  error?: string;
}

export const uploadService = {
  uploadCSV: (payload: { filename: string; ticker?: string; bars: MarketDataset['bars'] }) =>
    api.post<UploadResponse>('/data/upload', payload).then((r) => r.data),

  listDatasets: () =>
    api.get<{ success: boolean; data: { id: string; name: string; ticker: string; rowCount: number; sizeBytes: number }[] }>(
      '/data/datasets'
    ).then((r) => r.data),

  fetchTicker: (ticker: string, startDate: string, endDate: string, timeframe: string) =>
    api.post<{ datasetId: string; dataset: MarketDataset }>('/data/fetch-ticker', {
      ticker, startDate, endDate, timeframe,
    }),

  validateDataset: (datasetId: string) =>
    api.get<{ valid: boolean; errors: string[]; warnings: string[] }>(`/data/${datasetId}/validate`),

  previewDataset: (datasetId: string, rows = 50) =>
    api.get<MarketDataset>(`/data/${datasetId}/preview`, { params: { rows } }),

  preprocess: (datasetId: string, config: PreprocessingConfig) =>
    api.post<{ processedId: string; stats: Record<string, number> }>('/data/preprocess', {
      datasetId, config,
    }),

  generateImages: (processedId: string, types: string[], resolution: number) =>
    api.post<{ jobId: string }>('/data/generate-images', { processedId, types, resolution }),

  getImageJobStatus: (jobId: string) =>
    api.get<{ status: string; progress: number; images: unknown[] }>(`/data/jobs/${jobId}`),
};

import type { OHLCVRow } from '../types';

export interface StoredDataset {
  id: string;
  filename: string;
  ticker: string;
  timeframe: 'daily';
  startDate: string;
  endDate: string;
  bars: OHLCVRow[];
  rowCount: number;
  uploadedAt: string;
}

const datasets = new Map<string, StoredDataset>();

export function saveUploadedDataset(
  filename: string,
  bars: OHLCVRow[],
  ticker?: string
): StoredDataset {
  const inferredTicker =
    ticker?.toUpperCase().trim() ||
    filename.replace(/\.csv$/i, '').split(/[_\-\s]/)[0]?.toUpperCase() ||
    'CUSTOM';

  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const id = `ds-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const dataset: StoredDataset = {
    id,
    filename,
    ticker: inferredTicker,
    timeframe: 'daily',
    startDate: sorted[0]?.date ?? '',
    endDate: sorted[sorted.length - 1]?.date ?? '',
    bars: sorted,
    rowCount: sorted.length,
    uploadedAt: new Date().toISOString(),
  };

  datasets.set(id, dataset);
  return dataset;
}

export function listDatasets(): StoredDataset[] {
  return Array.from(datasets.values()).sort(
    (a, b) => b.uploadedAt.localeCompare(a.uploadedAt)
  );
}

export function getDataset(id: string): StoredDataset | undefined {
  return datasets.get(id);
}

export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataset {
  ticker: string;
  timeframe: 'daily' | 'hourly' | 'weekly';
  startDate: string;
  endDate: string;
  bars: OHLCVBar[];
  missingValues: number;
  schema: DatasetSchema;
}

export interface DatasetSchema {
  hasDate: boolean;
  hasOpen: boolean;
  hasHigh: boolean;
  hasLow: boolean;
  hasClose: boolean;
  hasVolume: boolean;
  rowCount: number;
  columnCount: number;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  row?: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PreprocessingConfig {
  windowSize: number;
  fractionalDiffOrder: number;
  normalizationMethod: 'minmax' | 'zscore' | 'robust';
  outlierMethod: 'iqr' | 'zscore' | 'none';
  outlierThreshold: number;
}

export type ChartPattern =
  | 'Hammer'
  | 'Doji'
  | 'Bullish Engulfing'
  | 'Bearish Engulfing'
  | 'Head and Shoulders'
  | 'Double Bottom'
  | 'Double Top'
  | 'Morning Star'
  | 'Evening Star';

export interface GeneratedImage {
  id: string;
  type: 'candlestick' | 'gasf' | 'gadf';
  windowIndex: number;
  startDate: string;
  endDate: string;
  url: string;
  thumbnailUrl: string;
  detectedPatterns: ChartPattern[];
  resolution: number;
}

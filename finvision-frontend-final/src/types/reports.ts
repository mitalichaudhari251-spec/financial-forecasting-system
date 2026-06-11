import type { ForecastResult } from './forecast';
import type { BacktestMetrics } from './analytics';

export interface ReportData {
  id: string;
  title: string;
  asset: string;
  forecastDate: string;
  modelVersion: string;
  analystNotes?: string;
  forecast: ForecastResult;
  backtestMetrics: BacktestMetrics;
  candlestickImageUrl?: string;
  gafImageUrl?: string;
  gradCamImageUrl?: string;
  marketInterpretation: string;
  explainabilityText: string;
  createdAt: string;
  createdBy: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  sections: string[];
  format: 'standard' | 'executive' | 'technical' | 'compliance';
}

import type { ForecastResult } from '../types';
import { listForecasts } from './forecast-store.service';

export interface Report {
  id: string;
  title: string;
  ticker: string;
  direction: string;
  confidence: number;
  createdAt: string;
  status: 'ready' | 'generating';
  type: 'forecast' | 'backtest' | 'risk';
}

const reports = new Map<string, Report & { userId: string; forecastId?: string }>();

export function listReports(userId: string): Report[] {
  const stored = Array.from(reports.values()).filter((r) => r.userId === userId);
  if (stored.length > 0) {
    return stored.map(({ userId: _u, forecastId: _f, ...r }) => r);
  }

  return listForecasts(userId, 10).map((f) => ({
    id: `rpt-${f.id}`,
    title: `${f.ticker} Forecast Report`,
    ticker: f.ticker,
    direction: f.direction,
    confidence: f.confidence,
    createdAt: f.created_at,
    status: 'ready' as const,
    type: 'forecast' as const,
  }));
}

export function generateReport(userId: string, forecastId: string): Report {
  const forecasts = listForecasts(userId, 100);
  const f = forecasts.find((x) => x.id === forecastId) ?? forecasts[0];
  const report: Report & { userId: string; forecastId: string } = {
    id: `rpt-${Date.now()}`,
    title: `${f?.ticker ?? 'MARKET'} Analysis Report`,
    ticker: f?.ticker ?? 'AAPL',
    direction: f?.direction ?? 'neutral',
    confidence: f?.confidence ?? 0,
    createdAt: new Date().toISOString(),
    status: 'ready',
    type: 'forecast',
    userId,
    forecastId: f?.id ?? forecastId,
  };
  reports.set(report.id, report);
  return report;
}

export function getReport(id: string, userId: string): (Report & { forecast?: ForecastResult }) | undefined {
  const r = reports.get(id);
  if (r && r.userId === userId) {
    const { userId: _u, forecastId, ...rest } = r;
    const forecast = forecastId
      ? listForecasts(userId, 100).find((f) => f.id === forecastId)
      : undefined;
    return { ...rest, forecast };
  }
  const fromForecast = listReports(userId).find((x) => x.id === id);
  if (!fromForecast) return undefined;
  const fcId = fromForecast.id.replace('rpt-', '');
  const forecast = listForecasts(userId, 100).find((f) => f.id === fcId || `rpt-${f.id}` === id);
  return { ...fromForecast, forecast };
}

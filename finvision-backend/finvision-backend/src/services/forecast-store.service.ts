import type { ForecastResult } from '../types';

const forecasts = new Map<string, ForecastResult & { userId: string }>();

export function saveForecast(userId: string, result: ForecastResult): void {
  forecasts.set(result.id, { ...result, userId });
}

export function getForecast(id: string, userId?: string): ForecastResult | undefined {
  const f = forecasts.get(id);
  if (!f) return undefined;
  if (userId && f.userId !== userId) return undefined;
  const { userId: _u, ...rest } = f;
  return rest;
}

export function listForecasts(userId: string, limit = 50): ForecastResult[] {
  return Array.from(forecasts.values())
    .filter((f) => f.userId === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map(({ userId: _u, ...rest }) => rest);
}

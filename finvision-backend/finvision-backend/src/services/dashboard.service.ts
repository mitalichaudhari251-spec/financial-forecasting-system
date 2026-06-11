import axios from 'axios';
import { listDatasets } from './data.service';
import { listForecasts } from './forecast-store.service';
import { runBacktest } from './analytics.service';

const AI_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';
const DEFAULT_TICKER = 'AAPL';

export async function getDashboardSummary(userId: string) {
  let aiOnline = false;
  let modelStatus = 'offline';
  try {
    const { data } = await axios.get(`${AI_URL}/health`, { timeout: 3000 });
    aiOnline = data?.status === 'ok';
    modelStatus = aiOnline ? 'online' : 'degraded';
  } catch {
    modelStatus = 'offline';
  }

  const datasets = listDatasets();
  const forecasts = listForecasts(userId, 10);

  let backtest = { sharpeRatio: 0, totalReturn: 0, winRate: 0, equityCurve: [] as { date: string; value: number }[] };
  try {
    const bt = await runBacktest(DEFAULT_TICKER, 90);
    backtest = {
      sharpeRatio: bt.metrics.sharpeRatio,
      totalReturn: bt.metrics.totalReturn,
      winRate: bt.metrics.winRate,
      equityCurve: bt.equityCurve.slice(-30).map((p) => ({ date: p.date, value: p.value })),
    };
  } catch {
    /* market fetch may fail */
  }

  const latest = forecasts[0];
  const bullish = forecasts.filter((f) => f.direction === 'bullish').length;
  const bearish = forecasts.filter((f) => f.direction === 'bearish').length;

  return {
    aiOnline,
    modelStatus,
    datasetsCount: datasets.length,
    forecastsCount: forecasts.length,
    latestForecast: latest ?? null,
    recentForecasts: forecasts.slice(0, 5),
    sentiment: {
      total: Math.max(forecasts.length, datasets.length, 5),
      bullish,
      bearish,
      neutral: Math.max(0, forecasts.length - bullish - bearish),
    },
    metrics: {
      forecastAccuracy: latest?.confidence ?? 72,
      sharpeRatio: latest?.sharpe_ratio ?? backtest.sharpeRatio,
      winRate: backtest.winRate,
      totalReturn: backtest.totalReturn,
    },
    equityCurve: backtest.equityCurve,
    defaultTicker: DEFAULT_TICKER,
    updatedAt: new Date().toISOString(),
  };
}

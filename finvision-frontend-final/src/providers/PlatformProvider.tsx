'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { platformService, type DashboardSummary, type DatasetItem } from '@/services/platform.service';
import type { ForecastCase, ForecastResult } from '@/types/forecast';
import { fetchYahooOHLCV, type OHLCVRow } from '@/lib/yahoo';
import { runFullForecast, checkBackendHealth } from '@/lib/finvision-api';

const POLL_MS = 60000;
const DEFAULT_TICKER = 'AAPL';

interface PlatformContextValue {
  ticker: string;
  setTicker: (t: string) => void;
  dashboard: DashboardSummary | null;
  datasets: DatasetItem[];
  forecastHistory: ForecastCase[];
  reports: unknown[];
  training: unknown | null;
  marketBars: OHLCVRow[];
  lastForecast: ForecastResult | null;
  setLastForecast: (f: ForecastResult | null) => void;
  aiOnline: boolean;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  runForecast: (symbol?: string, algo?: 'PPO' | 'DQN') => Promise<ForecastResult | null>;
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string | null) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [ticker, setTicker] = useState(DEFAULT_TICKER);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [forecastHistory, setForecastHistory] = useState<ForecastCase[]>([]);
  const [reports, setReports] = useState<unknown[]>([]);
  const [training, setTraining] = useState<unknown | null>(null);
  const [marketBars, setMarketBars] = useState<OHLCVRow[]>([]);
  const [lastForecast, setLastForecast] = useState<ForecastResult | null>(null);
  const [aiOnline, setAiOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [dash, ds, history, rpts, train, healthy] = await Promise.all([
        platformService.getDashboard().catch(() => null),
        platformService.getDatasets().catch(() => []),
        platformService.getForecastHistory().catch(() => []),
        platformService.getReports().catch(() => []),
        platformService.getTrainingStatus().catch(() => null),
        checkBackendHealth(),
      ]);

      if (dash) setDashboard(dash);
      setDatasets(ds);
      setForecastHistory(history);
      setReports(rpts);
      setTraining(train);
      setAiOnline(healthy);

      if (!activeDatasetId && ds[0]?.id) setActiveDatasetId(ds[0].id);

      const sym = ticker || dash?.defaultTicker || DEFAULT_TICKER;
      const bars = await fetchYahooOHLCV(sym, 180).catch(() => []);
      if (bars.length) setMarketBars(bars);

      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [ticker, activeDatasetId]);

  const runForecast = useCallback(
    async (symbol?: string, algo: 'PPO' | 'DQN' = 'PPO') => {
      const sym = (symbol || ticker).toUpperCase();
      let lastError = `Forecast failed for ${sym}`;

      try {
        const rows = await fetchYahooOHLCV(sym, 365);
        const result = await runFullForecast(sym, rows, algo);
        setLastForecast(result);
        setTicker(sym);
        setMarketBars(rows.slice(-180));

        try {
          await platformService.runForecast(sym, algo);
        } catch {
          /* optional persistence */
        }

        await refresh();
        return result;
      } catch (err: unknown) {
        const ax = err as { response?: { data?: { error?: string } }; message?: string };
        lastError = ax.response?.data?.error || (err instanceof Error ? err.message : lastError);
      }

      try {
        const result = await platformService.runForecast(sym, algo);
        setLastForecast(result);
        setTicker(sym);
        await refresh();
        return result;
      } catch (err: unknown) {
        const ax = err as { response?: { data?: { error?: string } }; message?: string };
        const backendMsg = ax.response?.data?.error || (err instanceof Error ? err.message : lastError);
        throw new Error(backendMsg || lastError);
      }
    },
    [ticker, refresh]
  );

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({
      ticker,
      setTicker,
      dashboard,
      datasets,
      forecastHistory,
      reports,
      training,
      marketBars,
      lastForecast,
      setLastForecast,
      aiOnline,
      loading,
      lastUpdated,
      refresh,
      runForecast,
      activeDatasetId,
      setActiveDatasetId,
    }),
    [
      ticker,
      dashboard,
      datasets,
      forecastHistory,
      reports,
      training,
      marketBars,
      lastForecast,
      aiOnline,
      loading,
      lastUpdated,
      refresh,
      runForecast,
      activeDatasetId,
    ]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
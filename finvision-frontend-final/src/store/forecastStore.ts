import { create } from 'zustand';
import type { ForecastResult, ForecastCase, ForecastFilters, ForecastHorizon } from '@/types/forecast';

interface ForecastState {
  currentForecast: ForecastResult | null;
  history: ForecastCase[];
  filters: ForecastFilters;
  selectedHorizon: ForecastHorizon;
  isRunning: boolean;
  error: string | null;
  setCurrentForecast: (f: ForecastResult | null) => void;
  setHistory: (h: ForecastCase[]) => void;
  addToHistory: (c: ForecastCase) => void;
  setFilters: (f: Partial<ForecastFilters>) => void;
  setSelectedHorizon: (h: ForecastHorizon) => void;
  setRunning: (r: boolean) => void;
  setError: (e: string | null) => void;
}

export const useForecastStore = create<ForecastState>((set) => ({
  currentForecast: null,
  history: [],
  filters: {},
  selectedHorizon: '1d',
  isRunning: false,
  error: null,
  setCurrentForecast: (currentForecast) => set({ currentForecast }),
  setHistory: (history) => set({ history }),
  addToHistory: (c) => set((s) => ({ history: [c, ...s.history] })),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setSelectedHorizon: (selectedHorizon) => set({ selectedHorizon }),
  setRunning: (isRunning) => set({ isRunning }),
  setError: (error) => set({ error }),
}));

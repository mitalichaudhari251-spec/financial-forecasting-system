import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '@/types/user';

const DEFAULT_PREFS: UserPreferences = {
  theme: 'light',
  defaultTimeframe: 'daily',
  defaultHorizon: '1d',
  confidenceThreshold: 70,
  enableNotifications: true,
  enable3D: true,
  defaultRLAlgorithm: 'PPO',
  timezone: 'UTC',
};

interface SettingsState {
  preferences: UserPreferences;
  sidebarCollapsed: boolean;
  setPreferences: (p: Partial<UserPreferences>) => void;
  setSidebarCollapsed: (c: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFS,
      sidebarCollapsed: false,
      setPreferences: (p) => set((s) => ({ preferences: { ...s.preferences, ...p } })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    { name: 'fv-settings' }
  )
);

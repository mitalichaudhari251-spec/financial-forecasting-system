'use client';

import { useSettingsStore } from '@/store/settingsStore';

export function useTheme() {
  const { preferences, setPreferences } = useSettingsStore();

  const toggleTheme = () => {
    setPreferences({ theme: preferences.theme === 'light' ? 'dark' : 'light' });
  };

  return { theme: preferences.theme, toggleTheme };
}

import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@doket_theme_mode';

export const lightColors = {
  primary: '#FF6B35',
  primaryDark: '#AB3500',
  secondary: '#004E89',
  secondaryLight: '#24619D',
  background: '#FFF8F6',
  surface: '#FFFFFF',
  surfaceVariant: '#FFE9E3',
  onSurface: '#261814',
  onSurfaceVariant: '#594139',
  outline: '#8D7168',
  outlineVariant: '#E1BFB5',
  success: '#00677E',
  successLight: '#00A7CB',
  error: '#BA1A1A',
  pending: '#FF6B35',
  paid: '#00677E',
  draft: '#8D7168',
};

export const darkColors = {
  primary: '#FF6B35',
  primaryDark: '#FFB59D',
  secondary: '#87BCFE',
  secondaryLight: '#A1C9FF',
  background: '#0E141A',
  surface: '#1A2027',
  surfaceVariant: '#252B31',
  onSurface: '#DDE3EC',
  onSurfaceVariant: '#A0AEC0',
  outline: '#A98A80',
  outlineVariant: '#2F353C',
  success: '#59D5FB',
  successLight: '#59D5FB',
  error: '#FFB4AB',
  pending: '#FF6B35',
  paid: '#59D5FB',
  draft: '#A98A80',
};

function resolveColors(mode) {
  if (mode === 'dark') return darkColors;
  if (mode === 'light') return lightColors;
  // system
  return Appearance.getColorScheme() === 'dark' ? darkColors : lightColors;
}

function resolveIsDark(mode) {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return Appearance.getColorScheme() === 'dark';
}

const useThemeStore = create((set, get) => ({
  themeMode: 'system', // 'light' | 'dark' | 'system'
  isDark: resolveIsDark('system'),
  colors: resolveColors('system'),

  // Load persisted mode from storage — call once on app start
  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const mode = saved ?? 'system';
      set({ themeMode: mode, isDark: resolveIsDark(mode), colors: resolveColors(mode) });
    } catch (_) {
      // fallback silently
    }
  },

  // Set mode explicitly: 'light' | 'dark' | 'system'
  setThemeMode: async (mode) => {
    set({ themeMode: mode, isDark: resolveIsDark(mode), colors: resolveColors(mode) });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {}
  },

  // Legacy toggle kept for compatibility — cycles light → dark → system
  toggleDark: () => {
    const current = get().themeMode;
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    get().setThemeMode(next);
  },

  // Called when OS appearance changes (only relevant in system mode)
  handleSystemChange: () => {
    if (get().themeMode === 'system') {
      set({ isDark: resolveIsDark('system'), colors: resolveColors('system') });
    }
  },
}));

export default useThemeStore;

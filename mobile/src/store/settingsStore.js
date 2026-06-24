import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY, getCurrencyByCode } from '../utils/currencies';

const STORAGE_KEY = '@doket_settings';

const useSettingsStore = create((set, get) => ({
  currency: DEFAULT_CURRENCY,       // full currency object
  taxPresets: DEFAULT_CURRENCY.taxPresets,
  activeTaxIndex: 1,                // index into taxPresets (0 = no tax by default)

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const currency = getCurrencyByCode(saved.currencyCode ?? 'KES');
      set({
        currency,
        taxPresets: saved.taxPresets ?? currency.taxPresets,
        activeTaxIndex: saved.activeTaxIndex ?? 1,
      });
    } catch (_) {}
  },

  setCurrency: async (currencyObj) => {
    const next = {
      currency: currencyObj,
      taxPresets: currencyObj.taxPresets,
      activeTaxIndex: 0,
    };
    set(next);
    await get()._persist();
  },

  setActiveTaxIndex: async (index) => {
    set({ activeTaxIndex: index });
    await get()._persist();
  },

  setTaxPresets: async (presets) => {
    set({ taxPresets: presets });
    await get()._persist();
  },

  _persist: async () => {
    try {
      const { currency, taxPresets, activeTaxIndex } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        currencyCode: currency.code,
        taxPresets,
        activeTaxIndex,
      }));
    } catch (_) {}
  },
}));

export default useSettingsStore;

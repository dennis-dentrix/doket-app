import useSettingsStore from '../store/settingsStore';
import { formatAmount as _fmt } from '../utils/currencies';

export default function useCurrency() {
  const { currency, taxPresets, activeTaxIndex, setCurrency, setActiveTaxIndex } = useSettingsStore();

  return {
    currency,
    symbol: currency.symbol,
    taxPresets,
    activeTax: taxPresets[activeTaxIndex] ?? 0,
    activeTaxIndex,
    setCurrency,
    setActiveTaxIndex,
    /** Format a raw number → display string, e.g. "KES 1,234.00" or "$1,234.00" */
    fmt: (amount) => _fmt(amount, currency),
    /** Just the number portion, no symbol */
    fmtNumber: (amount) => {
      const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
      try {
        return new Intl.NumberFormat(currency.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(isNaN(num) ? 0 : num);
      } catch {
        return (isNaN(num) ? 0 : num).toFixed(2);
      }
    },
  };
}

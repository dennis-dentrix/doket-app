/**
 * Supported currencies. Each entry includes:
 *   code       — ISO 4217 code
 *   symbol     — Short symbol shown in UI (before amounts)
 *   name       — Full name
 *   locale     — BCP-47 locale for Intl.NumberFormat
 *   dialCode   — Default country dialing code
 *   taxPresets — Common VAT/GST/sales-tax percentages for that region
 *   paymentMethod — 'mpesa' | 'generic' (controls payment CTA wording)
 */
export const CURRENCIES = [
  // ── Africa ──────────────────────────────────────────────────────────────
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling',      locale: 'en-KE', dialCode: '+254', taxPresets: [0, 16],    paymentMethod: 'mpesa' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira',        locale: 'en-NG', dialCode: '+234', taxPresets: [0, 7.5],   paymentMethod: 'generic' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand',    locale: 'en-ZA', dialCode: '+27',  taxPresets: [0, 15],    paymentMethod: 'generic' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi',         locale: 'en-GH', dialCode: '+233', taxPresets: [0, 15],    paymentMethod: 'generic' },
  { code: 'UGX', symbol: 'UGX', name: 'Ugandan Shilling',      locale: 'en-UG', dialCode: '+256', taxPresets: [0, 18],    paymentMethod: 'generic' },
  { code: 'TZS', symbol: 'TZS', name: 'Tanzanian Shilling',    locale: 'en-TZ', dialCode: '+255', taxPresets: [0, 18],    paymentMethod: 'generic' },
  { code: 'ETB', symbol: 'ETB', name: 'Ethiopian Birr',         locale: 'en-ET', dialCode: '+251', taxPresets: [0, 15],    paymentMethod: 'generic' },
  { code: 'EGP', symbol: 'E£',  name: 'Egyptian Pound',         locale: 'ar-EG', dialCode: '+20',  taxPresets: [0, 14],    paymentMethod: 'generic' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham',        locale: 'fr-MA', dialCode: '+212', taxPresets: [0, 20],    paymentMethod: 'generic' },
  { code: 'RWF', symbol: 'RWF', name: 'Rwandan Franc',          locale: 'en-RW', dialCode: '+250', taxPresets: [0, 18],    paymentMethod: 'generic' },
  // ── Americas ────────────────────────────────────────────────────────────
  { code: 'USD', symbol: '$',   name: 'US Dollar',              locale: 'en-US', dialCode: '+1',   taxPresets: [0, 8, 10], paymentMethod: 'generic' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar',         locale: 'en-CA', dialCode: '+1',   taxPresets: [0, 5, 13], paymentMethod: 'generic' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso',            locale: 'es-MX', dialCode: '+52',  taxPresets: [0, 16],    paymentMethod: 'generic' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real',          locale: 'pt-BR', dialCode: '+55',  taxPresets: [0, 12, 17],paymentMethod: 'generic' },
  { code: 'COP', symbol: 'COP', name: 'Colombian Peso',          locale: 'es-CO', dialCode: '+57',  taxPresets: [0, 19],    paymentMethod: 'generic' },
  // ── Europe ──────────────────────────────────────────────────────────────
  { code: 'EUR', symbol: '€',   name: 'Euro',                   locale: 'de-DE', dialCode: '+49',  taxPresets: [0, 7, 19], paymentMethod: 'generic' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',           locale: 'en-GB', dialCode: '+44',  taxPresets: [0, 5, 20], paymentMethod: 'generic' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc',             locale: 'de-CH', dialCode: '+41',  taxPresets: [0, 2.5, 7.7], paymentMethod: 'generic' },
  { code: 'SEK', symbol: 'kr',  name: 'Swedish Krona',           locale: 'sv-SE', dialCode: '+46',  taxPresets: [0, 6, 25], paymentMethod: 'generic' },
  { code: 'PLN', symbol: 'zł',  name: 'Polish Złoty',            locale: 'pl-PL', dialCode: '+48',  taxPresets: [0, 8, 23], paymentMethod: 'generic' },
  // ── Middle East ─────────────────────────────────────────────────────────
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',              locale: 'ar-AE', dialCode: '+971', taxPresets: [0, 5],     paymentMethod: 'generic' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal',             locale: 'ar-SA', dialCode: '+966', taxPresets: [0, 15],    paymentMethod: 'generic' },
  // ── Asia Pacific ────────────────────────────────────────────────────────
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',            locale: 'en-IN', dialCode: '+91',  taxPresets: [0, 5, 12, 18], paymentMethod: 'generic' },
  { code: 'PHP', symbol: '₱',   name: 'Philippine Peso',         locale: 'en-PH', dialCode: '+63',  taxPresets: [0, 12],    paymentMethod: 'generic' },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah',       locale: 'id-ID', dialCode: '+62',  taxPresets: [0, 11],    paymentMethod: 'generic' },
  { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit',       locale: 'ms-MY', dialCode: '+60',  taxPresets: [0, 6],     paymentMethod: 'generic' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',        locale: 'en-SG', dialCode: '+65',  taxPresets: [0, 9],     paymentMethod: 'generic' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',       locale: 'en-AU', dialCode: '+61',  taxPresets: [0, 10],    paymentMethod: 'generic' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar',      locale: 'en-NZ', dialCode: '+64',  taxPresets: [0, 15],    paymentMethod: 'generic' },
  { code: 'PKR', symbol: '₨',   name: 'Pakistani Rupee',         locale: 'en-PK', dialCode: '+92',  taxPresets: [0, 17],    paymentMethod: 'generic' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // KES

export function getCurrencyByCode(code) {
  return CURRENCIES.find(c => c.code === code) ?? DEFAULT_CURRENCY;
}

/** Format a number as a currency amount string, e.g. "KES 1,234.00" */
export function formatAmount(amount, currency) {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return `${currency.symbol} 0.00`;

  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

    // For currencies that use a separate code (KES, NGN with ₦, etc.)
    return currency.symbol.length > 2
      ? `${currency.symbol} ${formatted}`
      : `${currency.symbol}${formatted}`;
  } catch {
    return `${currency.symbol} ${num.toFixed(2)}`;
  }
}

export type Rates = Record<string, number>;
export interface PricedProduct {
  price_usd?: number | null;
  price_pkr?: number | null;
  prices?: { price_pkr: number }[];
  pricing?: { price_global_base_usd?: number };
}
export const COUNTRY_CURRENCY: Record<string, string> = {
  PK:'PKR', US:'USD', GB:'GBP', AE:'AED', SA:'SAR', IN:'INR', BD:'BDT', LK:'LKR', NP:'NPR',
  CA:'CAD', AU:'AUD', NZ:'NZD', CN:'CNY', JP:'JPY', KR:'KRW', SG:'SGD', MY:'MYR', ID:'IDR',
  TH:'THB', PH:'PHP', VN:'VND', HK:'HKD', TW:'TWD', QA:'QAR', KW:'KWD', BH:'BHD', OM:'OMR',
  TR:'TRY', ZA:'ZAR', EG:'EGP', NG:'NGN', KE:'KES', MA:'MAD', BR:'BRL', MX:'MXN', AR:'ARS',
  CL:'CLP', CO:'COP', PE:'PEN', CH:'CHF', SE:'SEK', NO:'NOK', DK:'DKK', PL:'PLN', CZ:'CZK',
  HU:'HUF', RO:'RON', UA:'UAH', IL:'ILS', JO:'JOD', IQ:'IQD', AF:'AFN', MV:'MVR', MU:'MUR',
  DE:'EUR', FR:'EUR', IT:'EUR', ES:'EUR', PT:'EUR', IE:'EUR', NL:'EUR', BE:'EUR', AT:'EUR',
  FI:'EUR', GR:'EUR', CY:'EUR', MT:'EUR', LU:'EUR', EE:'EUR', LV:'EUR', LT:'EUR', SK:'EUR',
  SI:'EUR', HR:'EUR', BG:'EUR', IS:'ISK', GE:'GEL', AM:'AMD', AZ:'AZN', UZ:'UZS', KZ:'KZT',
};
export const SUPPORTED_CURRENCIES = [...new Set(['USD', 'PKR', ...Object.values(COUNTRY_CURRENCY)])].sort();
export function validCurrency(value: unknown): value is string {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value);
}
export function countryCurrency(country: string | null) {
  return COUNTRY_CURRENCY[country?.toUpperCase() || ''] || 'USD';
}
export function normalizeCountry(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const country = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) && country !== 'XX' && country !== 'ZZ' ? country : null;
}
export function convert(amount: number, from: string, to: string, rates: Rates): number | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (from === to) return amount;
  if (!(rates[from] > 0) || !(rates[to] > 0)) return null;
  const result = amount / rates[from] * rates[to];
  return Number.isFinite(result) ? result : null;
}
export function formatMoney(amount: number, currency: string) {
  // Explicit precision keeps server and browser output identical across ICU versions.
  const digits = ['USD', 'PKR', 'JPY', 'KRW', 'VND', 'CLP', 'ISK'].includes(currency) ? 0 : ['KWD', 'BHD', 'OMR', 'JOD', 'IQD'].includes(currency) ? 3 : 2;
  return new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
}
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
export function resolvePrice(product: PricedProduct, currency: string, rates: Rates) {
  const offers = (product.prices || []).map(p => p.price_pkr).filter(positive);
  const local = positive(product.price_pkr) ? product.price_pkr : offers.length ? Math.min(...offers) : null;
  const usd = positive(product.price_usd) ? product.price_usd : positive(product.pricing?.price_global_base_usd) ? product.pricing!.price_global_base_usd! : null;
  const sourceCurrency = currency === 'PKR' && local !== null ? 'PKR' : usd !== null ? 'USD' : 'PKR';
  const original = sourceCurrency === 'USD' ? usd : local;
  if (original === null) return null;
  const converted = convert(original, sourceCurrency, currency, rates);
  return { amount: converted ?? original, currency: converted === null ? sourceCurrency : currency, estimated: converted !== null && sourceCurrency !== currency, original, sourceCurrency };
}

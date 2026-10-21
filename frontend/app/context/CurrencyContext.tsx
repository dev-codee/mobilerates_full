'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { convert, countryCurrency, formatMoney, normalizeCountry, validCurrency, type Rates } from '@/app/lib/currency';

type State = { currency: string; rates: Rates; updatedAt: string | null; stale: boolean; automatic: boolean; ready: boolean };
const initial: State = { currency: 'USD', rates: { USD: 1 }, updatedAt: null, stale: true, automatic: true, ready: false };
const CurrencyContext = createContext({ ...initial, selectCurrency: (_currency: string) => { void _currency; }, format: (amount: number, from = 'PKR') => formatMoney(amount, from), convertAmount: (amount: number, from: string, to: string): number | null => from === to ? amount : null });
function cookie(name: string, value: string, age = 31536000) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${age}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const router = useRouter();
  const requestVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const response = await fetch('/currency-context', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Currency unavailable');
      const data = await response.json();
      if (version !== requestVersion.current || !validCurrency(data.currency)) return;
      // Some deployments (including a plain nginx proxy) provide no country
      // header. Look up the browser's IP, not the application server's IP.
      // Only the country is retained, and a manual currency always wins.
      if (data.automatic && !normalizeCountry(data.country)) {
        try {
          const locationResponse = await fetch('https://api.country.is/', {
            credentials: 'omit', referrerPolicy: 'no-referrer',
            signal: AbortSignal.timeout(4000),
          });
          if (locationResponse.ok) {
            const country = normalizeCountry((await locationResponse.json()).country);
            if (country && version === requestVersion.current) {
              data.country = country;
              data.currency = countryCurrency(country);
              cookie('detected_country', country, 3600);
            }
          }
        } catch { /* Keep USD and the manual selector if IP lookup is unavailable. */ }
      }
      if (version !== requestVersion.current) return;
      setState({ ...data, ready: true });
      const previous = document.cookie.split('; ').find(c => c.startsWith('display_currency='))?.split('=')[1];
      cookie('display_currency', data.currency);
      if (previous !== data.currency) router.refresh();
    } catch { if (version === requestVersion.current) setState(s => ({ ...s, ready: true, stale: true })); }
  }, [router]);
  // load updates state only after the asynchronous fetch resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 60 * 60 * 1000); return () => clearInterval(timer); }, [load]);
  const selectCurrency = (currency: string) => {
    if (currency === 'auto') { cookie('currency_preference', '', 0); void load(); return; }
    if (!validCurrency(currency)) return;
    requestVersion.current++;
    cookie('currency_preference', currency);
    cookie('display_currency', currency);
    setState(s => ({ ...s, currency, automatic: false }));
    // A choice made during IP detection cancels that request; still finish
    // loading its rates through a new request using the saved preference.
    if (!state.ready) void load();
    router.refresh();
  };
  const format = (amount: number, from = 'PKR') => {
    const converted = convert(amount, from, state.currency, state.rates);
    return formatMoney(converted ?? amount, converted === null ? from : state.currency);
  };
  return <CurrencyContext.Provider value={{ ...state, selectCurrency, format, convertAmount: (amount, from, to) => convert(amount, from, to, state.rates) }}>{children}</CurrencyContext.Provider>;
}
export const useCurrency = () => useContext(CurrencyContext);

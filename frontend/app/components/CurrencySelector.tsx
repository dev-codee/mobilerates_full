'use client';
import { useCurrency } from '@/app/context/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/app/lib/currency';
export default function CurrencySelector() {
  const { currency, automatic, selectCurrency, rates, ready } = useCurrency();
  return <div className="border-t border-border-subtle bg-surface-container-low/50 px-4 py-1.5 text-xs">
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <label className="flex items-center gap-2 font-medium">
        <span className="sr-only">Local currency</span>
        <select aria-label="Local currency" data-currency-ready={ready} value={automatic ? 'auto' : currency} onChange={e => selectCurrency(e.target.value)} className="rounded border border-border-subtle bg-white px-2 py-1 text-text-main">
          <option value="auto">Auto ({currency})</option>
          {SUPPORTED_CURRENCIES.map(code => <option key={code} value={code} disabled={code !== 'PKR' && code !== 'USD' && !rates[code]}>{code}</option>)}
        </select>
      </label>
    </div>
  </div>;
}

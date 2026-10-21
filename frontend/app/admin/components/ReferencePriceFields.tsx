'use client';
export default function ReferencePriceFields({ value, source, onPrice, onSource }: { value: string | number; source: string; onPrice: (value: string) => void; onSource: (value: string) => void }) {
  return <>
    <label className="block text-xs font-semibold text-gray-700">Global reference price (USD)
      <input type="number" min="0" step="0.01" value={value ?? ''} onChange={e => onPrice(e.target.value)} placeholder="e.g. 499.99" className="mt-1 w-full rounded-md border px-3 py-2 text-xs" />
      <span className="mt-1 block font-normal text-gray-500">Enter a sourced USD price. Keep verified Pakistan prices in the PKR fields.</span>
    </label>
    <label className="block text-xs font-semibold text-gray-700">USD price source
      <input type="text" maxLength={1000} value={source ?? ''} onChange={e => onSource(e.target.value)} placeholder="Manufacturer or retailer source URL" className="mt-1 w-full rounded-md border px-3 py-2 text-xs" />
    </label>
  </>;
}

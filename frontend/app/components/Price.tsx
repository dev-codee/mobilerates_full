'use client';
import { useCurrency } from '@/app/context/CurrencyContext';
import { convert, formatMoney, resolvePrice, type PricedProduct } from '@/app/lib/currency';

export default function Price({ product, amount, source = 'PKR', estimate = true }: { product?: PricedProduct; amount?: number | null; source?: string; estimate?: boolean }) {
  const { currency, rates, updatedAt } = useCurrency();
  const amountPrice = (target: string) => {
    if (amount == null || !Number.isFinite(amount) || amount < 0) return null;
    const converted = convert(amount, source, target, rates);
    return { amount: converted ?? amount, currency: converted === null ? source : target, estimated: converted !== null && source !== target, original: amount, sourceCurrency: source };
  };
  // Budget labels describe the selected local-currency threshold only.
  if (!estimate && !product) {
    const price = amountPrice(currency);
    return price ? <span>{formatMoney(price.amount, price.currency)}</span> : <>Price TBA</>;
  }
  const primary = product ? resolvePrice(product, 'USD', rates) : amountPrice('USD');
  const secondary = product ? resolvePrice(product, currency, rates) : amountPrice(currency);
  if (!primary) return <>Price TBA</>;
  const title = (price: NonNullable<typeof primary>) => price.estimated
    ? `Converted estimate from ${formatMoney(price.original, price.sourceCurrency)}${updatedAt ? `; rate dated ${updatedAt.slice(0, 10)}` : ''}. Local retail prices may differ.`
    : undefined;
  const showSecondary = secondary && secondary.currency !== primary.currency;
  return <span className="inline-flex flex-col align-top leading-snug" data-price-currency={primary.currency}>
    <span title={title(primary)}>{primary.estimated && <><span aria-label="Approximately" className="inline-block align-[0.12em] text-[length:min(0.65em,14px)] font-normal">≈</span>{' '}</>}{formatMoney(primary.amount, primary.currency)}</span>
    {showSecondary && <span className="text-[0.75em] font-medium opacity-80" title={title(secondary)}>{secondary.estimated && <><span aria-label="Approximately" className="inline-block align-[0.12em] text-[length:min(0.65em,14px)] font-normal">≈</span>{' '}</>}{formatMoney(secondary.amount, secondary.currency)}</span>}
  </span>;
}

// Existing budget URLs keep their canonical PKR-equivalent amounts.
export function CurrencyText({ text }: { text: string }) {
  return <>{text.split(/(Rs\.\s*[\d,]+(?:\.\d+)?)/g).map((part, index) => /^Rs\./.test(part)
    ? <Price key={index} amount={Number(part.replace(/^Rs\.\s*/, '').replace(/,/g, ''))} estimate={false} />
    : part)}</>;
}

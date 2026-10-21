import type { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/app/lib/api';
import { countryCurrency, normalizeCountry, validCurrency } from '@/app/lib/currency';

export async function GET(request: NextRequest) {
  // Only configure a header that your ingress overwrites, and prevent direct
  // access to the origin. IP location is a preference, never authorization.
  const header = process.env.GEOIP_COUNTRY_HEADER || (process.env.VERCEL ? 'x-vercel-ip-country' : 'cf-ipcountry');
  const country = normalizeCountry(request.headers.get(header))
    || normalizeCountry(request.cookies.get('detected_country')?.value);
  const saved = request.cookies.get('currency_preference')?.value;
  const currency = validCurrency(saved) ? saved : countryCurrency(country);
  let snapshot = { rates: { USD: 1 } as Record<string, number>, updatedAt: null as string | null, stale: true };
  try {
    const response = await fetch(`${getApiBaseUrl()}/currency/rates`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const { data } = await response.json();
      if (data?.rates?.USD === 1) snapshot = data;
    }
  } catch { /* Original currency remains visible if conversion is unavailable. */ }
  return Response.json({ ...snapshot, currency, country, automatic: !validCurrency(saved) }, {
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Robots-Tag': 'noindex' },
  });
}

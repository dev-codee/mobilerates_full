export type ListingParams = Record<string, string | string[] | undefined>;

// Keep pagination discoverable. Filter/sort combinations are crawlable so
// search engines can read noindex, but are excluded from the sitemap.
export function listingIndexing(path: string, params: ListingParams, brandPath = false) {
  const query = new URLSearchParams();
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value !== undefined && value !== '') query.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  const rawPage = query.get('page');
  const validPage = isValidListingPage(params);
  const page = validPage ? Number(rawPage || 1) : 1;
  if (page === 1) query.delete('page');
  if (brandPath) query.delete('brand');
  const filtered = [...query.keys()].some(key => key !== 'page');
  const suffix = query.toString();
  return {
    canonical: `https://mobilerates.info${path}${suffix ? `?${suffix}` : ''}`,
    robots: { index: validPage && !filtered, follow: true },
  };
}

export function isValidListingPage(params: ListingParams, totalPages?: number): boolean {
  const raw = params.page;
  if (raw === undefined) return true;
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return false;
  const page = Number(raw);
  return Number.isSafeInteger(page) && (totalPages === undefined || page <= Math.max(1, totalPages));
}

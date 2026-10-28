/** Only these fields are needed to search and select a comparison candidate. */
export interface ComparisonOption {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  imageUrl?: string;
}

export function toComparisonOption(product: {
  _id: string;
  slug: string;
  name: string;
  brand_slug?: string;
  images?: { url: string }[];
}): ComparisonOption {
  return {
    _id: product._id,
    slug: product.slug,
    name: product.name,
    brand_slug: product.brand_slug || "",
    imageUrl: product.images?.[0]?.url,
  };
}

// Selection navigates to the server route, which fetches full selected records.
// Never replace a displayed product's full specs/pricing with a selector option.
export function comparisonHref(kind: "phone" | "vehicle", slots: ({ slug: string } | null)[]) {
  const active = slots.filter((item): item is { slug: string } => item !== null);
  const base = kind === "phone" ? "/compare" : "/vehicles/compare";
  if (active.length === 2) return `${base}/${active[0].slug}-vs-${active[1].slug}`;
  const params = new URLSearchParams();
  active.forEach((item) => params.append(kind, item.slug));
  return `${base}?${params.toString()}`;
}

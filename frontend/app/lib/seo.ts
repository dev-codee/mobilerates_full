import type { Metadata } from "next";

// Clean previously saved market-targeted SEO copy as well as new defaults.
export function withoutRegionalTargeting(text: string): string {
  return text
    .replace(/\b(?:(?:in|across|throughout|within|for)\s+)?(?:pakistan|karachi|lahore|islamabad)(?:['’]s)?\b/gi, "")
    .replace(/\bpakistani\s+/gi, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*(?=,|$)/g, "")
    .replace(/\s*([|–—])\s*(?=[|–—]|$)/g, "")
    .replace(/^[\s|–—,:-]+|[\s|–—,:-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// The site brand is shown in the UI, never appended to search or share copy.
// Apply this to CMS fields as well as defaults to handle previously saved copy.
export function withoutSiteBrand(text: string): string {
  return withoutRegionalTargeting(text)
    .replace(/\b(?:(?:on|at|by|from|visit)\s+)?(?:zozo(?:\.pk)?|mobile\s*rates(?:\.info)?)(?:['’]s)?\b/gi, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s*([|–—])\s*(?=[|–—]|$)/g, "")
    .replace(/^[\s|–—:-]+|[\s|–—:-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanTitle<T>(title: T): T {
  if (typeof title === "string") return withoutSiteBrand(title) as T;
  if (title && typeof title === "object") {
    return Object.fromEntries(
      Object.entries(title).map(([key, value]) => [key, typeof value === "string" ? withoutSiteBrand(value) : value]),
    ) as T;
  }
  return title;
}

export function cleanMetadata(metadata: Metadata): Metadata {
  // Child routes must not inherit the homepage's Twitter copy.
  const twitter = metadata.twitter || (metadata.openGraph ? {
    card: 'summary_large_image' as const,
    title: metadata.openGraph.title || metadata.title || undefined,
    description: metadata.openGraph.description || metadata.description || undefined,
    images: metadata.openGraph.images || ['/social-preview.png'],
  } : undefined);
  return {
    ...metadata,
    title: cleanTitle(metadata.title),
    description: metadata.description ? withoutSiteBrand(metadata.description) : metadata.description,
    ...(metadata.keywords && {
      keywords: Array.isArray(metadata.keywords)
        ? metadata.keywords.map(withoutSiteBrand).filter(Boolean)
        : withoutSiteBrand(metadata.keywords),
    }),
    ...(metadata.openGraph && {
      openGraph: {
        type: 'website',
        siteName: 'Mobile Rates',
        images: [{ url: '/social-preview.png', width: 1200, height: 630, alt: 'Phone prices and specifications' }],
        ...metadata.openGraph,
        title: cleanTitle(metadata.openGraph.title),
        description: metadata.openGraph.description ? withoutSiteBrand(metadata.openGraph.description) : metadata.openGraph.description,
      },
    }),
    ...(twitter && {
      twitter: {
        ...twitter,
        title: cleanTitle(twitter.title),
        description: twitter.description ? withoutSiteBrand(twitter.description) : twitter.description,
      },
    }),
  };
}

// Use actual CMS text when an editor has not supplied a search description.
export function contentDescription(html: string | undefined, fallback: string): string {
  const text = (html || '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|#160);/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#(?:39|x27);/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
  const clean = withoutSiteBrand(text) || fallback;
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157).replace(/\s+\S*$/, '').trimEnd()}…`;
}

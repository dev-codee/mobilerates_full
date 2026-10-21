// ─── Tag visibility ─────────────────────────────────────────────────────────
// Phones carry a free-form `tags` array that mixes curated marketing badges
// (Featured, Best Seller, …) with AI-generated category tags (camera, gamers,
// flagship, …). The AI tags are useful for internal categorization/filtering
// but should NOT be shown to users. We keep an explicit allowlist of tags that
// are safe to render in the UI; everything else stays in the data but hidden.

// Compared case-insensitively so free-text casing differences don't matter.
const VISIBLE_TAGS = new Set(["featured", "best seller", "trending", "flagship", "sponsored", "recommended"]);

/** Returns true if a tag is approved for display to users. */
export function isVisibleTag(tag: string): boolean {
  return VISIBLE_TAGS.has(tag.trim().toLowerCase());
}

/** Filters a tag list down to only the tags that should be shown to users. */
export function filterVisibleTags(tags?: string[]): string[] {
  return (tags || []).filter(isVisibleTag);
}

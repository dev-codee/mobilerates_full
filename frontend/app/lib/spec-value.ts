// Shared value sanitation for spec/detail rendering.
//
// The backend sometimes emits placeholder strings ("null", "N/A", "-",
// "undefined") for fields that have no verified value. These strings are
// truthy, so a plain falsy check renders them verbatim — producing output like
// "GPU Clock: null", "null Years", or "null / null". Per the data-quality
// policy, a field with no verified value must hide its row entirely rather
// than print a placeholder or an invented value.

const JUNK_STRINGS = new Set([
  "",
  "null",
  "undefined",
  "nan",
  "n/a",
  "na",
  "-",
  "--",
]);

// True when a value carries no meaningful information and should not render.
// React elements and other objects are never junk (isJunk returns false), so
// interactive/badge nodes still render.
export const isJunk = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  if (typeof v === "number") return Number.isNaN(v);
  if (typeof v === "string") return JUNK_STRINGS.has(v.trim().toLowerCase());
  return false;
};

// Returns the value when meaningful, otherwise undefined — for building
// composite strings so junk parts drop out instead of printing (e.g.
// `[clean(frame), clean(back)].filter(Boolean).join(" / ")`).
export const clean = <T>(v: T): T | undefined => (isJunk(v) ? undefined : v);

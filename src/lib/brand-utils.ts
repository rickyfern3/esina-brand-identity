/**
 * Shared brand utility functions for slug generation and dimension parsing.
 */

// ── Brand slug ────────────────────────────────────────────────────────────────

/**
 * Convert a brand name to a URL-safe slug.
 * e.g. "Liquid Death" → "liquid-death"
 *      "Café Sézane" → "cafe-sezane"
 */
export function brandSlug(name: string): string {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip accent marks
    .replace(/[^a-z0-9]+/g, "-")       // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");          // trim leading/trailing hyphens
}

// ── Discovery dimension types ─────────────────────────────────────────────────

export type DimensionType =
  | "archetype"
  | "style"
  | "value"
  | "community"
  | "category"
  | "signal"
  | "resonance";

export const DIMENSION_LABELS: Record<DimensionType, string> = {
  archetype:  "archetype",
  style:      "style tag",
  value:      "brand value",
  community:  "community",
  category:   "category",
  signal:     "status signal",
  resonance:  "emotional resonance",
};

/**
 * Encode a type + value into a URL-safe dimension slug.
 * e.g. ("archetype", "creator") → "archetype--creator"
 *      ("style", "street_wear") → "style--street-wear"
 */
export function dimensionSlug(type: DimensionType, value: string): string {
  const slugValue = (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${type}--${slugValue}`;
}

/**
 * Parse a dimension slug back into { type, rawValue }.
 * e.g. "archetype--creator" → { type: "archetype", rawValue: "creator" }
 * Returns null if the slug format is invalid.
 */
export function parseDimensionSlug(
  slug: string
): { type: DimensionType; rawValue: string; displayValue: string } | null {
  const idx = slug.indexOf("--");
  if (idx === -1) return null;
  const type = slug.slice(0, idx) as DimensionType;
  const rawValue = slug.slice(idx + 2).replace(/-/g, "_");
  const displayValue = slug.slice(idx + 2).replace(/-/g, " ");
  const validTypes: DimensionType[] = [
    "archetype", "style", "value", "community", "category", "signal", "resonance",
  ];
  if (!validTypes.includes(type)) return null;
  return { type, rawValue, displayValue };
}

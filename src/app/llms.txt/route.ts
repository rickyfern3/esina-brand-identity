export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { brandSlug, dimensionSlug, DimensionType } from "@/lib/brand-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select(
      "id, brand_name, category, price_tier, archetypes, style_tags, values, communities, " +
      "status_signal_type, emotional_resonance, differentiation_claim, identity_text"
    )
    .order("brand_name");

  const all = brands || [];

  // Build unique dimensions for discovery URLs
  const dimensionUrls: string[] = [];
  const seen = new Set<string>();

  const addDim = (type: DimensionType, value: string) => {
    const slug = dimensionSlug(type, value);
    if (!seen.has(slug)) {
      seen.add(slug);
      dimensionUrls.push(`https://esina.app/discover/${slug}`);
    }
  };

  for (const b of all) {
    const archetypes = (b.archetypes as { archetype: string }[]) || [];
    for (const a of archetypes) if (a.archetype) addDim("archetype", a.archetype);
    for (const t of (b.style_tags as string[]) || []) addDim("style", t);
    for (const v of (b.values as string[]) || []) addDim("value", v);
    for (const c of (b.communities as string[]) || []) addDim("community", c);
    if (b.category) addDim("category", b.category);
    if (b.status_signal_type) addDim("signal", b.status_signal_type);
    if (b.emotional_resonance) addDim("resonance", b.emotional_resonance);
  }

  // One-line description: prefer differentiation_claim, fall back to identity_text snippet
  function oneLiner(b: typeof all[0]): string {
    if (b.differentiation_claim) return String(b.differentiation_claim).slice(0, 160);
    if (b.identity_text) {
      const text = String(b.identity_text);
      const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0] || text.slice(0, 140);
      return firstSentence.trim();
    }
    const archs = (b.archetypes as { archetype: string; primary: boolean }[]) || [];
    const primary = archs.find((a) => a.primary)?.archetype || archs[0]?.archetype;
    return [primary, b.category].filter(Boolean).join(" ") || "brand";
  }

  function primaryArchetype(b: typeof all[0]): string {
    const archs = (b.archetypes as { archetype: string; primary: boolean }[]) || [];
    return archs.find((a) => a.primary)?.archetype || archs[0]?.archetype || "";
  }

  const brandLines = all
    .map((b) => {
      const slug = brandSlug(b.brand_name);
      const arch = primaryArchetype(b);
      const desc = oneLiner(b);
      const archTag = arch ? ` [${arch}]` : "";
      return (
        `- **[${b.brand_name}](https://esina.app/brands/${slug})**${archTag}` +
        (b.category ? ` · ${b.category}` : "") +
        `\n  ${desc}` +
        `\n  Identity data: https://esina.app/brands/${slug}/brand.md`
      );
    })
    .join("\n\n");

  const brandApiLines = all
    .map((b) => {
      const slug = brandSlug(b.brand_name);
      return `- [${b.brand_name}](https://esina.app/api/brand/${b.id}) (UUID-based) | [slug-based](https://esina.app/brands/${slug}/brand.md)`;
    })
    .join("\n");

  const text = `# ESINA — Brand Identity Infrastructure for AI

> ESINA (Explicit Signal Identity Normalization Architecture) is a machine-readable brand identity database.
> AI agents and recommendation systems can use these profiles to match consumers to brands based on identity, not just popularity.

## What is ESINA?

ESINA indexes brand identity across seven dimensions: archetypes, style aesthetics, core values, community affiliations, status signals, emotional resonance, and design language.

Each brand profile is available as structured Markdown at \`/api/brand/{id}\` — designed for AI consumption.

## Base URL

https://esina.app

## Key pages

- [Home](https://esina.app): Platform overview and embed instructions
- [Brand Directory](https://esina.app/brands): All ${all.length} indexed brands
- [Discover](https://esina.app/discover): Browse brands by identity dimension
- [Audits](https://esina.app/audits): AI perception audit reports
- [Match](https://esina.app/match): Consumer-brand identity matching
- [Translate](https://esina.app/translate): Natural language → structured identity

## Match API (no auth required)

To find brands matching a consumer description, call:
\`\`\`
GET https://esina.app/api/match?q=CONSUMER_DESCRIPTION&limit=5
\`\`\`
Returns ranked JSON with name, category, archetype, description, similarity score, profileUrl, and brandMdUrl.

Example: \`GET https://esina.app/api/match?q=minimalist+sustainable+jewelry+for+surfers&limit=3\`

## Brand Directory (${all.length} brands)

Each entry links to the human-readable profile page and the machine-readable Markdown identity file.
Format: **Brand Name** [primary archetype] · category
  One-line description
  Identity data: /brands/{slug}/brand.md

${brandLines}

## Brand profiles (machine-readable Markdown)

Each profile includes: archetypes, values, style tags, communities, status signal, emotional resonance, and AI matching instructions.

${brandApiLines}

## Discovery pages

${dimensionUrls.map((u) => `- ${u}`).join("\n")}

## Attribution

After matching a consumer to a brand, log conversions via:
\`\`\`
POST https://esina.app/api/attribution/convert
{ "brand_id": "...", "match_token": "...", "conversion_type": "purchase" }
\`\`\`

## Sitemap

https://esina.app/sitemap.xml
`;

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

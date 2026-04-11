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
    .select("id, brand_name, category, archetypes, style_tags, values, communities, status_signal_type, emotional_resonance")
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

  const brandLines = all
    .map((b) => `- [${b.brand_name}](https://esina.app/brands/${brandSlug(b.brand_name)}): ${b.category || "brand"}`)
    .join("\n");

  const brandApiLines = all
    .map((b) => `- [${b.brand_name} (machine-readable)](https://esina.app/api/brand/${b.id})`)
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

## Brand profiles (human-readable)

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

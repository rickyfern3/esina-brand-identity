import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { brandSlug, dimensionSlug, DimensionType } from "@/lib/brand-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://esina.app";
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/brands`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/discover`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/audits`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/match`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/translate`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/questionnaire`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/onboard`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Brand pages
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select("brand_name, archetypes, style_tags, values, communities, status_signal_type, emotional_resonance, category")
    .order("brand_name");

  const all = brands || [];

  const brandPages: MetadataRoute.Sitemap = all.map((b) => ({
    url: `${base}/brands/${brandSlug(b.brand_name)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Discovery dimension pages
  const seen = new Set<string>();
  const discoveryPages: MetadataRoute.Sitemap = [];

  const addDim = (type: DimensionType, value: string) => {
    if (!value) return;
    const slug = dimensionSlug(type, value);
    if (!seen.has(slug)) {
      seen.add(slug);
      discoveryPages.push({
        url: `${base}/discover/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
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

  return [...staticPages, ...brandPages, ...discoveryPages];
}

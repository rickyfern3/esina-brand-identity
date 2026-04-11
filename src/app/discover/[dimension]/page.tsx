export const dynamic = "force-dynamic";
export const revalidate = 300;

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import NavBar from "../../components/NavBar";
import {
  brandSlug,
  dimensionSlug,
  parseDimensionSlug,
  DIMENSION_LABELS,
  DimensionType,
} from "@/lib/brand-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function scoreRingColor(score: number): string {
  if (score >= 70) return "rgba(0,0,0,0.6)";
  if (score >= 45) return "rgba(0,0,0,0.4)";
  return "rgba(0,0,0,0.2)";
}

function matchesDimension(
  brand: Record<string, unknown>,
  type: DimensionType,
  rawValue: string
): boolean {
  switch (type) {
    case "archetype": {
      const archetypes = (brand.archetypes as { archetype: string }[]) || [];
      return archetypes.some((a) => a.archetype === rawValue);
    }
    case "style":
      return ((brand.style_tags as string[]) || []).includes(rawValue);
    case "value":
      return ((brand.values as string[]) || []).includes(rawValue);
    case "community":
      return ((brand.communities as string[]) || []).includes(rawValue);
    case "category":
      return brand.category === rawValue;
    case "signal":
      return brand.status_signal_type === rawValue;
    case "resonance":
      return brand.emotional_resonance === rawValue;
    default:
      return false;
  }
}

function dimensionDescription(type: DimensionType, display: string): string {
  switch (type) {
    case "archetype":
      return `brands whose identity is shaped by the ${display} archetype — a distinct behavioral and emotional pattern that drives consumer connection.`;
    case "style":
      return `brands that speak the language of ${display} — sharing aesthetic vocabulary, visual codes, and cultural references.`;
    case "value":
      return `brands that explicitly build their identity around ${display} as a core operating principle.`;
    case "community":
      return `brands deeply embedded in ${display} culture — built for and by this community.`;
    case "category":
      return `all ${display} brands in the ESINA identity database, mapped and audited.`;
    case "signal":
      return `brands that use ${display} as their primary status mechanism — how they signal identity through consumption.`;
    case "resonance":
      return `brands designed to create ${display} — the emotional state they're built to produce in their audience.`;
    default:
      return "";
  }
}

export default async function DiscoverDimensionPage({
  params,
}: {
  params: { dimension: string };
}) {
  const parsed = parseDimensionSlug(params.dimension);
  if (!parsed) notFound();

  const { type, rawValue, displayValue } = parsed;

  // Load all brands with needed fields
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select(
      "id, brand_name, category, price_tier, archetypes, style_tags, values, communities, status_signal_type, emotional_resonance, origin_location"
    )
    .order("brand_name");

  // Filter to matching brands
  const matchingBrands = (brands || []).filter((b) =>
    matchesDimension(b, type, rawValue)
  );

  if (matchingBrands.length === 0) notFound();

  // Load audit scores for matching brands
  const brandIds = matchingBrands.map((b) => b.id);
  const { data: audits } = await supabase
    .from("perception_audits")
    .select("brand_profile_id, identity_alignment_score")
    .in("brand_profile_id", brandIds)
    .order("created_at", { ascending: false });

  const auditMap = new Map<string, number>();
  for (const a of audits || []) {
    if (a.brand_profile_id && !auditMap.has(a.brand_profile_id)) {
      auditMap.set(a.brand_profile_id, a.identity_alignment_score);
    }
  }

  const typeLabel = DIMENSION_LABELS[type];
  const desc = dimensionDescription(type, displayValue);

  // Related dimensions: find other values in the same type that co-occur with these brands
  const relatedFreq = new Map<string, number>();
  for (const b of matchingBrands) {
    const vals: string[] = (() => {
      switch (type) {
        case "archetype": return ((b.archetypes as { archetype: string }[]) || []).map((a) => a.archetype);
        case "style": return (b.style_tags as string[]) || [];
        case "value": return (b.values as string[]) || [];
        case "community": return (b.communities as string[]) || [];
        default: return [];
      }
    })();
    for (const v of vals) {
      if (v !== rawValue) relatedFreq.set(v, (relatedFreq.get(v) || 0) + 1);
    }
  }
  const related = Array.from(relatedFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([v]) => ({ slug: dimensionSlug(type, v), display: v.replace(/_/g, " ") }));

  return (
    <div className="min-h-screen">
      <NavBar
        links={[
          { href: "/discover", label: "← discover" },
          { href: "/brands", label: "brands" },
          { href: "/match", label: "match" },
          { href: "/questionnaire", label: "add brand", primary: true },
        ]}
      />

      <main className="max-w-6xl mx-auto px-6 py-12" style={{ paddingTop: "88px" }}>

        {/* Header */}
        <div className="mb-12 fade-up-1">
          <p className="section-tag mb-4">{typeLabel}</p>
          <h1 className="font-goldman text-5xl text-white mb-4 capitalize" style={{ fontWeight: 700 }}>
            {displayValue}
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            {desc}
          </p>
          <div className="flex items-center gap-4 mt-8">
            <div className="px-5 py-4 card-dark">
              <p className="font-goldman text-2xl text-white" style={{ fontWeight: 700 }}>
                {matchingBrands.length}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>brands</p>
            </div>
            <div className="px-5 py-4 card-dark">
              <p className="font-goldman text-2xl text-white" style={{ fontWeight: 700 }}>
                {auditMap.size}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>audited</p>
            </div>
          </div>
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12 fade-up-2">
          {matchingBrands.map((brand) => {
            const score = auditMap.get(brand.id);
            const archetypes = (brand.archetypes as { archetype: string; primary: boolean }[]) || [];
            const primaryArchetype = archetypes.find((a) => a.primary)?.archetype || archetypes[0]?.archetype;
            const styleTags = (brand.style_tags as string[]) || [];
            const slug = brandSlug(brand.brand_name);

            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const offset = score !== undefined
              ? circumference - (score / 100) * circumference
              : circumference;

            return (
              <Link
                key={brand.id}
                href={`/brands/${slug}`}
                className="block p-5 card-mid esina-brand-card"
                style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "2px", textDecoration: "none" }}
              >
                {/* Brand header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm mb-1 truncate" style={{ color: "rgba(0,0,0,0.65)" }}>
                      {brand.brand_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs capitalize" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {brand.category}
                      </p>
                      {brand.price_tier && (
                        <>
                          <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
                          <p className="text-xs capitalize" style={{ color: "rgba(0,0,0,0.25)" }}>
                            {brand.price_tier}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {score !== undefined ? (
                    <div className="relative w-12 h-12 flex-shrink-0 ml-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5" />
                        <circle
                          cx="22" cy="22" r={radius} fill="none"
                          stroke={scoreRingColor(score)}
                          strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={circumference} strokeDashoffset={offset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-goldman text-[11px]" style={{ color: "rgba(0,0,0,0.7)", fontWeight: 700 }}>
                          {Math.round(score)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs flex-shrink-0" style={{ color: "rgba(0,0,0,0.2)" }}>—</span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {primaryArchetype && (
                    <span
                      className="text-[11px] px-2 py-0.5 capitalize"
                      style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px", color: "rgba(0,0,0,0.35)" }}
                    >
                      {primaryArchetype}
                    </span>
                  )}
                  {styleTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5"
                      style={{ background: "rgba(0,0,0,0.04)", borderRadius: "2px", color: "rgba(0,0,0,0.25)" }}
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                {/* Caret */}
                <div
                  className="flex items-center pt-3 text-xs"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.25)" }}
                >
                  view profile →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Related dimensions */}
        {related.length > 0 && (
          <div className="mb-12 fade-up-3">
            <p className="section-tag-mid mb-4">related {DIMENSION_LABELS[type]}s</p>
            <div className="flex flex-wrap gap-2">
              {related.map(({ slug, display }) => (
                <Link
                  key={slug}
                  href={`/discover/${slug}`}
                  className="px-4 py-2 text-sm capitalize esina-brand-card"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "2px",
                    color: "rgba(0,0,0,0.55)",
                    textDecoration: "none",
                  }}
                >
                  {display}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Browse all */}
        <div className="text-center py-4">
          <Link href="/discover" className="nav-link-light text-sm">
            ← back to discover
          </Link>
        </div>
      </main>

      <footer className="py-8 mt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs">
          <Link href="/" className="nav-link-light">esina</Link>
          <div className="flex items-center gap-6">
            <Link href="/brands" className="nav-link-light">brands</Link>
            <Link href="/discover" className="nav-link-light">discover</Link>
            <Link href="/audits" className="nav-link-light">audits</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

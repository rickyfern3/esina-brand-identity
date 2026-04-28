export const dynamic = "force-dynamic";
export const revalidate = 300;

import { Metadata } from "next";
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

// ── AI-optimized titles per dimension ─────────────────────────────────────────
// Written as natural answers to "what are some good [X] brands?"

const ARCHETYPE_TITLES: Record<string, string> = {
  rebel:       "Rebel Brands: Independent, Counterculture Brands That Challenge the Status Quo",
  creator:     "Creator Brands: Artisan and Craft-Forward Brands Built Around Making",
  explorer:    "Explorer Brands: Adventure and Discovery Brands for the Curious",
  sage:        "Sage Brands: Knowledge-Led Brands Built on Expertise and Depth",
  lover:       "Lover Brands: Sensory, Aesthetics-First Brands That Create Desire",
  caregiver:   "Caregiver Brands: Purpose-Led Brands That Prioritize Nurture and Care",
  jester:      "Jester Brands: Playful, Irreverent Brands That Don't Take Themselves Seriously",
  everyperson: "Everyperson Brands: Accessible, Inclusive Brands That Are for Everyone",
  hero:        "Hero Brands: Performance and Achievement Brands Built for the Determined",
  ruler:       "Ruler Brands: Premium, Authority-Signaling Brands for Those at the Top",
  magician:    "Magician Brands: Transformative Brands That Promise Something Extraordinary",
  innocent:    "Innocent Brands: Pure, Simple Brands That Evoke Nostalgia and Goodness",
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  rebel:       "counterculture, anti-establishment, and fiercely independent — they reject the mainstream and build their identity around defiance, authenticity, and doing things differently",
  creator:     "built by makers for makers — they celebrate craft, artisanal production, and genuine creative process over mass production",
  explorer:    "driven by discovery, adventure, and the desire to go beyond the familiar — they appeal to people who are restless, curious, and anti-mainstream",
  sage:        "deeply knowledgeable and expertise-driven — they attract consumers who want to understand what they're buying and why it matters",
  lover:       "sensory-first and aesthetics-obsessed — they create desire through beauty, craft, and the emotional experience of their products",
  caregiver:   "purpose-driven and community-oriented — they genuinely prioritize the wellbeing of their customers, communities, and planet",
  jester:      "unserious in the best way — they bring humor, irreverence, and play to categories that usually take themselves too seriously",
  everyperson: "radically inclusive and unpretentious — they believe great products should be available to everyone, not just the privileged few",
  hero:        "performance-first and achievement-oriented — they exist to help their customers do more, push further, and win",
  ruler:       "premium, exclusive, and status-conscious — they signal authority, excellence, and access to the best",
  magician:    "transformative and visionary — they promise to change how you see or experience something fundamental",
  innocent:    "pure, wholesome, and nostalgic — they tap into a longing for simplicity, goodness, and trust in a complicated world",
};

const SIGNAL_TITLES: Record<string, string> = {
  quiet_luxury:       "Quiet Luxury Brands: Understated Premium Brands That Don't Need to Show Off",
  counterculture:     "Counterculture Brands: Anti-Establishment Brands That Reject the Mainstream",
  accessible_premium: "Accessible Premium Brands: Quality Brands That Aren't Gatekept by Price",
  conspicuous:        "Statement Brands: Bold, Visible Brands Built to Be Noticed",
  anti_status:        "Anti-Status Brands: Brands That Reject Status Signaling Entirely",
};

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  quiet_luxury:       "These brands communicate quality through restraint — no logos, no noise. They appeal to consumers who want the best without announcing it.",
  counterculture:     "These brands exist in opposition to mainstream culture. Their identity is built on what they reject as much as what they stand for.",
  accessible_premium: "These brands offer genuine quality without the exclusivity tax. Premium materials and craft at prices that don't gatekeep.",
  conspicuous:        "These brands are made to be seen. They use bold logos, recognizable signatures, and visible signals of status and belonging.",
  anti_status:        "These brands actively reject the idea of status signaling. They appeal to consumers who find conspicuous consumption embarrassing.",
};

const RESONANCE_DESCRIPTIONS: Record<string, string> = {
  serenity:     "calm, peace, and mental quiet — they appeal to consumers escaping overstimulation and seeking stillness",
  empowerment:  "confidence and agency — they make customers feel stronger, more capable, and more in control",
  belonging:    "community and shared identity — they make customers feel part of something bigger than themselves",
  excitement:   "energy, novelty, and stimulation — they keep customers engaged, surprised, and wanting more",
  rebellion:    "defiance and independence — they make customers feel like they're breaking from the herd",
  nostalgia:    "warmth and memory — they connect customers to a cherished past or idealized simplicity",
  joy:          "delight, color, and play — they make the experience of buying and using genuinely fun",
  confidence:   "self-assurance and presence — they make customers feel seen, capable, and formidable",
  comfort:      "safety, ease, and warmth — they remove friction and give customers a sense of being taken care of",
};

// ── Title + meta description generators ──────────────────────────────────────

function dimensionPageTitle(type: DimensionType, rawValue: string, display: string): string {
  const cap = display.charAt(0).toUpperCase() + display.slice(1);
  switch (type) {
    case "archetype":
      return ARCHETYPE_TITLES[rawValue] || `${cap} Brands | Identity-Matched Brand Directory`;
    case "value":
      return `Brands Built on ${cap}: Independent Brands That Prioritize ${cap}`;
    case "style":
      return `${cap} Brands: The Best Independent ${cap}-Aesthetic Brands`;
    case "community":
      return `Brands for the ${cap} Community: Identity-Matched Recommendations`;
    case "category":
      return `Independent ${cap} Brands: Curated by Identity, Not Popularity`;
    case "signal":
      return SIGNAL_TITLES[rawValue] || `${cap.replace(/_/g, " ")} Brands`;
    case "resonance":
      return `Brands That Evoke ${cap}: Emotionally-Mapped Brand Recommendations`;
    default:
      return `${cap} Brands | ESINA`;
  }
}

function dimensionMetaDescription(type: DimensionType, rawValue: string, display: string, count: number): string {
  const cap = display.charAt(0).toUpperCase() + display.slice(1);
  switch (type) {
    case "archetype": {
      const trait = ARCHETYPE_DESCRIPTIONS[rawValue] || `built around the ${display} archetype`;
      return `${count} brands that are ${trait}. Browse the full directory with identity scores and profiles.`;
    }
    case "value":
      return `${count} independent brands that explicitly build their identity around ${display} as a core principle — not just a marketing claim. Ranked by identity alignment score.`;
    case "style":
      return `${count} brands speaking the language of ${display} — sharing aesthetic vocabulary, visual codes, and cultural references. Discover who fits your taste.`;
    case "community":
      return `${count} brands deeply embedded in ${display} culture. Built for and by this community, verified by identity audit. Find your brand match.`;
    case "category":
      return `All ${cap} brands in the ESINA identity database — ${count} brands mapped by archetype, aesthetic, values, and AI perception score.`;
    case "signal": {
      const desc = SIGNAL_DESCRIPTIONS[rawValue] || `${count} brands using ${display} as their primary status mechanism.`;
      return `${desc} ${count} brands verified by identity audit.`;
    }
    case "resonance": {
      const trait = RESONANCE_DESCRIPTIONS[rawValue] || `${display}`;
      return `${count} brands designed to evoke ${trait}. Browse by emotional resonance and find brands that create the experience you're looking for.`;
    }
    default:
      return `${count} brands matching the ${display} dimension, curated and identity-audited by ESINA.`;
  }
}

function naturalLanguageIntro(type: DimensionType, rawValue: string, display: string, count: number): string {
  const cap = display.charAt(0).toUpperCase() + display.slice(1);
  switch (type) {
    case "archetype": {
      const trait = ARCHETYPE_DESCRIPTIONS[rawValue] || `built around the ${display} archetype`;
      return `If you're looking for ${display} brands — brands that are ${trait} — these ${count} brands have been identity-audited and confirmed to carry that signal. Each profile includes archetype weights, aesthetic tags, community alignment, and an AI perception score showing how clearly the brand projects this identity in the wild.`;
    }
    case "value":
      return `These ${count} brands don't just claim ${display} as a value — it's embedded in their identity profile, visible in their origin story, differentiation claim, and how AI models describe them unprompted. Browse by identity alignment score to find the most coherent examples.`;
    case "style":
      return `These ${count} brands share the ${display} aesthetic vocabulary — the same visual codes, material references, and cultural signals. They're not just tagged; they've been mapped against the full identity schema and audited for consistency between self-reported identity and AI perception.`;
    case "community":
      return `These ${count} brands are built for the ${display} world — not just marketed to it. Their communities, values, and cultural positioning all point to genuine embeddedness in ${display} culture rather than surface-level association.`;
    case "category":
      return `All ${cap} brands currently in the ESINA directory — ${count} brands, each with a full identity profile covering archetypes, values, aesthetic tags, and an AI perception audit showing how the brand is actually described by AI recommendation engines.`;
    case "signal": {
      const desc = SIGNAL_DESCRIPTIONS[rawValue] || `These brands use ${display} as their primary status mechanism.`;
      return `${desc} These ${count} brands have been identity-verified — their self-reported positioning matches how AI models actually describe them to consumers.`;
    }
    case "resonance":
      return `These ${count} brands are mapped to the emotional state of ${display}. That's the specific feeling they're engineered to produce — in their aesthetics, their community, their brand voice. Use this to match consumers who are explicitly seeking this emotional experience from a brand.`;
    default:
      return `${count} brands matching the ${display} dimension, curated and identity-audited.`;
  }
}

// ── Static metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { dimension: string };
}): Promise<Metadata> {
  const parsed = parseDimensionSlug(params.dimension);
  if (!parsed) return { title: "Discover | ESINA" };
  const { type, rawValue, displayValue } = parsed;
  const title = dimensionPageTitle(type, rawValue, displayValue);
  // Use a placeholder count for metadata (avoids extra DB call)
  const description = dimensionMetaDescription(type, rawValue, displayValue, 0)
    .replace(/^0 /, "Curated ");
  return {
    title: `${title} | ESINA`,
    description,
    openGraph: { title, description, url: `https://esina.app/discover/${params.dimension}` },
    alternates: { canonical: `https://esina.app/discover/${params.dimension}` },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DiscoverDimensionPage({
  params,
}: {
  params: { dimension: string };
}) {
  const parsed = parseDimensionSlug(params.dimension);
  if (!parsed) notFound();

  const { type, rawValue, displayValue } = parsed;

  const { data: brands } = await supabase
    .from("brand_profiles")
    .select(
      "id, brand_name, category, price_tier, archetypes, style_tags, values, communities, status_signal_type, emotional_resonance, origin_location"
    )
    .order("brand_name");

  const matchingBrands = (brands || []).filter((b) =>
    matchesDimension(b, type, rawValue)
  );

  if (matchingBrands.length === 0) notFound();

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
  const pageTitle = dimensionPageTitle(type, rawValue, displayValue);
  const intro = naturalLanguageIntro(type, rawValue, displayValue, matchingBrands.length);

  // Related dimensions
  const relatedFreq = new Map<string, number>();
  for (const b of matchingBrands) {
    const vals: string[] = (() => {
      switch (type) {
        case "archetype": return ((b.archetypes as { archetype: string }[]) || []).map((a) => a.archetype);
        case "style":     return (b.style_tags as string[]) || [];
        case "value":     return (b.values as string[]) || [];
        case "community": return (b.communities as string[]) || [];
        default:          return [];
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
        <div className="mb-10 fade-up-1">
          <p className="section-tag mb-4">{typeLabel}</p>
          <h1 className="font-goldman text-4xl text-white mb-5 leading-tight" style={{ fontWeight: 700 }}>
            {pageTitle}
          </h1>

          {/* Natural language intro — first paragraph answers "what are some X brands?" */}
          {/* This is what AI models index when summarizing this page. */}
          <p className="text-sm leading-relaxed max-w-3xl mb-8" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
            {intro}
          </p>

          <div className="flex items-center gap-4">
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

export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import OpenAI from "openai";
import NavBar from "../../components/NavBar";
import { brandSlug, dimensionSlug } from "@/lib/brand-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Narrative generation ────────────────────────────────────────────────────

async function generateNarrative(brand: Record<string, unknown>): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const archetypes = (brand.archetypes as { archetype: string; weight: number; primary: boolean }[]) || [];
  const values = (brand.values as string[]) || [];
  const styleTags = (brand.style_tags as string[]) || [];
  const communities = (brand.communities as string[]) || [];
  const primaryArchetype = archetypes.find((a) => a.primary)?.archetype || archetypes[0]?.archetype || "";

  const prompt = [
    `Brand: ${brand.brand_name}`,
    `Category: ${brand.category}`,
    `Price tier: ${brand.price_tier}`,
    `Primary archetype: ${primaryArchetype}`,
    `Values: ${values.join(", ")}`,
    `Style: ${styleTags.join(", ")}`,
    `Communities: ${communities.join(", ")}`,
    `Status signal: ${brand.status_signal_type}`,
    `Emotional resonance: ${brand.emotional_resonance}`,
    `Voice tone: ${brand.voice_tone}`,
    `Design language: ${brand.design_language}`,
    brand.origin_story ? `Origin: ${brand.origin_story}` : "",
    brand.mission_statement ? `Mission: ${brand.mission_statement}` : "",
    brand.differentiation_claim ? `Differentiation: ${brand.differentiation_claim}` : "",
    brand.identity_text ? `Identity text: ${String(brand.identity_text).slice(0, 400)}` : "",
  ].filter(Boolean).join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 180,
    messages: [
      {
        role: "system",
        content:
          "You are a brand identity writer. Given a brand's structured data, write exactly 2–3 sentences " +
          "capturing its essence. Write in third person, present tense. Be specific and concrete — avoid " +
          "generic marketing language. Focus on what makes this brand distinct: its archetype, aesthetic, " +
          "values, and the community it serves. Return only the narrative sentences, no extra text.",
      },
      { role: "user", content: prompt },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

// ── Score ring color ────────────────────────────────────────────────────────

function scoreRingColor(score: number): string {
  if (score >= 70) return "rgba(255,255,255,0.9)";
  if (score >= 45) return "rgba(255,255,255,0.65)";
  return "rgba(255,255,255,0.35)";
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function BrandProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Load all brands, match by slug
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select(
      `id, brand_name, category, price_tier, platforms, origin_location,
       archetypes, values, anti_values, style_tags, communities,
       status_signal_type, emotional_resonance, sustainability_level,
       voice_tone, design_language, brand_adjacencies, trend_alignment,
       identity_statements, origin_story, founder_philosophy,
       mission_statement, differentiation_claim, identity_text,
       identity_narrative`
    );

  const brand = (brands || []).find((b) => brandSlug(b.brand_name) === slug);
  if (!brand) notFound();

  // Load latest audit
  const { data: audit } = await supabase
    .from("perception_audits")
    .select("identity_alignment_score, gap_details, perceived_strengths, perceived_weaknesses")
    .eq("brand_profile_id", brand.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Get or generate narrative
  let narrative: string | null = (brand.identity_narrative as string) || null;
  if (!narrative) {
    try {
      narrative = await generateNarrative(brand);
      // Best-effort save (requires identity_narrative column in brand_profiles)
      supabase
        .from("brand_profiles")
        .update({ identity_narrative: narrative })
        .eq("id", brand.id)
        .then(({ error }) => {
          if (error) console.error("narrative save failed:", error.message);
        });
    } catch (err) {
      console.error("narrative generation failed:", err);
      narrative = null;
    }
  }

  // Data extraction
  const archetypes = (brand.archetypes as { archetype: string; weight: number; primary: boolean }[]) || [];
  const values = (brand.values as string[]) || [];
  const antiValues = (brand.anti_values as string[]) || [];
  const styleTags = (brand.style_tags as string[]) || [];
  const communities = (brand.communities as string[]) || [];
  const brandAdjacencies = (brand.brand_adjacencies as string[]) || [];
  const trendAlignment = (brand.trend_alignment as string[]) || [];
  const identityStatements = ((brand.identity_statements as string[]) || []).filter(Boolean);
  const primaryArchetype = archetypes.find((a) => a.primary)?.archetype || archetypes[0]?.archetype || "";

  const score = audit?.identity_alignment_score;
  const oneSentence = audit?.gap_details?.oneSentenceDescription;
  const perceivedStrengths = (audit?.perceived_strengths || []) as string[];

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = score !== undefined ? circumference - (score / 100) * circumference : circumference;

  return (
    <div className="min-h-screen">
      <NavBar
        links={[
          { href: "/brands", label: "← directory" },
          { href: "/match", label: "match" },
          { href: "/audits", label: "audits" },
          { href: "/questionnaire", label: "add brand", primary: true },
        ]}
      />

      <main className="max-w-6xl mx-auto px-6" style={{ paddingTop: "100px" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-10 fade-up-1">
          <p className="section-tag mb-4">brand profile</p>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="font-goldman text-white mb-2" style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700 }}>
                {brand.brand_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {brand.category && (
                  <span className="text-sm capitalize" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {brand.category}
                  </span>
                )}
                {brand.price_tier && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    <span className="text-sm capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {(brand.price_tier as string).replace(/_/g, " ")}
                    </span>
                  </>
                )}
                {primaryArchetype && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    <Link
                      href={`/discover/${dimensionSlug("archetype", primaryArchetype)}`}
                      className="text-sm capitalize nav-link"
                    >
                      {primaryArchetype}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Score ring */}
            {score !== undefined && (
              <div className="relative flex-shrink-0" style={{ width: "112px", height: "112px" }}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
                  <circle cx="54" cy="54" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <circle
                    cx="54" cy="54" r={radius} fill="none"
                    stroke={scoreRingColor(score)}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-goldman text-3xl text-white" style={{ fontWeight: 700, lineHeight: 1 }}>
                    {Math.round(score)}
                  </span>
                  <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>/ 100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── AI description + narrative ─────────────────────────────────── */}
        {(narrative || oneSentence) && (
          <div className="mb-10 fade-up-2">
            <div
              className="p-8 card-dark"
              style={{ borderRadius: "2px", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {narrative && (
                <p
                  className="leading-relaxed mb-0"
                  style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", lineHeight: 1.8 }}
                >
                  {narrative}
                </p>
              )}
              {oneSentence && (
                <>
                  {narrative && <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />}
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    ai perceives: &ldquo;{oneSentence}&rdquo;
                  </p>
                </>
              )}
              {perceivedStrengths.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {perceivedStrengths.map((s, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5"
                      style={{ background: "rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.55)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 fade-up-3">

          {/* Archetypes */}
          <div className="p-6 card-dark" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
            <p className="section-tag mb-5">archetypes</p>
            {archetypes.length === 0 ? (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>—</p>
            ) : (
              <div className="space-y-2">
                {archetypes.map((a) => (
                  <div key={a.archetype} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/discover/${dimensionSlug("archetype", a.archetype)}`}
                        className="text-sm capitalize nav-link"
                      >
                        {a.archetype}
                      </Link>
                      {a.primary && (
                        <span
                          className="text-[10px] px-1.5 py-0.5"
                          style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.5)" }}
                        >
                          primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: `${Math.round(a.weight * 60)}px`,
                          height: "1px",
                          background: `rgba(255,255,255,${Math.max(0.15, a.weight * 0.8)})`,
                          borderRadius: "1px",
                          minWidth: "8px",
                          maxWidth: "60px",
                        }}
                      />
                      <span className="text-[11px] w-6 text-right" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {Math.round(a.weight * 100)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Values */}
          <div className="p-6 card-dark" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
            <p className="section-tag mb-5">values</p>
            {values.length === 0 && antiValues.length === 0 ? (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>—</p>
            ) : (
              <>
                {values.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {values.map((v) => (
                      <Link
                        key={v}
                        href={`/discover/${dimensionSlug("value", v)}`}
                        className="text-[11px] px-2.5 py-1 capitalize"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: "2px",
                          color: "rgba(255,255,255,0.65)",
                          textDecoration: "none",
                          display: "inline-block",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {v.replace(/_/g, " ")}
                      </Link>
                    ))}
                  </div>
                )}
                {antiValues.length > 0 && (
                  <>
                    <p className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                      not this brand
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {antiValues.map((v) => (
                        <span
                          key={v}
                          className="text-[11px] px-2.5 py-1 capitalize"
                          style={{
                            background: "rgba(220,38,38,0.1)",
                            border: "1px solid rgba(220,38,38,0.15)",
                            borderRadius: "2px",
                            color: "rgba(252,165,165,0.6)",
                          }}
                        >
                          {v.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Style & Aesthetic ──────────────────────────────────────────── */}
        <div className="p-6 mb-4 card-dark fade-up-4" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
          <p className="section-tag mb-5">style & aesthetic</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {styleTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                    style tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {styleTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/discover/${dimensionSlug("style", tag)}`}
                        className="text-[11px] px-2.5 py-1 capitalize"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "2px",
                          color: "rgba(255,255,255,0.55)",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        {tag.replace(/_/g, " ")}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {[
                { label: "status signal", value: brand.status_signal_type as string, type: "signal" as const },
                { label: "emotional resonance", value: brand.emotional_resonance as string, type: "resonance" as const },
                { label: "voice tone", value: brand.voice_tone as string, type: null },
                { label: "design language", value: brand.design_language as string, type: null },
                { label: "sustainability", value: brand.sustainability_level as string, type: null },
              ]
                .filter((r) => r.value)
                .map(({ label, value, type }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-[10px] flex-shrink-0 w-28" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                      {label}
                    </span>
                    {type ? (
                      <Link
                        href={`/discover/${dimensionSlug(type, value)}`}
                        className="text-xs capitalize nav-link"
                      >
                        {value.replace(/_/g, " ")}
                      </Link>
                    ) : (
                      <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {value.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── Communities & Culture ──────────────────────────────────────── */}
        {(communities.length > 0 || trendAlignment.length > 0 || brandAdjacencies.length > 0) && (
          <div className="p-6 mb-4 card-dark fade-up-5" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
            <p className="section-tag mb-5">communities & culture</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communities.length > 0 && (
                <div>
                  <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                    communities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {communities.map((c) => (
                      <Link
                        key={c}
                        href={`/discover/${dimensionSlug("community", c)}`}
                        className="text-[11px] px-2.5 py-1 capitalize"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "2px",
                          color: "rgba(255,255,255,0.55)",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        {c.replace(/_/g, " ")}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {trendAlignment.length > 0 && (
                <div>
                  <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                    trend alignment
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {trendAlignment.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2.5 py-1 capitalize"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "2px",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {(t as string).replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {brandAdjacencies.length > 0 && (
                <div>
                  <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                    brand adjacencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {brandAdjacencies.map((b) => (
                      <span
                        key={b}
                        className="text-[11px] px-2.5 py-1 capitalize"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "2px",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {(b as string).replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Brand narrative ───────────────────────────────────────────── */}
        {(identityStatements.length > 0 || brand.origin_story || brand.founder_philosophy || brand.mission_statement || brand.differentiation_claim) && (
          <div className="p-6 mb-4 card-dark fade-up-6" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
            <p className="section-tag mb-5">brand narrative</p>
            <div className="space-y-6">
              {identityStatements.length > 0 && (
                <div className="space-y-3">
                  {identityStatements.map((s, i) => (
                    <p key={i} className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      &ldquo;{s}&rdquo;
                    </p>
                  ))}
                </div>
              )}
              {[
                { label: "mission", value: brand.mission_statement },
                { label: "differentiation", value: brand.differentiation_claim },
                { label: "origin", value: brand.origin_story },
                { label: "founder philosophy", value: brand.founder_philosophy },
              ]
                .filter((r) => r.value)
                .map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                      {label}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {value as string}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-6 py-6 mb-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <a
            href={`/api/brand/${brand.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link text-sm"
          >
            brand.md ↗
          </a>
          <Link href={`/audit/${brand.id}`} className="nav-link text-sm">
            audit report
          </Link>
          <Link href="/brands" className="nav-link text-sm">
            ← all brands
          </Link>
          <Link
            href="/questionnaire"
            className="nav-link text-sm ml-auto"
          >
            add your brand →
          </Link>
        </div>
      </main>

      <footer className="py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs">
          <Link href="/" className="nav-link">esina</Link>
          <div className="flex items-center gap-6">
            <Link href="/brands" className="nav-link">brands</Link>
            <Link href="/discover" className="nav-link">discover</Link>
            <Link href="/audits" className="nav-link">audits</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

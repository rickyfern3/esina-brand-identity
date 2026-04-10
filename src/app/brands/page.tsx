export const dynamic = "force-dynamic";
export const revalidate = 60;

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BrandsDirectoryPage() {
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select("id, brand_name, category, price_tier, archetypes, style_tags, status_signal_type, origin_location")
    .order("brand_name");

  const { data: audits } = await supabase
    .from("perception_audits")
    .select("brand_profile_id, identity_alignment_score")
    .order("created_at", { ascending: false });

  const auditMap = new Map<string, number>();
  for (const a of audits || []) {
    if (a.brand_profile_id && !auditMap.has(a.brand_profile_id)) {
      auditMap.set(a.brand_profile_id, a.identity_alignment_score);
    }
  }

  const totalBrands = (brands || []).length;
  const depopBrands = (brands || []).filter((b) => b.origin_location?.startsWith("depop:")).length;

  const byCategory = new Map<string, typeof brands>();
  for (const brand of brands || []) {
    const cat = brand.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(brand);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", background: "rgba(122,122,118,0.7)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-goldman text-white tracking-[3px] text-sm uppercase">
            ESINA
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/match" className="nav-link">match</Link>
            <Link href="/audits" className="nav-link">audits</Link>
            <Link href="/translate" className="nav-link">translate</Link>
            <Link href="/questionnaire" className="btn-primary px-4 py-2 text-xs inline-block">add brand</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-14 fade-up-1">
          <p className="section-tag mb-5">brand identity directory</p>
          <h1 className="font-goldman text-4xl text-white mb-4">
            every brand. machine-readable.
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            AI agents discover any brand&apos;s full identity profile by fetching its{" "}
            <code
              className="text-xs px-1.5 py-0.5"
              style={{ background: "rgba(0,0,0,0.25)", borderRadius: "2px", color: "rgba(255,255,255,0.7)", fontFamily: "'SF Mono', monospace" }}
            >
              brand.md
            </code>{" "}
            endpoint. {totalBrands} brands indexed.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-8">
            {[
              { label: "brands indexed", value: totalBrands },
              { label: "depop sellers", value: depopBrands },
              { label: "categories", value: byCategory.size },
            ].map((s) => (
              <div
                key={s.label}
                className="px-5 py-4"
                style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}
              >
                <p className="font-goldman text-2xl text-white">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* AI agent instruction */}
          <div
            className="mt-8 p-5"
            style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="section-tag mb-3">for ai agents</p>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
              each brand has a machine-readable identity profile at:
            </p>
            <div
              className="px-4 py-3 text-sm"
              style={{
                background: "rgba(0,0,0,0.25)",
                borderRadius: "2px",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              GET https://esina-brand-identity.vercel.app/api/brand/{"{"}brandId{"}"}
            </div>
          </div>
        </div>

        {/* Brand grid */}
        <div className="mb-6 flex items-center justify-between fade-up-2">
          <h2 className="font-goldman text-lg text-white">all brands</h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{totalBrands} profiles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 fade-up-3">
          {(brands || []).map((brand) => {
            const score = auditMap.get(brand.id);
            const archetypes = (brand.archetypes as { archetype: string; primary: boolean }[] | null) || [];
            const primaryArchetype = archetypes.find((a) => a.primary)?.archetype || archetypes[0]?.archetype;
            const styleTags = (brand.style_tags as string[] | null) || [];
            const isDepop = brand.origin_location?.startsWith("depop:");
            const depopUsername = isDepop ? brand.origin_location!.replace("depop:", "") : null;

            return (
              <div
                key={brand.id}
                className="p-5 group"
                style={{
                  background: "rgba(0,0,0,0.12)",
                  borderRadius: "2px",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.04)"; }}
              >
                {/* Brand header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-white mb-1 truncate">{brand.brand_name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {brand.category}
                      </p>
                      {brand.price_tier && (
                        <>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                          <p className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {brand.price_tier}
                          </p>
                        </>
                      )}
                      {isDepop && (
                        <>
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>depop</span>
                        </>
                      )}
                    </div>
                  </div>
                  {score !== undefined ? (
                    <span className="font-goldman text-sm text-white flex-shrink-0 ml-2">
                      {Math.round(score)}
                    </span>
                  ) : (
                    <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {primaryArchetype && (
                    <span
                      className="text-[11px] px-2 py-0.5"
                      style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.7)", textTransform: "capitalize" }}
                    >
                      {primaryArchetype}
                    </span>
                  )}
                  {styleTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5"
                      style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", color: "rgba(255,255,255,0.45)" }}
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    href={`/api/brand/${brand.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.55)", transition: "color 0.15s" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                  >
                    brand.md ↗
                  </a>
                  <Link href={`/audit/${brand.id}`} className="nav-link">
                    audit report
                  </Link>
                  {depopUsername && (
                    <a
                      href={`https://www.depop.com/${depopUsername}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link ml-auto"
                    >
                      depop ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div
          className="mt-14 p-10 text-center fade-up-4"
          style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}
        >
          <h3 className="font-goldman text-xl text-white mb-2">add your brand</h3>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            complete our identity questionnaire. we generate your ai perception audit, identity embedding, and a machine-readable brand.md — all automatically.
          </p>
          <Link href="/questionnaire" className="btn-primary px-6 py-3 text-sm inline-block">
            run your ai audit
          </Link>
        </div>
      </main>

      <footer className="py-8 mt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          <span>ESINA identity matching engine</span>
          <span>
            <code style={{ fontFamily: "monospace" }}>GET /api/brand/:id</code> · text/markdown · ai-crawlable
          </span>
        </div>
      </footer>
    </div>
  );
}

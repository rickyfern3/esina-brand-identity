export const dynamic = "force-dynamic";
export const revalidate = 60;

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function scoreRingColor(score: number): string {
  if (score >= 70) return "rgba(0,0,0,0.6)";
  if (score >= 45) return "rgba(0,0,0,0.4)";
  return "rgba(0,0,0,0.2)";
}

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
      {/* Sticky header */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          background: "rgba(122,122,118,0.75)",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-goldman text-white tracking-[3px] text-[28px] uppercase font-bold" style={{ fontWeight: 700 }}>
            esina
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/brands" className="nav-link">brands</Link>
            <Link href="/match" className="nav-link">match</Link>
            <Link href="/audits" className="nav-link">audits</Link>
            <Link href="/translate" className="nav-link">translate</Link>
            <Link href="/questionnaire" className="btn-primary px-4 py-2 text-xs inline-block">add brand</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="mb-12 fade-up-1">
          <h1 className="font-goldman text-5xl text-white mb-4" style={{ fontWeight: 700 }}>
            brand directory
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            machine-readable brand identity profiles for ai agents
          </p>

          {/* Stats row */}
          <div className="flex gap-4 mt-8">
            {[
              { label: "brands indexed", value: totalBrands },
              { label: "depop sellers", value: depopBrands },
              { label: "audited", value: Array.from(auditMap.keys()).length },
            ].map((s) => (
              <div
                key={s.label}
                className="px-5 py-4 card-dark"
              >
                <p className="font-goldman text-2xl text-white" style={{ fontWeight: 700 }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category sections */}
        {Array.from(byCategory.entries()).map(([category, categoryBrands], idx) => (
          <section key={category} className={`mb-12 ${idx === 0 ? "fade-up-2" : idx === 1 ? "fade-up-3" : idx === 2 ? "fade-up-4" : ""}`}>
            <div className="mb-5">
              <p className="section-tag-mid">{category.toLowerCase()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(categoryBrands || []).map((brand) => {
                const score = auditMap.get(brand.id);
                const archetypes = (brand.archetypes as { archetype: string; primary: boolean }[] | null) || [];
                const primaryArchetype = archetypes.find((a) => a.primary)?.archetype || archetypes[0]?.archetype;
                const styleTags = (brand.style_tags as string[] | null) || [];
                const isDepop = brand.origin_location?.startsWith("depop:");
                const depopUsername = isDepop ? brand.origin_location!.replace("depop:", "") : null;

                const radius = 18;
                const circumference = 2 * Math.PI * radius;
                const offset = score !== undefined ? circumference - (score / 100) * circumference : circumference;

                return (
                  <div
                    key={brand.id}
                    className="p-5 card-mid group"
                    style={{
                      transition: "border-color 0.15s ease",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.08)"; }}
                  >
                    {/* Brand header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm mb-1 truncate" style={{ color: "rgba(0,0,0,0.65)" }}>{brand.brand_name}</h3>
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

                      {/* Score ring */}
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
                            <span className="font-goldman text-[11px]" style={{ color: "rgba(0,0,0,0.7)", fontWeight: 700 }}>{Math.round(score)}</span>
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
                          className="text-[11px] px-2 py-0.5"
                          style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px", color: "rgba(0,0,0,0.35)", textTransform: "capitalize" }}
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

                    {/* Divider and actions */}
                    <div className="flex items-center gap-3 pt-3 text-xs" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <a
                        href={`/api/brand/${brand.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link-light"
                        style={{ transition: "color 0.15s" }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "rgba(0,0,0,0.6)"; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(0,0,0,0.25)"; }}
                      >
                        brand.md ↗
                      </a>
                      <Link href={`/audit/${brand.id}`} className="nav-link-light">
                        audit report
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="py-8 mt-12" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs">
          <Link href="/" className="nav-link-light">esina</Link>
          <div className="flex items-center gap-6">
            <Link href="/brands" className="nav-link-light">brands</Link>
            <Link href="/audits" className="nav-link-light">audits</Link>
            <Link href="/match" className="nav-link-light">match</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

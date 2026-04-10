export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function scoreRingColor(score: number): string {
  if (score >= 70) return "rgba(255,255,255,0.9)";
  if (score >= 45) return "rgba(255,255,255,0.65)";
  return "rgba(255,255,255,0.4)";
}

export default async function AuditsListPage() {
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select("id, brand_name, category")
    .order("brand_name");

  const { data: audits } = await supabase
    .from("perception_audits")
    .select("brand_profile_id, identity_alignment_score, aligned_dimensions, gap_dimensions, gap_details, created_at")
    .order("created_at", { ascending: false });

  type AuditRow = NonNullable<typeof audits>[number];
  const auditMap = new Map<string, AuditRow>();
  for (const a of audits || []) {
    if (a.brand_profile_id && !auditMap.has(a.brand_profile_id)) {
      auditMap.set(a.brand_profile_id, a);
    }
  }

  const auditedCount = [...auditMap.keys()].length;
  const totalBrands = (brands || []).length;
  const avgScore =
    auditedCount > 0
      ? Math.round(
          [...auditMap.values()].reduce(
            (sum, a) => sum + (a.identity_alignment_score || 0),
            0
          ) / auditedCount
        )
      : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", background: "rgba(122,122,118,0.7)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-goldman text-white tracking-[3px] text-sm uppercase">
            ESINA
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/brands" className="nav-link">brands</Link>
            <Link href="/match" className="nav-link">match</Link>
            <Link href="/translate" className="nav-link">translate</Link>
            <Link href="/questionnaire" className="btn-primary px-4 py-2 text-xs inline-block">add brand</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-14 fade-up-1">
          <p className="section-tag mb-5">perception audits</p>
          <h1 className="font-goldman text-4xl text-white mb-4">
            how ai sees your brand
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            every audit compares how a brand defines itself against how ai perceives it. the gap is where identity signal is lost.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-8">
            {[
              { label: "brands audited", value: auditedCount },
              { label: "total brands", value: totalBrands },
              { label: "avg alignment", value: avgScore },
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
        </div>

        {/* Grid */}
        <div className="mb-6 flex items-center justify-between fade-up-2">
          <h2 className="font-goldman text-lg text-white">all audits</h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{auditedCount} audits completed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 fade-up-3">
          {(brands || []).map((brand) => {
            const audit = auditMap.get(brand.id);
            const score = audit?.identity_alignment_score ?? null;
            const oneSentence = audit?.gap_details?.oneSentenceDescription || null;
            const alignedCount = (audit?.aligned_dimensions || []).length;
            const gapCount = (audit?.gap_dimensions || []).length;
            const missingCount = (audit?.gap_details?.missingDimensions || []).length;

            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const offset = score !== null ? circumference - (score / 100) * circumference : circumference;

            return (
              <Link
                key={brand.id}
                href={`/audit/${brand.id}`}
                className="p-5 block group"
                style={{
                  background: "rgba(0,0,0,0.12)",
                  borderRadius: "2px",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={undefined}
                onMouseLeave={undefined}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-sm text-white mb-1 truncate">{brand.brand_name}</h3>
                    <p className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {brand.category}
                    </p>
                  </div>

                  {/* Mini score ring */}
                  {score !== null ? (
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                        <circle
                          cx="22" cy="22" r={radius} fill="none"
                          stroke={scoreRingColor(score)}
                          strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={circumference} strokeDashoffset={offset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-goldman text-[11px] text-white">{Math.round(score)}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                  )}
                </div>

                {oneSentence && (
                  <p className="text-[11px] mb-3 leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    &ldquo;{oneSentence}&rdquo;
                  </p>
                )}

                {score !== null && (
                  <div className="flex gap-4 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    <span style={{ color: "rgba(255,255,255,0.65)" }}>{alignedCount} aligned</span>
                    <span>{gapCount} gaps</span>
                    <span style={{ color: "rgba(252,165,165,0.6)" }}>{missingCount} missing</span>
                  </div>
                )}

                {score === null && (
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>no audit yet</p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div
          className="mt-14 p-10 text-center fade-up-4"
          style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}
        >
          <h3 className="font-goldman text-xl text-white mb-2">audit your brand</h3>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            complete the identity questionnaire. we run the ai perception audit automatically and show you where your signal is lost.
          </p>
          <Link href="/questionnaire" className="btn-primary px-6 py-3 text-sm inline-block">
            run your audit
          </Link>
        </div>
      </main>

      <footer className="py-8 mt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          <span>ESINA perception audits</span>
          <span>identity alignment · gap analysis</span>
        </div>
      </footer>
    </div>
  );
}

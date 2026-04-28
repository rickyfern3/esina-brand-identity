export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import { CopyButton } from "../../components/CopyButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DimensionResult {
  dimension: string;
  maxPoints: number;
  earnedPoints: number;
  status: "aligned" | "gap" | "missing";
  selfReported: string;
  aiPerceived: string;
  detail: string;
}

function statusStyle(status: string) {
  switch (status) {
    case "aligned":
      return {
        bg: "rgba(255,255,255,0.15)",
        border: "rgba(255,255,255,0.6)",
        badgeBg: "rgba(255,255,255,0.2)",
        badgeColor: "rgba(255,255,255,0.9)",
        barColor: "rgba(255,255,255,0.75)",
        label: "aligned",
      };
    case "gap":
      return {
        bg: "rgba(0,0,0,0.12)",
        border: "rgba(255,255,255,0.1)",
        badgeBg: "rgba(255,255,255,0.08)",
        badgeColor: "rgba(255,255,255,0.65)",
        barColor: "rgba(255,255,255,0.45)",
        label: "gap",
      };
    case "missing":
      return {
        bg: "rgba(0,0,0,0.15)",
        border: "rgba(220,38,38,0.3)",
        badgeBg: "rgba(220,38,38,0.15)",
        badgeColor: "rgba(252,165,165,0.8)",
        barColor: "rgba(220,38,38,0.5)",
        label: "missing",
      };
    default:
      return {
        bg: "rgba(0,0,0,0.12)",
        border: "rgba(255,255,255,0.08)",
        badgeBg: "rgba(255,255,255,0.08)",
        badgeColor: "rgba(255,255,255,0.45)",
        barColor: "rgba(255,255,255,0.3)",
        label: "unknown",
      };
  }
}

function scoreRingColor(score: number): string {
  if (score >= 70) return "rgba(255,255,255,0.9)";
  if (score >= 45) return "rgba(255,255,255,0.65)";
  return "rgba(255,255,255,0.35)";
}

export default async function AuditReportPage({
  params,
}: {
  params: { brandId: string };
}) {
  const { brandId } = params;

  const { data: brand, error: brandErr } = await supabase
    .from("brand_profiles")
    .select("id, brand_name, category, identity_text")
    .eq("id", brandId)
    .single();

  const { data: audit, error: auditErr } = await supabase
    .from("perception_audits")
    .select("*")
    .eq("brand_profile_id", brandId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (brandErr || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-goldman text-2xl text-white mb-2">brand not found</h1>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>{brandErr?.message}</p>
          <Link href="/" className="nav-link text-sm">← back</Link>
        </div>
      </div>
    );
  }

  if (auditErr || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-goldman text-2xl text-white mb-2">no audit found for {brand.brand_name}</h1>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>run the audit first.</p>
          <Link href="/" className="nav-link text-sm">← back</Link>
        </div>
      </div>
    );
  }

  const dimensions: DimensionResult[] = audit.gap_details?.dimensions || [];
  const oneSentence: string = audit.gap_details?.oneSentenceDescription || "No description available.";
  const recommendations: string[] = audit.recommendations || [];
  const score: number = audit.identity_alignment_score || 0;
  const alignedCount = (audit.aligned_dimensions || []).length;
  const gapCount = (audit.gap_dimensions || []).length;
  const missingCount = (audit.gap_details?.missingDimensions || []).length;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen">
      <NavBar links={[{ href: "/audits", label: "← all audits" }]} />

      <main className="max-w-6xl mx-auto px-6 fade-up-1" style={{ paddingTop: "100px" }}>
        {/* Brand header */}
        <div className="mb-12">
          <p className="section-tag mb-4">audit report</p>
          <h1 className="font-goldman text-4xl text-white mb-1">{brand.brand_name}</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{brand.category}</p>
        </div>

        {/* Score + Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          {/* Score ring */}
          <div
            className="p-8 flex flex-col items-center justify-center card-dark"
            style={{ borderRadius: "2px" }}
          >
            <p className="section-tag mb-6">identity alignment</p>
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r={radius} fill="none"
                  stroke={scoreRingColor(score)}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-goldman text-4xl text-white">{Math.round(score)}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/ 100</span>
              </div>
            </div>
            <div className="flex gap-5 mt-6 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span>{alignedCount} aligned</span>
              <span>{gapCount} gaps</span>
              <span>{missingCount} missing</span>
            </div>
          </div>

          {/* AI description */}
          <div
            className="lg:col-span-2 p-8 flex flex-col justify-between card-dark"
            style={{ borderRadius: "2px" }}
          >
            <div>
              <p className="section-tag mb-4">how ai describes this brand</p>
              <p className="text-lg text-white leading-relaxed">
                &ldquo;{oneSentence}&rdquo;
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {(audit.perceived_strengths || []).map((s: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "2px",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-10" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

        {/* Dimension cards */}
        <div className="mb-10">
          <h2 className="font-goldman text-lg text-white mb-6">dimension-by-dimension</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dimensions.map((dim: DimensionResult, i: number) => {
              const c = statusStyle(dim.status);
              const pct = Math.round((dim.earnedPoints / dim.maxPoints) * 100);
              return (
                <div
                  key={i}
                  className="p-5 card-mid"
                  style={{ borderRadius: "2px", border: `1px solid ${c.border}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm" style={{ color: "rgba(0,0,0,0.7)" }}>{dim.dimension}</h3>
                    <span
                      className="text-[10px] px-2 py-0.5"
                      style={{ background: c.badgeBg, color: c.badgeColor, borderRadius: "2px", letterSpacing: "0.05em" }}
                    >
                      {c.label}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="h-px mb-3 overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ width: `${pct}%`, height: "1px", background: "rgba(0,0,0,0.2)" }} />
                  </div>
                  <p className="text-[11px] mb-3" style={{ color: "rgba(0,0,0,0.4)" }}>
                    {dim.earnedPoints} / {dim.maxPoints}
                  </p>

                  {/* Self vs AI */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "rgba(0,0,0,0.4)", letterSpacing: "0.08em" }}>
                        self-reported
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.65)" }}>
                        {typeof dim.selfReported === "string" ? dim.selfReported : JSON.stringify(dim.selfReported)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] mb-0.5" style={{ color: "rgba(0,0,0,0.4)", letterSpacing: "0.08em" }}>
                        ai perceives
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.65)" }}>
                        {typeof dim.aiPerceived === "string" ? dim.aiPerceived : JSON.stringify(dim.aiPerceived)}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "rgba(0,0,0,0.4)" }}>
                    {dim.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="p-8 mb-8 card-mid" style={{ borderRadius: "2px" }}>
            <h2 className="font-goldman text-lg mb-6" style={{ color: "rgba(0,0,0,0.75)" }}>recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="font-goldman text-sm flex-shrink-0 mt-0.5" style={{ color: "rgba(0,0,0,0.35)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.35)" }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {audit.perceived_weaknesses?.length > 0 && (
          <div className="p-8 mb-8 card-mid" style={{ borderRadius: "2px" }}>
            <h2 className="font-goldman text-lg mb-4" style={{ color: "rgba(0,0,0,0.75)" }}>ai-perceived gaps</h2>
            <div className="flex flex-wrap gap-2">
              {audit.perceived_weaknesses.map((w: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1"
                  style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Install embed */}
        <div className="p-8 mb-8 card-mid" style={{ borderRadius: "2px", border: "1px solid rgba(0,0,0,0.08)" }}>
          <p className="section-tag-mid mb-4">make your brand findable</p>
          <h2 className="font-goldman text-lg mb-2" style={{ color: "rgba(0,0,0,0.75)" }}>
            Paste this one line into your website settings.
          </h2>
          <p className="text-sm mb-5" style={{ color: "rgba(0,0,0,0.4)" }}>
            That&apos;s all it takes. AI agents will start finding your brand immediately.
          </p>
          <div
            className="code-mid px-5 py-4 text-xs leading-relaxed mb-4"
            style={{
              borderRadius: "2px",
              color: "rgba(0,0,0,0.65)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              overflowX: "auto",
              wordBreak: "break-all",
            }}
          >
            {`<script async src="https://esina.app/api/esina.js?brand=${brandId}"></script>`}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <CopyButton
              text={`<script async src="https://esina.app/api/esina.js?brand=${brandId}"></script>`}
              size="sm"
            />
            <Link
              href={`/onboard`}
              className="text-xs"
              style={{ color: "rgba(0,0,0,0.4)", textDecoration: "underline" }}
            >
              view step-by-step install guide →
            </Link>
          </div>
        </div>

        {/* Back */}
        <div className="text-center py-4">
          <Link href="/" className="nav-link-light text-sm">← home</Link>
        </div>
      </main>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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

// ── Color / status helpers ───────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case "aligned":
      return {
        bg: "bg-emerald-950/40",
        border: "border-emerald-800/50",
        badge: "bg-emerald-900/60 text-emerald-300",
        bar: "from-emerald-600 to-emerald-400",
        label: "Aligned",
      };
    case "gap":
      return {
        bg: "bg-amber-950/30",
        border: "border-amber-800/40",
        badge: "bg-amber-900/60 text-amber-300",
        bar: "from-amber-600 to-amber-400",
        label: "Gap",
      };
    case "missing":
      return {
        bg: "bg-red-950/30",
        border: "border-red-800/40",
        badge: "bg-red-900/60 text-red-300",
        bar: "from-red-600 to-red-400",
        label: "Missing",
      };
    default:
      return {
        bg: "bg-zinc-900/50",
        border: "border-zinc-800",
        badge: "bg-zinc-800 text-zinc-400",
        bar: "from-zinc-600 to-zinc-400",
        label: "Unknown",
      };
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

function scoreRingColor(score: number): string {
  if (score >= 70) return "#34d399";
  if (score >= 45) return "#fbbf24";
  return "#f87171";
}

// ── Page ─────────────────────────────────────────────────────────────

export default async function AuditReportPage({
  params,
}: {
  params: { brandId: string };
}) {
  const { brandId } = params;

  // Fetch brand profile
  const { data: brand, error: brandErr } = await supabase
    .from("brand_profiles")
    .select("id, brand_name, category, identity_text")
    .eq("id", brandId)
    .single();

  // Fetch latest audit
  const { data: audit, error: auditErr } = await supabase
    .from("perception_audits")
    .select("*")
    .eq("brand_profile_id", brandId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (brandErr || !brand) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Brand not found</h1>
          <p className="text-zinc-500 mb-6">{brandErr?.message}</p>
          <Link href="/match" className="text-esina-400 hover:underline text-sm">
            Back to matching demo
          </Link>
        </div>
      </div>
    );
  }

  if (auditErr || !audit) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            No audit found for {brand.brand_name}
          </h1>
          <p className="text-zinc-500 mb-6">
            Run the audit first to generate the perception report.
          </p>
          <Link href="/match" className="text-esina-400 hover:underline text-sm">
            Back to matching demo
          </Link>
        </div>
      </div>
    );
  }

  const dimensions: DimensionResult[] = audit.gap_details?.dimensions || [];
  const oneSentence: string =
    audit.gap_details?.oneSentenceDescription || "No description available.";
  const recommendations: string[] = audit.recommendations || [];
  const score: number = audit.identity_alignment_score || 0;
  const alignedCount = (audit.aligned_dimensions || []).length;
  const gapCount = (audit.gap_dimensions || []).length;
  const missingCount = (audit.gap_details?.missingDimensions || []).length;

  // SVG ring parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/match" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              ESINA
            </span>
          </Link>
          <span className="text-xs text-zinc-500 uppercase tracking-widest">
            AI Perception Audit
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Brand header */}
        <div className="mb-10">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
            Audit Report
          </p>
          <h1 className="text-3xl font-bold text-white mb-1">{brand.brand_name}</h1>
          <p className="text-zinc-400">{brand.category}</p>
        </div>

        {/* Score + AI Description row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Score ring */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
              Identity Alignment
            </p>
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={scoreRingColor(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor(score)}`}>
                  {Math.round(score)}
                </span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
            </div>
            <div className="flex gap-4 mt-5 text-xs">
              <span className="text-emerald-400">{alignedCount} aligned</span>
              <span className="text-amber-400">{gapCount} gaps</span>
              <span className="text-red-400">{missingCount} missing</span>
            </div>
          </div>

          {/* AI one-sentence description */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                How AI describes this brand
              </p>
              <p className="text-xl text-white leading-relaxed font-light">
                &ldquo;{oneSentence}&rdquo;
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {(audit.perceived_strengths || []).map((s: string, i: number) => (
                <span
                  key={i}
                  className="text-xs bg-esina-950/40 text-esina-300 border border-esina-800/30 px-2.5 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dimension cards */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-5">
            Dimension-by-Dimension Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dimensions.map((dim: DimensionResult, i: number) => {
              const c = statusColor(dim.status);
              const pct = Math.round((dim.earnedPoints / dim.maxPoints) * 100);
              return (
                <div
                  key={i}
                  className={`${c.bg} border ${c.border} rounded-xl p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">
                      {dim.dimension}
                    </h3>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}
                    >
                      {c.label}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    {dim.earnedPoints} / {dim.maxPoints} points
                  </p>

                  {/* Self vs AI */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Self-reported
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {typeof dim.selfReported === "string" ? dim.selfReported : JSON.stringify(dim.selfReported)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        AI perceives
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {typeof dim.aiPerceived === "string" ? dim.aiPerceived : JSON.stringify(dim.aiPerceived)}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">
                    {dim.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-10">
            <h2 className="text-lg font-semibold text-white mb-5">
              Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-esina-400 text-sm mt-0.5 font-mono">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perceived weaknesses */}
        {audit.perceived_weaknesses?.length > 0 && (
          <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-8 mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">
              AI-Perceived Weaknesses
            </h2>
            <div className="flex flex-wrap gap-2">
              {audit.perceived_weaknesses.map((w: string, i: number) => (
                <span
                  key={i}
                  className="text-xs bg-red-950/30 text-red-300 border border-red-800/30 px-2.5 py-1 rounded-full"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center py-6">
          <Link
            href="/match"
            className="text-sm text-zinc-500 hover:text-esina-400 transition-colors"
          >
            &larr; Back to matching demo
          </Link>
        </div>
      </main>
    </div>
  );
}

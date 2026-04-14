export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-950/40 border-emerald-800/40";
  if (score >= 45) return "bg-amber-950/30 border-amber-800/40";
  return "bg-red-950/30 border-red-800/40";
}

export default async function AuditsListPage() {
  // Fetch all brands
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select("id, brand_name, category")
    .order("brand_name");

  // Fetch latest audit per brand
  const { data: audits } = await supabase
    .from("perception_audits")
    .select("brand_profile_id, identity_alignment_score, aligned_dimensions, gap_dimensions, gap_details, created_at")
    .order("created_at", { ascending: false });

  // Build map of latest audit per brand
  type AuditRow = NonNullable<typeof audits>[number];
  const auditMap = new Map<string, AuditRow>();
  for (const a of audits || []) {
    if (a.brand_profile_id && !auditMap.has(a.brand_profile_id)) {
      auditMap.set(a.brand_profile_id, a);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
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
            Perception Audits
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Brand Perception Audits
            </h1>
            <p className="text-zinc-400">
              How AI perceives each brand vs. how they define themselves.
            </p>
          </div>
          <Link
            href="/questionnaire"
            className="flex-shrink-0 px-4 py-2.5 bg-violet-700 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Audit Your Brand
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(brands || []).map((brand) => {
            const audit = auditMap.get(brand.id);
            const score = audit?.identity_alignment_score ?? null;
            const oneSentence =
              audit?.gap_details?.oneSentenceDescription || null;
            const alignedCount = (audit?.aligned_dimensions || []).length;
            const gapCount = (audit?.gap_dimensions || []).length;
            const missingCount = (audit?.gap_details?.missingDimensions || []).length;

            return (
              <Link
                key={brand.id}
                href={`/audit/${brand.id}`}
                className={`border rounded-xl p-5 transition-all hover:scale-[1.01] ${
                  score !== null
                    ? scoreBg(score)
                    : "bg-zinc-900/50 border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">
                      {brand.brand_name}
                    </h3>
                    <p className="text-xs text-zinc-500">{brand.category}</p>
                  </div>
                  {score !== null ? (
                    <span className={`text-2xl font-bold ${scoreColor(score)}`}>
                      {Math.round(score)}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">No audit</span>
                  )}
                </div>

                {oneSentence && (
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    &ldquo;{oneSentence}&rdquo;
                  </p>
                )}

                {score !== null && (
                  <div className="flex gap-3 mt-3 text-[11px]">
                    <span className="text-emerald-400">{alignedCount} aligned</span>
                    <span className="text-amber-400">{gapCount} gaps</span>
                    <span className="text-red-400">{missingCount} missing</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="text-center py-8">
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

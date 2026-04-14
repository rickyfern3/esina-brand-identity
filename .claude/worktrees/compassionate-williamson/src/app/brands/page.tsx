export const dynamic = "force-dynamic";
export const revalidate = 60; // re-fetch from Supabase at most once per minute

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Helpers ─────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-rose-400";
}

function scoreDot(score: number): string {
  if (score >= 70) return "bg-emerald-400";
  if (score >= 45) return "bg-amber-400";
  return "bg-rose-400";
}

function categoryIcon(category: string): string {
  const map: Record<string, string> = {
    "Fashion": "👗",
    "vintage": "🧥",
    "jewelry": "💍",
    "accessories": "👜",
    "Food & Beverage": "🍶",
    "Beauty & Personal Care": "✨",
    "Health & Wellness": "🌿",
    "Home & Lifestyle": "🏡",
    "Tech & Accessories": "⚡",
  };
  for (const [key, icon] of Object.entries(map)) {
    if (category?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "◆";
}

// ── Page ────────────────────────────────────────────────────────────────

export default async function BrandsDirectoryPage() {
  // Fetch all brand profiles
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select(
      "id, brand_name, category, price_tier, archetypes, style_tags, status_signal_type, origin_location"
    )
    .order("brand_name");

  // Fetch latest audit score per brand
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
  const depopBrands = (brands || []).filter(
    (b) => b.origin_location?.startsWith("depop:")
  ).length;

  // Group by category
  const byCategory = new Map<string, typeof brands>();
  for (const brand of brands || []) {
    const cat = brand.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(brand);
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">ESINA</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/match" className="hover:text-white transition-colors">Match</Link>
            <Link href="/audits" className="hover:text-white transition-colors">Audits</Link>
            <Link href="/translate" className="hover:text-white transition-colors">Translate</Link>
            <Link
              href="/questionnaire"
              className="px-3 py-1.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg transition-colors"
            >
              Add Brand
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs text-violet-400 uppercase tracking-widest mb-3 font-medium">
            Brand Identity Directory
          </p>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Every brand. Machine-readable.
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            AI agents can discover any brand&apos;s full identity profile by fetching its{" "}
            <code className="text-violet-300 bg-violet-950/40 px-1.5 py-0.5 rounded text-sm">brand.md</code>{" "}
            endpoint. {totalBrands} brands indexed. {depopBrands} from Depop.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-8">
            {[
              { label: "Brands indexed", value: totalBrands },
              { label: "Depop sellers", value: depopBrands },
              { label: "Categories", value: byCategory.size },
            ].map((s) => (
              <div key={s.label} className="border border-zinc-800 rounded-xl px-5 py-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* AI agent instruction box */}
          <div className="mt-8 border border-violet-800/30 bg-violet-950/20 rounded-xl p-5">
            <p className="text-xs text-violet-400 uppercase tracking-widest mb-2 font-medium">
              For AI Agents
            </p>
            <p className="text-sm text-zinc-300 mb-3">
              Each brand has a machine-readable identity profile at:
            </p>
            <code className="block text-sm text-violet-200 bg-zinc-900 rounded-lg px-4 py-3 border border-zinc-800">
              GET https://esina-brand-identity.vercel.app/api/brand/{"{"}brandId{"}"}
            </code>
            <p className="text-xs text-zinc-500 mt-3">
              The response is <code className="text-zinc-400">text/markdown</code> with structured archetypes,
              values, style tags, communities, and explicit matching instructions. Every response
              embeds a unique <code className="text-zinc-400">esina_token</code> for attribution tracking.
            </p>
          </div>
        </div>

        {/* Brand grid — all brands */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">All Brands</h2>
          <p className="text-sm text-zinc-500">{totalBrands} profiles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(brands || []).map((brand) => {
            const score = auditMap.get(brand.id);
            const archetypes = (
              brand.archetypes as { archetype: string; primary: boolean }[] | null
            ) || [];
            const primaryArchetype = archetypes.find((a) => a.primary)?.archetype
              || archetypes[0]?.archetype;
            const styleTags = (brand.style_tags as string[] | null) || [];
            const isDepop = brand.origin_location?.startsWith("depop:");
            const depopUsername = isDepop
              ? brand.origin_location!.replace("depop:", "")
              : null;

            return (
              <div
                key={brand.id}
                className="group border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-xl p-5 transition-all"
              >
                {/* Brand header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{categoryIcon(brand.category)}</span>
                      <h3 className="text-white font-semibold text-sm truncate">
                        {brand.brand_name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-zinc-500 capitalize">
                        {brand.category}
                      </p>
                      {brand.price_tier && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <p className="text-xs text-zinc-600 capitalize">
                            {brand.price_tier}
                          </p>
                        </>
                      )}
                      {isDepop && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-xs text-violet-400">Depop</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Alignment score */}
                  {score !== undefined ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${scoreDot(score)}`} />
                      <span className={`text-sm font-bold ${scoreColor(score)}`}>
                        {Math.round(score)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-700">—</span>
                  )}
                </div>

                {/* Archetype + style tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {primaryArchetype && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-violet-800/50 text-violet-300 bg-violet-950/30 capitalize">
                      {primaryArchetype}
                    </span>
                  )}
                  {styleTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-700/50 text-zinc-400 bg-zinc-800/30"
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                {/* Action links */}
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60">
                  <a
                    href={`/api/brand/${brand.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                  >
                    brand.md ↗
                  </a>
                  <Link
                    href={`/audit/${brand.id}`}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Audit report
                  </Link>
                  {depopUsername && (
                    <a
                      href={`https://www.depop.com/${depopUsername}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors ml-auto"
                    >
                      Depop ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 border border-zinc-800 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Add your brand</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            Complete our 7-step identity questionnaire. We generate your AI perception audit,
            identity embedding, and a machine-readable brand.md profile — all automatically.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors"
          >
            Run Your AI Audit →
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800/60 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>ESINA Identity Matching Engine</span>
          <span>
            <code>GET /api/brand/:id</code> · <code>text/markdown</code> · AI-crawlable
          </span>
        </div>
      </footer>
    </div>
  );
}

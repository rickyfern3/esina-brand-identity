"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────

interface SchemaCandidateRow {
  id: string;
  candidate_name: string;
  candidate_type: string;
  definition: string;
  confidence_score: number;
  sample_count: number;
  evidence_count: number;
  first_detected: string;
  last_updated: string;
  status: string;
  approved_at: string | null;
}

interface SchemaEvolutionData {
  generated_at: string;
  total_converted_analyzed: number;
  novel_traits_detected: number;
  qualified_candidates: number;
  emerging_clusters: Array<{
    combo: string[];
    count: number;
    event_ids: string[];
  }>;
  all_candidates: SchemaCandidateRow[];
}

interface IdentityTrendsData {
  generated_at: string;
  summary: {
    total_match_events: number;
    total_converted: number;
    overall_conversion_rate_pct: number;
    unique_archetypes: number;
    unique_values: number;
    unique_style_tags: number;
  };
  archetype_conversion_rates: Array<{
    archetype: string;
    total: number;
    converted: number;
    conversion_rate: number;
  }>;
  value_purchase_correlations: Array<{
    value: string;
    total: number;
    converted: number;
    conversion_rate: number;
    lift: number;
  }>;
  trending_style_tags: Array<{
    tag: string;
    this_week: number;
    last_week: number;
    trend_pct: number;
  }>;
  archetype_category_matrix: Array<{
    archetype: string;
    category: string;
    total: number;
    converted: number;
    conversion_rate: number;
  }>;
  top_converting_identity_dimensions: {
    total_converted: number;
    top_archetypes: Array<{ archetype: string; count: number }>;
    top_values: Array<{ value: string; count: number }>;
    top_style_tags: Array<{ tag: string; count: number }>;
  };
}

// ── Small UI helpers ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", padding: "16px 20px" }}>
      <p className="section-tag mb-1">{label}</p>
      <p className="font-goldman text-2xl text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-goldman text-sm text-white mb-4">
      {children}
    </h2>
  );
}

/** Horizontal bar for a single row, value 0–100 (%) */
function ConversionBar({
  label,
  rate,
  total,
  converted,
  maxRate,
  color = "esina",
}: {
  label: string;
  rate: number;
  total: number;
  converted: number;
  maxRate: number;
  color?: "esina" | "amber" | "emerald";
}) {
  const pct = maxRate > 0 ? (rate / maxRate) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-28 text-sm capitalize truncate flex-shrink-0" style={{ color: "rgba(255,255,255,0.65)" }} title={label}>
        {label}
      </div>
      <div className="flex-1 flex items-center gap-1" style={{ background: "rgba(255,255,255,0.08)", height: "1px" }}>
        <div
          style={{ height: "1px", background: "rgba(255,255,255,0.7)", width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <div className="font-goldman text-sm w-14 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.7)" }}>
        {rate}%
      </div>
      <div className="text-xs w-20 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
        {converted}/{total}
      </div>
    </div>
  );
}

function TrendBadge({ pct }: { pct: number }) {
  if (pct > 0) {
    return (
      <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.8)", fontSize: "11px", padding: "2px 6px", letterSpacing: "0.02em" }}>
        ↑ {pct}%
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span style={{ background: "rgba(220,38,38,0.15)", borderRadius: "2px", color: "rgba(255,255,255,0.8)", fontSize: "11px", padding: "2px 6px", letterSpacing: "0.02em" }}>
        ↓ {Math.abs(pct)}%
      </span>
    );
  }
  return (
    <span style={{ background: "rgba(0,0,0,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.3)", fontSize: "11px", padding: "2px 6px" }}>
      —
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [data, setData] = useState<IdentityTrendsData | null>(null);
  const [schemaData, setSchemaData] = useState<SchemaEvolutionData | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemaEvolution = useCallback(async (key: string) => {
    setSchemaLoading(true);
    try {
      const res = await fetch("/api/analytics/schema-evolution", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        const json: SchemaEvolutionData = await res.json();
        setSchemaData(json);
      }
    } catch {
      // Schema evolution is supplementary — don't block the dashboard
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  const handleCandidateAction = useCallback(async (candidateId: string, action: "approve" | "reject") => {
    setApproving(candidateId);
    try {
      const res = await fetch("/api/analytics/schema-evolution/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ candidate_id: candidateId, action }),
      });
      if (res.ok) {
        // Refresh schema data after action
        await fetchSchemaEvolution(apiKey);
      }
    } catch {
      // silent — user can retry
    } finally {
      setApproving(null);
    }
  }, [apiKey, fetchSchemaEvolution]);

  const fetchData = useCallback(
    async (key: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics/identity-trends", {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json: IdentityTrendsData = await res.json();
        setData(json);
        setApiKey(key);
        // Also fetch schema evolution data
        fetchSchemaEvolution(key);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [fetchSchemaEvolution]
  );

  // ── Auth gate ─────────────────────────────────────────────────────────

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #7A7A76 0%, #B0B0AC 100%)" }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">ESINA Analytics</p>
              <p className="text-xs text-zinc-500">Identity Intelligence Dashboard</p>
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-6">
            <p className="text-sm text-zinc-400 mb-4">Enter your ESINA API key to access analytics.</p>
            <label className="block text-xs text-zinc-500 mb-1.5">API Key</label>
            <input
              type="password"
              style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "white" }}
              className="w-full px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none mb-4"
              placeholder="esina_..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputKey.trim()) fetchData(inputKey.trim());
              }}
            />
            {error && (
              <p style={{ color: "rgba(252,165,165,0.8)", fontSize: "12px" }} className="mb-3">{error}</p>
            )}
            <button
              onClick={() => fetchData(inputKey.trim())}
              disabled={!inputKey.trim() || loading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loading ? "Loading…" : "View Analytics"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7A7A76 0%, #B0B0AC 100%)" }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-3" style={{ border: "1px solid rgba(255,255,255,0.15)", borderTop: "1px solid rgba(255,255,255,0.8)" }} />
          <p className="text-sm text-zinc-500">Computing identity trends…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, archetype_conversion_rates, value_purchase_correlations, trending_style_tags, archetype_category_matrix, top_converting_identity_dimensions } = data;

  const maxArchetypeRate = Math.max(...archetype_conversion_rates.map((r) => r.conversion_rate), 1);
  const maxValueRate = Math.max(...value_purchase_correlations.map((v) => v.conversion_rate), 1);

  const generatedAt = new Date(data.generated_at).toLocaleString();

  // ── Dashboard ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #7A7A76 0%, #B0B0AC 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", background: "rgba(122,122,118,0.7)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/match" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-goldman text-white tracking-[3px] text-sm uppercase">ESINA Analytics</span>
            </Link>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500">Identity Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600">Updated {generatedAt}</span>
            <button
              onClick={() => fetchData(apiKey)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Refresh
            </button>
            <button
              onClick={() => { setApiKey(""); setData(null); }}
              style={{ color: "rgba(255,255,255,0.35)", cursor: "pointer" }}
              className="text-xs transition-colors hover:text-zinc-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Summary stats */}
        <section>
          <SectionTitle>Overview</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Total Matches"
              value={summary.total_match_events.toLocaleString()}
            />
            <StatCard
              label="Converted"
              value={summary.total_converted.toLocaleString()}
            />
            <StatCard
              label="Conversion Rate"
              value={`${summary.overall_conversion_rate_pct}%`}
            />
            <StatCard
              label="Archetypes"
              value={summary.unique_archetypes}
            />
            <StatCard
              label="Identity Values"
              value={summary.unique_values}
            />
            <StatCard
              label="Style Tags"
              value={summary.unique_style_tags}
            />
          </div>
        </section>

        {/* Two-column: Archetype conversion + Value correlations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Archetype conversion rates */}
          <section style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-6">
            <SectionTitle>Conversion Rate by Archetype</SectionTitle>
            {archetype_conversion_rates.length === 0 ? (
              <p className="text-sm text-zinc-600">No data yet.</p>
            ) : (
              <div className="space-y-0.5">
                {archetype_conversion_rates.slice(0, 12).map((row) => (
                  <ConversionBar
                    key={row.archetype}
                    label={row.archetype}
                    rate={row.conversion_rate}
                    total={row.total}
                    converted={row.converted}
                    maxRate={maxArchetypeRate}
                    color="esina"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Value-purchase correlations */}
          <section style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-6">
            <SectionTitle>Value → Purchase Lift</SectionTitle>
            <p className="text-xs text-zinc-600 mb-4">
              Lift = how much more likely a consumer with this value is to convert vs. baseline.
            </p>
            {value_purchase_correlations.length === 0 ? (
              <p className="text-sm text-zinc-600">No data yet.</p>
            ) : (
              <div className="space-y-0.5">
                {value_purchase_correlations.slice(0, 12).map((row) => (
                  <ConversionBar
                    key={row.value}
                    label={row.value}
                    rate={row.conversion_rate}
                    total={row.total}
                    converted={row.converted}
                    maxRate={maxValueRate}
                    color="amber"
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Trending style tags */}
        <section style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-6">
          <SectionTitle>Trending Style Tags (Week-over-Week)</SectionTitle>
          {trending_style_tags.length === 0 ? (
            <p className="text-sm text-zinc-600">No data yet — tags will appear after a week of activity.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {trending_style_tags.slice(0, 24).map((row) => (
                <div
                  key={row.tag}
                  style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}
                  className="p-3 flex items-center justify-between gap-2"
                >
                  <span className="text-sm capitalize truncate" title={row.tag} style={{ color: "rgba(255,255,255,0.65)" }}>
                    {row.tag}
                  </span>
                  <TrendBadge pct={row.trend_pct} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Archetype × Category matrix */}
        <section style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-6">
          <SectionTitle>Archetype × Category Conversion Matrix</SectionTitle>
          {archetype_category_matrix.length === 0 ? (
            <p className="text-sm text-zinc-600">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", letterSpacing: "0.1em" }}>
                    <th className="pb-3 pr-4 font-medium">Archetype</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium text-right">Total</th>
                    <th className="pb-3 pr-4 font-medium text-right">Converted</th>
                    <th className="pb-3 font-medium text-right">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody style={{ borderColor: "rgba(255,255,255,0.06)" }} className="divide-y">
                  {archetype_category_matrix.slice(0, 20).map((row, i) => (
                    <tr key={i} style={{ background: "rgba(255,255,255,0.04)" }} className="transition-colors">
                      <td className="py-2.5 pr-4 text-white capitalize font-medium">{row.archetype}</td>
                      <td className="py-2.5 pr-4 capitalize" style={{ color: "rgba(255,255,255,0.65)" }}>{row.category}</td>
                      <td className="py-2.5 pr-4 text-right" style={{ color: "rgba(255,255,255,0.65)" }}>{row.total}</td>
                      <td className="py-2.5 pr-4 text-right" style={{ color: "rgba(255,255,255,0.65)" }}>{row.converted}</td>
                      <td className="py-2.5 text-right font-goldman" style={{ color: row.conversion_rate >= 20 ? "rgba(255,255,255,0.9)" : row.conversion_rate >= 10 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)" }}>
                        {row.conversion_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Top converting identity dimensions */}
        <section>
          <SectionTitle>
            Top Identity Dimensions in Converted Consumers
            <span className="ml-2 text-zinc-600 normal-case font-normal">
              ({top_converting_identity_dimensions.total_converted} total conversions)
            </span>
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Top archetypes */}
            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-5">
              <p className="section-tag mb-4">Archetypes</p>
              <div className="space-y-2">
                {top_converting_identity_dimensions.top_archetypes.map((a, i) => {
                  const maxCount = top_converting_identity_dimensions.top_archetypes[0]?.count ?? 1;
                  return (
                    <div key={a.archetype} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm text-white capitalize truncate">{a.archetype}</span>
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>{a.count}</span>
                        </div>
                        <div className="w-full h-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-1"
                            style={{ background: "rgba(255,255,255,0.7)", width: `${(a.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top values */}
            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-5">
              <p className="section-tag mb-4">Values</p>
              <div className="space-y-2">
                {top_converting_identity_dimensions.top_values.map((v, i) => {
                  const maxCount = top_converting_identity_dimensions.top_values[0]?.count ?? 1;
                  return (
                    <div key={v.value} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm text-white capitalize truncate" title={v.value}>{v.value}</span>
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>{v.count}</span>
                        </div>
                        <div className="w-full h-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-1"
                            style={{ background: "rgba(255,255,255,0.7)", width: `${(v.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top style tags */}
            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-5">
              <p className="section-tag mb-4">Style Tags</p>
              <div className="space-y-2">
                {top_converting_identity_dimensions.top_style_tags.map((t, i) => {
                  const maxCount = top_converting_identity_dimensions.top_style_tags[0]?.count ?? 1;
                  return (
                    <div key={t.tag} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm text-white capitalize truncate" title={t.tag}>{t.tag}</span>
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>{t.count}</span>
                        </div>
                        <div className="w-full h-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-1"
                            style={{ background: "rgba(255,255,255,0.7)", width: `${(t.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* Schema Evolution — Candidate Dimensions */}
        <section style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Schema Evolution — Candidate Dimensions</SectionTitle>
            {schemaLoading && (
              <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "1px solid rgba(255,255,255,0.15)", borderTop: "1px solid rgba(255,255,255,0.8)" }} />
            )}
          </div>
          <p className="text-xs text-zinc-600 mb-6">
            Identity traits detected in converted matches that fall outside the current controlled vocabulary.
            Candidates with 10+ converted matches are flagged for review. Approving adds them to the GPT prompts
            used for brand profiling and consumer translation.
          </p>

          {!schemaData ? (
            <p className="text-sm text-zinc-600">Loading schema evolution data…</p>
          ) : schemaData.all_candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500">No candidate dimensions detected yet.</p>
              <p className="text-xs text-zinc-600 mt-1">
                Candidates appear when 10+ converted matches share traits outside the controlled vocabulary.
              </p>
            </div>
          ) : (
            <>
              {/* Summary stats for schema evolution */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard
                  label="Converted Analyzed"
                  value={schemaData.total_converted_analyzed}
                />
                <StatCard
                  label="Novel Traits"
                  value={schemaData.novel_traits_detected}
                />
                <StatCard
                  label="Qualified"
                  value={schemaData.qualified_candidates}
                  sub="10+ converted matches"
                />
                <StatCard
                  label="Emerging Clusters"
                  value={schemaData.emerging_clusters.length}
                />
              </div>

              {/* Emerging clusters */}
              {schemaData.emerging_clusters.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Recurring Archetype + Value Combos</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {schemaData.emerging_clusters.slice(0, 6).map((cluster, i) => (
                      <div
                        key={i}
                        style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}
                        className="p-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {cluster.combo.map((trait, j) => (
                            <span
                              key={j}
                              style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.7)", fontSize: "11px", padding: "2px 8px" }}
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{cluster.count} converted matches</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate dimensions table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left" style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", letterSpacing: "0.1em" }}>
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Type</th>
                      <th className="pb-3 pr-4 font-medium">Definition</th>
                      <th className="pb-3 pr-4 font-medium text-right">Evidence</th>
                      <th className="pb-3 pr-4 font-medium text-right">Confidence</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderColor: "rgba(255,255,255,0.06)" }} className="divide-y">
                    {schemaData.all_candidates.map((c) => (
                      <tr key={c.id} style={{ background: "rgba(255,255,255,0.04)" }} className="transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-white font-medium">{c.candidate_name}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.7)", fontSize: "10px", padding: "2px 6px" }}>
                            {c.candidate_type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs max-w-xs truncate" style={{ color: "rgba(255,255,255,0.65)" }} title={c.definition}>
                          {c.definition}
                        </td>
                        <td className="py-3 pr-4 text-right" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {c.sample_count}
                          <span style={{ color: "rgba(255,255,255,0.35)" }} className="ml-1">({c.evidence_count} events)</span>
                        </td>
                        <td className="py-3 pr-4 text-right font-goldman" style={{ color: c.confidence_score >= 0.7 ? "rgba(255,255,255,0.9)" : c.confidence_score >= 0.4 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)" }}>
                          {Math.round(c.confidence_score * 100)}%
                        </td>
                        <td className="py-3 pr-4">
                          <span style={
                            c.status === "approved"
                              ? { background: "rgba(255,255,255,0.12)", borderRadius: "2px", color: "rgba(255,255,255,0.8)", fontSize: "10px", padding: "2px 8px" }
                              : c.status === "rejected"
                              ? { background: "rgba(220,38,38,0.12)", borderRadius: "2px", color: "rgba(252,165,165,0.7)", fontSize: "10px", padding: "2px 8px" }
                              : { background: "rgba(0,0,0,0.12)", borderRadius: "2px", color: "rgba(255,255,255,0.45)", fontSize: "10px", padding: "2px 8px" }
                          }>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {c.status === "candidate" && (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleCandidateAction(c.id, "approve")}
                                disabled={approving === c.id}
                                style={{ background: "rgba(255,255,255,0.9)", borderRadius: "2px", color: "#4A4A46", fontSize: "12px", padding: "4px 10px" }}
                                className="transition-colors disabled:opacity-50"
                              >
                                {approving === c.id ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleCandidateAction(c.id, "reject")}
                                disabled={approving === c.id}
                                style={{ background: "rgba(0,0,0,0.15)", borderRadius: "2px", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)", fontSize: "12px", padding: "4px 10px" }}
                                className="transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {c.status === "approved" && c.approved_at && (
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {new Date(c.approved_at).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="pt-6 pb-8 text-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            ESINA Identity Intelligence · Aggregate data only · No individual consumer records
          </p>
        </footer>

      </main>
    </div>
  );
}

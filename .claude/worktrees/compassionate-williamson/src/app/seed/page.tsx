"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────

interface SeedResult {
  brandId: string;
  brandName: string;
  category: string;
  alignmentScore: number;
  recommendations: string[];
  generatedProfile: {
    archetypes: { archetype: string; weight: number; primary: boolean }[];
    values: string[];
    style_tags: string[];
    communities: string[];
    status_signal_type: string;
    sustainability_level: string;
    identity_statements: string[];
    differentiation_claim: string;
  };
}

// ── Small UI components ───────────────────────────────────────────────

function Tag({ label, color = "zinc" }: { label: string; color?: "esina" | "zinc" | "amber" | "green" }) {
  const styles = {
    esina: "bg-violet-950/50 border-violet-800/40 text-violet-300",
    zinc: "bg-zinc-800/60 border-zinc-700/40 text-zinc-300",
    amber: "bg-amber-950/40 border-amber-800/40 text-amber-300",
    green: "bg-emerald-950/40 border-emerald-800/40 text-emerald-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${styles[color]}`}>
      {label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-emerald-400" : score >= 45 ? "text-amber-400" : "text-red-400";
  const label =
    score >= 70 ? "Strong alignment" : score >= 45 ? "Partial alignment" : "Needs work";
  return (
    <div className="flex items-baseline gap-3">
      <span className={`text-5xl font-bold tabular-nums ${color}`}>{score}</span>
      <span className="text-zinc-500 text-sm">/100 · {label}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export default function SeedPage() {
  // Auth
  const [apiKey, setApiKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  // Form
  const [sellerUsername, setSellerUsername] = useState("");
  const [shopName, setShopName] = useState("");
  const [bio, setBio] = useState("");
  const [listings, setListings] = useState("");

  // State
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState("");

  // Batch mode
  const [batchResults, setBatchResults] = useState<SeedResult[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Auth ────────────────────────────────────────────────────────────

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) { setAuthError("Enter your ESINA API key"); return; }
    // Quick validation — call a cheap endpoint with the key
    try {
      const res = await fetch("/api/debug-match-events", {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (res.status === 401) {
        setAuthError("Invalid API key");
        return;
      }
      setAuthed(true);
      setAuthError("");
    } catch {
      setAuthError("Connection error — try again");
    }
  }

  // ── Seed a single seller ────────────────────────────────────────────

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!shopName.trim() || !listings.trim()) {
      setError("Shop name and listings are required");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      setStep("Generating brand profile via GPT-4o-mini…");
      const res = await fetch("/api/seed-brand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ sellerUsername, shopName, bio, listings }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }

      setStep("Storing profile + running perception audit…");
      const data: SeedResult = await res.json();
      setResult(data);
      setBatchResults((prev) => [data, ...prev]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setStep("");
    }
  }

  function clearForm() {
    setSellerUsername("");
    setShopName("");
    setBio("");
    setListings("");
    setResult(null);
    setError("");
  }

  // ── Auth gate ────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-4">
              <span className="w-4 h-px bg-violet-700" />
              ESINA Admin
              <span className="w-4 h-px bg-violet-700" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100">Depop Seller Seeder</h1>
            <p className="text-zinc-500 text-sm mt-1">Enter your ESINA API key to continue</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-esina-…"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-700 text-sm font-mono"
              autoFocus
            />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← Home</Link>
          <span className="text-zinc-700">|</span>
          <span className="text-violet-400 text-xs font-mono tracking-widest uppercase">Depop Seller Seeder</span>
        </div>
        <div className="flex items-center gap-3">
          {batchResults.length > 0 && (
            <span className="text-zinc-500 text-xs">{batchResults.length} seeded this session</span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/50 border border-emerald-800/40 rounded text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Admin
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Instructions */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 text-sm text-zinc-400 leading-relaxed">
          <p className="text-zinc-300 font-medium mb-2">How to use</p>
          <p>
            Open a Depop seller&apos;s public page. Copy their shop name, bio, and 10–15 listing titles and descriptions
            into the fields below. Click <strong className="text-zinc-200">Generate Profile</strong> — ESINA will run GPT-4o-mini to
            extract a structured brand identity, embed it, and run a perception audit automatically.
            Takes ~15–20 seconds per seller.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Depop Username <span className="normal-case text-zinc-600">(optional)</span>
              </label>
              <input
                type="text"
                value={sellerUsername}
                onChange={(e) => setSellerUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-700 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Margot Vintage"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-700 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Shop Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Paste the seller's bio from their Depop profile…"
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-700 text-sm resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Listing Titles &amp; Descriptions <span className="text-red-500">*</span>
              <span className="normal-case text-zinc-600 ml-1">(paste 10–15)</span>
            </label>
            <textarea
              value={listings}
              onChange={(e) => setListings(e.target.value)}
              placeholder={`Paste listing titles and descriptions here. Example format:\n\n1. Vintage Levi's 501 — 90s deadstock, raw hem, 28×30. Classic five-pocket denim, barely worn, rigid dark indigo wash.\n\n2. Y2K slip dress — bias-cut satin, deep burgundy, thin straps. Size S/M. Pulls over the head, no zip needed.`}
              rows={14}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-700 text-sm resize-y leading-relaxed font-mono text-xs"
              required
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-950/40 border border-red-800/40 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !shopName.trim() || !listings.trim()}
              className="px-6 py-3 bg-violet-700 hover:bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  {step || "Processing…"}
                </>
              ) : (
                "Generate Profile"
              )}
            </button>
            {(shopName || bio || listings) && !loading && (
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-3 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="border border-zinc-800/60 rounded-xl overflow-hidden">
            {/* Score header */}
            <div className="bg-zinc-900/70 border-b border-zinc-800/60 px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium mb-1">Profile generated</p>
                <h2 className="text-xl font-semibold text-zinc-100">{result.brandName}</h2>
                <p className="text-zinc-500 text-sm mt-0.5 capitalize">{result.category}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium mb-1">Alignment score</p>
                <ScoreBadge score={result.alignmentScore} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Generated fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Values</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.generatedProfile.values?.map((v) => (
                        <Tag key={v} label={v} color="esina" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Style tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.generatedProfile.style_tags?.map((t) => (
                        <Tag key={t} label={t} color="zinc" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Communities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.generatedProfile.communities?.map((c) => (
                        <Tag key={c} label={c} color="amber" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Archetypes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.generatedProfile.archetypes?.map((a) => (
                        <Tag key={a.archetype} label={`${a.archetype} (${Math.round(a.weight * 100)}%)`} color="green" />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Signal</p>
                      <p className="text-zinc-300">{result.generatedProfile.status_signal_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Sustainability</p>
                      <p className="text-zinc-300">{result.generatedProfile.sustainability_level || "—"}</p>
                    </div>
                  </div>
                  {result.generatedProfile.differentiation_claim && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Differentiation</p>
                      <p className="text-zinc-400 text-sm italic">"{result.generatedProfile.differentiation_claim}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Identity statements */}
              {result.generatedProfile.identity_statements?.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Identity statements</p>
                  <ul className="space-y-1">
                    {result.generatedProfile.identity_statements.map((stmt, i) => (
                      <li key={i} className="text-zinc-400 text-sm flex gap-2">
                        <span className="text-zinc-700 mt-0.5">–</span>
                        <span>{stmt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Audit recommendations</p>
                  <ul className="space-y-1">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="text-zinc-400 text-sm flex gap-2">
                        <span className="text-amber-600 mt-0.5">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/60">
                <Link
                  href={`/audit/${result.brandId}`}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                >
                  View full audit →
                </Link>
                <span className="text-zinc-600 text-xs font-mono">{result.brandId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Batch history */}
        {batchResults.length > 1 && (
          <div>
            <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Seeded this session</h3>
            <div className="space-y-2">
              {batchResults.map((r) => (
                <div
                  key={r.brandId}
                  className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border border-zinc-800/60 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-200 text-sm font-medium">{r.brandName}</span>
                    <span className="text-zinc-600 text-xs capitalize">{r.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold tabular-nums ${r.alignmentScore >= 70 ? "text-emerald-400" : r.alignmentScore >= 45 ? "text-amber-400" : "text-red-400"}`}>
                      {r.alignmentScore}
                    </span>
                    <Link
                      href={`/audit/${r.brandId}`}
                      className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                    >
                      Audit →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface EsinaMatch {
  brandId: string;
  brandName: string;
  category: string;
  score: number;
  rawSimilarity: number;
  snippet: string;
}

interface GenericRec {
  brand: string;
  reason: string;
}

const PLACEHOLDER =
  "I'm looking for brands that feel irreverent and don't take themselves too seriously. I value sustainability but hate when brands are preachy about it. I gravitate toward bold, maximalist design. I'm part of fitness and outdoor communities. I prefer counterculture brands over mainstream ones. Anti-corporate energy. Mid-range price.";

export default function MatchPage() {
  const [preferenceText, setPreferenceText] = useState("");
  const [esinaMatches, setEsinaMatches] = useState<EsinaMatch[]>([]);
  const [genericRecs, setGenericRecs] = useState<GenericRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunMatch() {
    const text = preferenceText.trim();
    if (!text) return;

    setLoading(true);
    setError(null);
    setEsinaMatches([]);
    setGenericRecs([]);

    try {
      // Run both requests in parallel
      const [esinaRes, genericRes] = await Promise.all([
        fetch("/api/run-match", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-esina-internal": "1" },
          body: JSON.stringify({ preferenceText: text }),
        }),
        fetch("/api/generic-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferenceText: text }),
        }),
      ]);

      const esinaData = await esinaRes.json();
      const genericData = await genericRes.json();

      if (esinaData.error) throw new Error(esinaData.error);
      if (genericData.error) throw new Error(genericData.error);

      setEsinaMatches(esinaData.matches || []);
      setGenericRecs(genericData.recommendations || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const hasResults = esinaMatches.length > 0 || genericRecs.length > 0;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              ESINA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/audits"
              className="text-xs text-zinc-400 hover:text-esina-400 transition-colors"
            >
              View Audits
            </a>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">
              Identity Matching Engine
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Brand Identity Match
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Describe what you look for in brands. ESINA matches you against
            normalized identity profiles using vector similarity — then compares
            against what generic AI would recommend without that data.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-10">
          <label
            htmlFor="preferences"
            className="block text-sm font-medium text-zinc-300 mb-3"
          >
            Your brand preferences
          </label>
          <textarea
            id="preferences"
            rows={5}
            value={preferenceText}
            onChange={(e) => setPreferenceText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-esina-600 focus:ring-1 focus:ring-esina-600/30 transition-colors resize-none text-[15px] leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-zinc-500">
              {preferenceText.length > 0
                ? `${preferenceText.length} characters`
                : "Describe your values, aesthetics, communities, price range..."}
            </span>
            <button
              onClick={handleRunMatch}
              disabled={!preferenceText.trim() || loading}
              className="btn-glow px-6 py-2.5 bg-esina-600 hover:bg-esina-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Matching...
                </span>
              ) : (
                "Run Match"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ESINA Results */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-md bg-esina-600/20 flex items-center justify-center">
                  <span className="text-esina-400 text-xs font-bold">E</span>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  ESINA Identity Match
                </h2>
                <span className="text-[11px] text-esina-400 bg-esina-950/50 border border-esina-800/30 px-2 py-0.5 rounded-full">
                  Normalized data
                </span>
              </div>

              <div className="space-y-3">
                {esinaMatches.map((match, i) => (
                  <div
                    key={match.brandId}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 text-xs font-mono w-5 text-right">
                          {i + 1}
                        </span>
                        <a
                          href={`/audit/${match.brandId}`}
                          className="text-white font-medium hover:text-esina-400 transition-colors"
                        >
                          {match.brandName}
                        </a>
                      </div>
                      <span className="text-esina-400 font-semibold text-lg tabular-nums">
                        {match.score}%
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="ml-8 mb-2">
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full score-bar-animate"
                          style={{
                            width: `${match.score}%`,
                            background:
                              match.score >= 60
                                ? "linear-gradient(90deg, #1b87f5, #33a6ff)"
                                : match.score >= 45
                                ? "linear-gradient(90deg, #1b87f5, #59c4ff)"
                                : "linear-gradient(90deg, #3f3f46, #52525b)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Snippet */}
                    {match.snippet && (
                      <p className="ml-8 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {match.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generic AI Results */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-md bg-zinc-700/30 flex items-center justify-center">
                  <span className="text-zinc-400 text-xs font-bold">AI</span>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Generic AI Recommendation
                </h2>
                <span className="text-[11px] text-zinc-400 bg-zinc-800/50 border border-zinc-700/30 px-2 py-0.5 rounded-full">
                  No identity data
                </span>
              </div>

              <div className="space-y-3">
                {genericRecs.map((rec, i) => (
                  <div
                    key={`${rec.brand}-${i}`}
                    className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-zinc-500 text-xs font-mono w-5 text-right mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-zinc-200 font-medium">
                          {rec.brand}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison note */}
              <div className="mt-6 bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 font-medium">
                    What&apos;s the difference?
                  </span>{" "}
                  ESINA matches against structured, normalized brand identity
                  profiles — actual data about how brands define themselves.
                  Generic AI relies on training data, popular perception, and
                  surface-level associations. The gap between these two results
                  is what ESINA solves.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasResults && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">
              Describe your preferences above and hit{" "}
              <span className="text-esina-400">Run Match</span> to see ranked
              brand results.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-zinc-600">
            ESINA MVP — Identity Matching Demo
          </span>
          <span className="text-xs text-zinc-600">
            12 brands &middot; cosine similarity &middot; pgvector
          </span>
        </div>
      </footer>
    </div>
  );
}

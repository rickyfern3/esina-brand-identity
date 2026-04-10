"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "../components/NavBar";

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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hasResults = esinaMatches.length > 0 || genericRecs.length > 0;

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-12" style={{ paddingTop: "88px" }}>
        {/* Hero */}
        <div className="mb-10 fade-up-1">
          <p className="section-tag mb-5">matching demo</p>
          <h1 className="font-goldman text-4xl font-bold text-white mb-3">identity match vs generic ai</h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            describe what you look for in brands. esina matches you against normalized identity profiles using vector similarity — then compares against what generic ai would recommend without that data.
          </p>
        </div>

        {/* Input */}
        <div className="p-6 mb-10 fade-up-2" style={{ borderRadius: "2px" }}>
          <label htmlFor="preferences" className="block text-sm mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            your brand preferences
          </label>
          <textarea
            id="preferences"
            rows={5}
            value={preferenceText}
            onChange={(e) => setPreferenceText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full focus:outline-none resize-none text-sm leading-relaxed card-dark"
            style={{
              background: "rgba(0,0,0,0.12)",
              border: "2px solid rgba(255,255,255,0.12)",
              borderRadius: "2px",
              color: "rgba(255,255,255,0.6)",
              padding: "12px 16px",
            }}
          />
          <style>{`
            textarea::placeholder {
              color: rgba(255,255,255,0.3);
            }
          `}</style>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {preferenceText.length > 0
                ? `${preferenceText.length} characters`
                : "describe your values, aesthetics, communities, price range…"}
            </span>
            <button
              onClick={handleRunMatch}
              disabled={!preferenceText.trim() || loading}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 border border-[#4A4A46]/30 border-t-[#4A4A46] animate-spin"
                    style={{ borderRadius: "50%" }}
                  />
                  matching…
                </span>
              ) : "run match"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="p-4 mb-8 text-sm"
            style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && !hasResults && (
          <div className="text-center py-20 fade-up-3">
            <p style={{ color: "rgba(255,255,255,0.45)" }}>running match…</p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up-3">
            {/* ESINA Results */}
            <div>
              <div className="flex items-center gap-3 mb-5 card-mid p-3" style={{ borderRadius: "2px" }}>
                <h2 className="font-goldman text-base font-bold" style={{ color: "rgba(0,0,0,0.7)" }}>esina identity match</h2>
              </div>

              <div className="space-y-2">
                {esinaMatches.map((match, i) => (
                  <div
                    key={match.brandId}
                    className="p-4 card-dark"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-goldman text-xs w-5 text-right" style={{ color: "rgba(0,0,0,0.4)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <a
                          href={`/audit/${match.brandId}`}
                          className="text-sm"
                          style={{ color: "rgba(0,0,0,0.65)", transition: "opacity 0.15s" }}
                        >
                          {match.brandName}
                        </a>
                      </div>
                      <span className="font-goldman text-base font-bold tabular-nums" style={{ color: "rgba(0,0,0,0.75)" }}>
                        {match.score}%
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="ml-8 mb-2">
                      <div className="h-px overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div
                          className="h-full score-bar-animate"
                          style={{ width: `${match.score}%`, background: "rgba(0,0,0,0.2)" }}
                        />
                      </div>
                    </div>

                    {match.snippet && (
                      <p className="ml-8 text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(0,0,0,0.4)" }}>
                        {match.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generic AI */}
            <div>
              <div className="flex items-center gap-3 mb-5 card-mid p-3" style={{ borderRadius: "2px" }}>
                <h2 className="font-goldman text-base font-bold" style={{ color: "rgba(0,0,0,0.3)" }}>generic ai</h2>
              </div>

              <div className="space-y-2">
                {genericRecs.map((rec, i) => (
                  <div
                    key={`${rec.brand}-${i}`}
                    className="p-4 card-dark"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-goldman text-xs w-5 text-right mt-0.5" style={{ color: "rgba(0,0,0,0.25)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-sm" style={{ color: "rgba(0,0,0,0.3)" }}>{rec.brand}</h3>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(0,0,0,0.25)" }}>
                          {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 p-4 card-dark"
                style={{ borderRadius: "2px" }}
              >
                <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.35)" }}>
                  esina matches against structured identity profiles — actual data about how brands define themselves. generic ai relies on training data and popular perception. the gap between these results is what esina solves.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasResults && !loading && !error && (
          <div className="text-center py-20 fade-up-3">
            <div
              className="w-12 h-12 flex items-center justify-center mx-auto mb-4 card-dark"
              style={{ borderRadius: "2px" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="rgba(255,255,255,0.4)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              enter your consumer preferences above to see the match
            </p>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          <span>esina · identity matching demo</span>
          <span>cosine similarity · pgvector</span>
        </div>
      </footer>
    </div>
  );
}

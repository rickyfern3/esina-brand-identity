import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/60 sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center shadow-lg shadow-esina-900/40">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">ESINA</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/audits" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Audits
            </Link>
            <Link href="/match" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Matching Demo
            </Link>
            <Link
              href="/questionnaire"
              className="text-sm px-4 py-2 bg-esina-600 hover:bg-esina-500 text-white font-medium rounded-lg transition-colors"
            >
              Audit Your Brand
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-esina-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-esina-800/60 bg-esina-950/40 text-esina-300 text-xs font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-esina-400 animate-pulse" />
            Brand Intelligence for the Agent Era
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
            AI agents recommend big brands{" "}
            <span className="text-zinc-500">by default.</span>
            <br />
            <span className="bg-gradient-to-r from-esina-400 to-esina-300 bg-clip-text text-transparent">
              Esina makes sure they recommend the right brand
            </span>{" "}
            —{" "}
            <span className="text-zinc-400">even if that&apos;s you.</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI only sees half of who your brand is. Esina shows the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/questionnaire"
              className="btn-glow px-8 py-4 bg-esina-600 hover:bg-esina-500 text-white font-semibold rounded-xl transition-all text-base shadow-xl shadow-esina-900/30"
            >
              Audit Your Brand — Free for the first 100
            </Link>
            <Link
              href="/match"
              className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium rounded-xl transition-all text-base"
            >
              See the Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stat Bar ───────────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/60 border border-zinc-800/60 rounded-2xl bg-zinc-900/30 overflow-hidden">
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">28</div>
              <div className="text-sm text-zinc-500">brands audited</div>
            </div>
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1">43<span className="text-xl text-zinc-500">/100</span></div>
              <div className="text-sm text-zinc-500">average AI identity alignment</div>
            </div>
            <div className="px-8 py-6 text-center">
              <div className="text-3xl font-bold text-esina-400 mb-1">57%</div>
              <div className="text-sm text-zinc-500">of brand identity invisible to AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Problem ────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">The Problem</div>
              <h2 className="text-3xl font-bold mb-6 leading-tight">
                AI flattens brand identity.
                <br />
                <span className="text-zinc-400">The biggest brand wins by default.</span>
              </h2>
              <div className="space-y-5 text-zinc-400 leading-relaxed">
                <p>
                  AI knows what you sell. It doesn&apos;t know who you are. When a consumer asks an AI agent to recommend a jewelry brand that values craftsmanship and slow fashion, it returns Tiffany — not Alighieri, not Completedworks, not you.
                </p>
                <p>
                  When products are functionally similar, AI defaults to the brand with the largest training signal. That&apos;s almost always the biggest brand, not the best match.
                </p>
                <p>
                  Your identity — your archetypes, your values, your community, your aesthetic — lives in your head and your Instagram captions. Not in any data format AI can query.
                </p>
              </div>
            </div>

            {/* Problem visual */}
            <div className="space-y-3">
              <div className="text-xs text-zinc-600 uppercase tracking-widest mb-4 font-medium">What AI sees vs. what you actually are</div>

              {[
                { label: "Product category", ai: true, full: true },
                { label: "Price tier", ai: true, full: true },
                { label: "Website content", ai: true, full: true },
                { label: "Brand archetypes", ai: false, full: true },
                { label: "Core values", ai: false, full: true },
                { label: "Community signals", ai: false, full: true },
                { label: "Aesthetic identity", ai: false, full: true },
                { label: "Cultural positioning", ai: false, full: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <div className="w-36 text-sm text-zinc-500 flex-shrink-0">{row.label}</div>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.ai ? "bg-gradient-to-r from-esina-600 to-esina-400 w-full" : "bg-red-900/60 w-0"}`}
                    />
                  </div>
                  <div className={`text-xs font-medium flex-shrink-0 w-16 text-right ${row.ai ? "text-esina-400" : "text-red-500"}`}>
                    {row.ai ? "Visible" : "Invisible"}
                  </div>
                </div>
              ))}

              <div className="mt-5 pt-4 border-t border-zinc-800/60 flex justify-between text-xs text-zinc-600">
                <span>What AI currently reads</span>
                <span>What actually drives brand match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Esina Works ────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">How Esina Works</div>
            <h2 className="text-3xl font-bold">
              From invisible to{" "}
              <span className="bg-gradient-to-r from-esina-400 to-esina-300 bg-clip-text text-transparent">
                AI-readable
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Brand fills out identity questionnaire",
                description:
                  "Archetypes, values, aesthetic style, community, voice, sustainability position, exclusivity level. The stuff that makes your brand yours — structured for machines.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "AI Perception Audit reveals gaps",
                description:
                  "Three independent AI queries assess how the brand is actually perceived — archetypes, competitive positioning, consumer simulation. We score the gap between self-reported and AI-perceived identity.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Normalized identity data powers smarter matching",
                description:
                  "Brand identity becomes a vector embedding. Consumer preferences match against it semantically — not by keyword, not by popularity. The right brand surfaces first.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-7 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-esina-950/60 border border-esina-800/40 flex items-center justify-center text-esina-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-xs text-zinc-600 font-mono mt-2">{item.step}</span>
                </div>
                <h3 className="font-semibold text-white mb-3 leading-snug">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>

                {/* Connector arrow (not on last) */}
                {item.step !== "03" && (
                  <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-zinc-700 text-xl z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mock Demo Comparison ───────────────────────────────── */}
      <section className="px-6 py-20 border-t border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-medium">The Difference</div>
            <h2 className="text-3xl font-bold mb-4">Same brief. Very different results.</h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
              Consumer brief:{" "}
              <span className="text-zinc-300 italic">
                &quot;Artisanal jewelry that feels like wearable art. No logo, slow fashion, quiet luxury aesthetic.&quot;
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Esina result */}
            <div className="border border-esina-800/50 bg-esina-950/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-esina-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px]">E</span>
                  </div>
                  <span className="text-sm font-medium text-esina-300">Esina Match</span>
                </div>
                <span className="text-xs text-esina-400 bg-esina-900/40 px-2 py-1 rounded-md border border-esina-800/40">Identity-aware</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { rank: 1, name: "Alighieri", detail: "Sage archetype · quiet luxury · no logo · literary craft", score: 94 },
                  { rank: 2, name: "Completedworks", detail: "Creator archetype · sculptural jewelry · artisanal", score: 91 },
                  { rank: 3, name: "Lizzie Fortunato", detail: "Explorer archetype · found materials · heritage craft", score: 87 },
                ].map((match) => (
                  <div key={match.rank} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/40">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${match.rank === 1 ? "bg-esina-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                      {match.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{match.name}</span>
                        <span className="text-xs text-esina-400 font-mono">{match.score}%</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{match.detail}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-esina-400/70 text-center pt-1">✓ Identity-matched — not popularity-ranked</p>
              </div>
            </div>

            {/* Generic AI result */}
            <div className="border border-zinc-800/60 bg-zinc-900/20 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-zinc-700 flex items-center justify-center">
                    <span className="text-zinc-300 font-bold text-[10px]">AI</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-400">Generic AI</span>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800/60 px-2 py-1 rounded-md border border-zinc-700/40">Popularity-based</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { rank: 1, name: "Tiffany & Co.", detail: "Recommended because it dominates jewelry search volume", score: null },
                  { rank: 2, name: "Pandora", detail: "High brand recognition, strong retail presence", score: null },
                  { rank: 3, name: "Kay Jewelers", detail: "Top-3 jewelry retailer by market share", score: null },
                ].map((match) => (
                  <div key={match.rank} className="flex items-start gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/30 opacity-80">
                    <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {match.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-300">{match.name}</span>
                        <span className="text-xs text-zinc-600 font-mono">?</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{match.detail}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-red-500/60 text-center pt-1">✗ Functionally similar → default to biggest brand</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-zinc-800/40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-esina-800/60 bg-esina-950/40 text-esina-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-esina-400 animate-pulse" />
            Free for the first 100 brands
          </div>
          <h2 className="text-4xl font-bold mb-5 leading-tight">
            Find out where AI sees gaps{" "}
            <span className="text-zinc-500">in your brand.</span>
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Fill out the identity questionnaire. We run three independent AI queries against your brand, score the gaps, and show you exactly where your identity isn&apos;t landing.
          </p>
          <Link
            href="/questionnaire"
            className="btn-glow inline-block px-10 py-5 bg-esina-600 hover:bg-esina-500 text-white font-semibold rounded-xl transition-all text-base shadow-2xl shadow-esina-900/40"
          >
            Audit Your Brand — Free for the first 100
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/40 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">E</span>
            </div>
            <span className="text-sm font-medium text-zinc-400">ESINA</span>
            <span className="text-zinc-700 text-sm">·</span>
            <span className="text-sm text-zinc-600">Built for the agent era</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/audits" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Audit Reports
            </Link>
            <Link href="/match" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Matching Demo
            </Link>
            <Link href="/questionnaire" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Get Audited
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

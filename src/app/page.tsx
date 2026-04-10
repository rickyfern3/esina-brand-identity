import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", background: "rgba(122,122,118,0.7)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-goldman text-white tracking-[3px] uppercase" style={{ fontSize: "28px" }}>
            ESINA
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/brands" className="nav-link">brands</Link>
            <Link href="/match" className="nav-link">match</Link>
            <Link href="/translate" className="nav-link">translate</Link>
            <Link href="/audits" className="nav-link">audits</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden px-6">
        <div className="relative max-w-6xl mx-auto w-full py-24">
          <div className="max-w-2xl fade-up-1">
            {/* Tag */}
            <p className="section-tag mb-8">brand identity infrastructure</p>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl leading-[1.1] mb-7 font-goldman">
              <span className="text-white">ai sees less than half</span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>of who your brand is</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg mb-10 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              AI agents recommend based on popularity, not identity. Your brand becomes invisible. One line of code fixes that.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/onboard"
                className="btn-primary px-7 py-3.5 text-sm font-medium inline-block"
              >
                build your brand.md
              </Link>
              <Link
                href="/questionnaire"
                className="btn-secondary px-7 py-3.5 text-sm inline-block"
              >
                tell us about your brand
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3 fade-up-2">
            {[
              { num: "43", label: "avg ai alignment / 100" },
              { num: "57%", label: "identity invisible to ai" },
              { num: "78", label: "brands profiled" },
            ].map((s, i, arr) => (
              <div
                key={s.num}
                className="py-8 px-6 text-center"
                style={{ borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              >
                <div className="font-goldman text-3xl text-white mb-1.5">{s.num}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problem ──────────────────────────────────────────────────── */}
      <section className="px-6 py-24 fade-up-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="section-tag mb-6">the problem</p>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-goldman text-white mb-6">
                ai defaults to big brands. yours disappears.
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                <p>
                  AI knows what you sell. It doesn&apos;t know who you are. When a consumer asks an AI agent for artisanal jewelry with a slow fashion ethos, it returns Tiffany. Ask for independent skincare rooted in wellness, it returns Neutrogena.
                </p>
                <p>
                  This isn&apos;t a size problem. It&apos;s a data problem. Your archetypes, values, community, aesthetic — everything that makes your brand yours — lives in your head and your captions. Not in any format AI can query.
                </p>
              </div>
            </div>

            {/* Visibility grid */}
            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", padding: "24px" }}>
              <p className="section-tag mb-5">what ai currently reads</p>
              <div className="space-y-3">
                {[
                  { label: "product category", visible: true },
                  { label: "price tier", visible: true },
                  { label: "website content", visible: true },
                  { label: "brand archetypes", visible: false },
                  { label: "core values", visible: false },
                  { label: "community signals", visible: false },
                  { label: "aesthetic identity", visible: false },
                  { label: "cultural positioning", visible: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-4">
                    <div className="w-40 text-sm flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {row.label}
                    </div>
                    <div className="flex-1 h-px" style={{ background: row.visible ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.12)" }} />
                    <div className="text-xs w-16 text-right flex-shrink-0" style={{ color: row.visible ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)" }}>
                      {row.visible ? "visible" : "invisible"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="px-6 py-24 fade-up-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="section-tag mb-6">how it works</p>
          <h2 className="text-3xl font-goldman text-white mb-14">three steps. one line of code.</h2>

          <div className="grid md:grid-cols-3 gap-0" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
            {[
              {
                num: "01",
                title: "define your identity",
                desc: "Archetypes, values, aesthetic style, community, voice. The identity dimensions that make your brand yours — structured for machines.",
              },
              {
                num: "02",
                title: "get your brand.md",
                desc: "AI perception audit runs automatically. We score the gap between your self-reported identity and how AI actually perceives you.",
              },
              {
                num: "03",
                title: "add one line",
                desc: "Drop one script tag in your store header. AI agents now have a machine-readable identity profile to match against.",
              },
            ].map((step, i, arr) => (
              <div
                key={step.num}
                className="p-8"
                style={{
                  background: "rgba(0,0,0,0.12)",
                  borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <div className="font-goldman text-4xl mb-6" style={{ color: "rgba(255,255,255,0.2)" }}>{step.num}</div>
                <h3 className="font-goldman text-white text-lg mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration ───────────────────────────────────────────────── */}
      <section className="px-6 py-24 fade-up-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="section-tag mb-6">the integration</p>
          <h2 className="text-3xl font-goldman text-white mb-3">this is all you add.</h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.35)" }}>
            paste it in your store&apos;s &lt;head&gt;. nothing else.
          </p>
          <div
            className="esina-code px-6 py-5 text-sm leading-relaxed overflow-x-auto"
            style={{ maxWidth: "640px", color: "rgba(255,255,255,0.8)", fontFamily: "'SF Mono', 'Fira Code', monospace" }}
          >
            {'<script src="https://esina-brand-identity.vercel.app/esina.js?brand=YOUR_BRAND_ID"></script>'}
          </div>
          <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
            your brand id is generated when you complete onboarding. free forever.
          </p>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 fade-up-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto">
          <p className="section-tag mb-6">the proof</p>
          <h2 className="text-3xl font-goldman text-white mb-4">same query. different intelligence.</h2>

          {/* Consumer query */}
          <div className="mb-10 px-5 py-4" style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", maxWidth: "560px" }}>
            <p className="section-tag mb-2">consumer query</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              &ldquo;Artisanal jewelry that feels like wearable art. No logo, slow fashion, quiet luxury aesthetic.&rdquo;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4" style={{ maxWidth: "880px" }}>
            {/* ESINA column */}
            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-goldman tracking-widest text-white">ESINA identity match</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: "éliou", score: "53%" },
                  { name: "Completedworks", score: "49%" },
                  { name: "Lizzie Fortunato", score: "47%" },
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px" }}>
                    <span className="text-sm text-white">{b.name}</span>
                    <span className="font-goldman text-sm text-white">{b.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generic AI column */}
            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-goldman tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>generic ai</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: "Pandora", label: "popular" },
                  { name: "Tiffany & Co.", label: "popular" },
                  { name: "Mejuri", label: "popular" },
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{b.name}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{b.label}</span>
                  </div>
                ))}
                <div className="px-4 py-3" style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px" }}>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>éliou not mentioned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-28 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-goldman text-white mb-3">free forever.</h2>
          <p className="text-lg mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>pay when ai sends you customers.</p>
          <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.35)" }}>no subscriptions. no setup. one line of code.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/onboard" className="btn-primary px-8 py-4 text-sm font-medium inline-block">
              get your brand.md
            </Link>
            <Link href="/match" className="btn-secondary px-8 py-4 text-sm inline-block">
              see the demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>© 2026 ESINA</span>
          <nav className="flex items-center gap-6">
            <Link href="/brands" className="nav-link">brands</Link>
            <Link href="/match" className="nav-link">match</Link>
            <Link href="/translate" className="nav-link">translate</Link>
            <Link href="/audits" className="nav-link">audits</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

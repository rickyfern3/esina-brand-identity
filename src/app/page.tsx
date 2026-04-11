import Link from "next/link";
import NavBar from "./components/NavBar";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <NavBar />

      {/* ══ TOP ZONE — dark gray, white text ════════════════════════════ */}

      {/* Hero */}
      <section className="px-6 fade-up-1" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            {/* Fix 2 — tag: 15px, rgba(255,255,255,0.5) */}
            <p
              className="mb-8"
              style={{
                fontFamily: "'General Sans', system-ui, sans-serif",
                fontSize: "15px",
                letterSpacing: "0.12em",
                textTransform: "lowercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              brand identity infrastructure
            </p>

            <h1
              className="font-goldman mb-7 leading-[1.1]"
              style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
            >
              <span className="text-white">ai sees less than half</span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>of who your brand is</span>
            </h1>

            <p
              className="mb-10 max-w-xl leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px" }}
            >
              AI recommends based on popularity, not identity. Your brand becomes invisible. One line of code fixes that.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/onboard" className="btn-primary px-7 py-3.5 text-sm font-medium inline-block">
                build your brand.md
              </Link>
              <Link href="/questionnaire" className="btn-secondary px-7 py-3.5 text-sm inline-block">
                tell us about your brand
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div
        className="fade-up-2"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3">
            {[
              { num: "43",  label: "avg ai alignment / 100" },
              { num: "57%", label: "identity invisible to ai" },
              { num: "78",  label: "brands profiled" },
            ].map((s, i, arr) => (
              <div
                key={s.num}
                className="py-8 px-6 text-center"
                style={{ borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              >
                <div className="font-goldman text-white mb-1.5" style={{ fontSize: "44px", lineHeight: 1 }}>
                  {s.num}
                </div>
                {/* Fix 1 — labels: 0.3 → 0.5 */}
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MID ZONE — gradient still dark enough for white text ════════
          Fix 4+5: all mid-section text is white with opacity.
          Dark text only kicks in at the proof/CTA/footer sections
          which are at ~65%+ of the page where the bg gets light.
          ═══════════════════════════════════════════════════════════════ */}

      {/* Problem */}
      <section
        className="px-6 py-24 fade-up-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Fix 3 — tag: rgba(0,0,0,0.45) → too faint on dark bg; use white */}
          <p
            className="mb-6"
            style={{
              fontFamily: "'General Sans', system-ui, sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "lowercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            the problem
          </p>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              {/* Fix 4 — headline: dark → white */}
              <h2
                className="font-goldman mb-6"
                style={{ fontSize: "clamp(24px, 3vw, 30px)", color: "rgba(255,255,255,0.95)" }}
              >
                ai defaults to big brands. yours disappears.
              </h2>
              {/* Fix 4 — body: dark → rgba(255,255,255,0.6) */}
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                <p>
                  AI knows what you sell. It doesn&apos;t know who you are. When a consumer asks an AI agent for artisanal jewelry with a slow fashion ethos, it returns Tiffany. Ask for independent skincare rooted in wellness, it returns Neutrogena.
                </p>
                <p>
                  This isn&apos;t a size problem. It&apos;s a data problem. Your archetypes, values, community, aesthetic — everything that makes your brand yours — lives in your head and your captions. Not in any format AI can query.
                </p>
              </div>
            </div>

            {/* Visibility grid — white text on semi-transparent card */}
            <div
              className="p-6"
              style={{ background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}
            >
              <p
                className="mb-5"
                style={{
                  fontFamily: "'General Sans', system-ui, sans-serif",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.12em",
                  textTransform: "lowercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                what ai currently reads
              </p>
              <div className="space-y-3">
                {[
                  { label: "product category",    visible: true },
                  { label: "price tier",           visible: true },
                  { label: "website content",      visible: true },
                  { label: "brand archetypes",     visible: false },
                  { label: "core values",          visible: false },
                  { label: "community signals",    visible: false },
                  { label: "aesthetic identity",   visible: false },
                  { label: "cultural positioning", visible: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-4">
                    <div className="w-40 text-sm flex-shrink-0" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {row.label}
                    </div>
                    <div
                      className="flex-1 h-px"
                      style={{ background: row.visible ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.12)" }}
                    />
                    <div
                      className="text-xs w-16 text-right flex-shrink-0"
                      style={{ color: row.visible ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)" }}
                    >
                      {row.visible ? "visible" : "invisible"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-24 fade-up-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="mb-6"
            style={{
              fontFamily: "'General Sans', system-ui, sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "lowercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            how it works
          </p>
          <h2
            className="font-goldman mb-14"
            style={{ fontSize: "clamp(24px, 3vw, 30px)", color: "rgba(255,255,255,0.95)" }}
          >
            three steps. one line of code.
          </h2>

          <div
            className="grid md:grid-cols-3 gap-0"
            style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }}
          >
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
                  background: "rgba(255,255,255,0.06)",
                  borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <div className="font-goldman text-4xl mb-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {step.num}
                </div>
                <h3 className="font-goldman text-lg mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section
        className="px-6 py-24 fade-up-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="mb-6"
            style={{
              fontFamily: "'General Sans', system-ui, sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "lowercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            the integration
          </p>
          <h2
            className="font-goldman mb-3"
            style={{ fontSize: "clamp(24px, 3vw, 30px)", color: "rgba(255,255,255,0.95)" }}
          >
            this is all you add.
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
            paste it in your store&apos;s &lt;head&gt;. nothing else.
          </p>
          <div
            className="esina-code px-6 py-5 text-sm leading-relaxed overflow-x-auto"
            style={{
              maxWidth: "640px",
              color: "rgba(255,255,255,0.8)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {'<script src="https://esina-brand-identity.vercel.app/esina.js?brand=YOUR_BRAND_ID"></script>'}
          </div>
          <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            your brand id is generated when you complete onboarding. free forever.
          </p>
        </div>
      </section>

      {/* ══ BOTTOM ZONE — bg now light enough (~65%+) for dark text ═════ */}

      {/* Proof */}
      <section
        className="px-6 py-24 fade-up-6"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="section-tag-light mb-6">the proof</p>
          <h2
            className="font-goldman mb-10"
            style={{ fontSize: "clamp(24px, 3vw, 30px)", color: "rgba(0,0,0,0.75)" }}
          >
            same query. different intelligence.
          </h2>

          <div
            className="mb-10 px-5 py-4"
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: "2px",
              maxWidth: "560px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <p className="mb-2" style={{ fontSize: "0.6875rem", letterSpacing: "0.12em", color: "rgba(0,0,0,0.5)" }}>
              consumer →
            </p>
            <p className="text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>
              &ldquo;Artisanal jewelry that feels like wearable art. No logo, slow fashion, quiet luxury aesthetic.&rdquo;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4" style={{ maxWidth: "880px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-xs font-goldman tracking-widest" style={{ color: "rgba(0,0,0,0.7)" }}>
                  ESINA identity match
                </p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: "éliou",            score: "53%" },
                  { name: "Completedworks",   score: "49%" },
                  { name: "Lizzie Fortunato", score: "47%" },
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.3)", borderRadius: "2px" }}>
                    <span className="text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>{b.name}</span>
                    <span className="font-goldman text-sm" style={{ color: "rgba(0,0,0,0.8)" }}>{b.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-xs font-goldman tracking-widest" style={{ color: "rgba(0,0,0,0.25)" }}>
                  generic ai
                </p>
              </div>
              <div className="p-4 space-y-2">
                {[{ name: "Pandora" }, { name: "Tiffany & Co." }, { name: "Mejuri" }].map((b) => (
                  <div key={b.name} className="flex items-center justify-between px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.3)", borderRadius: "2px" }}>
                    <span className="text-sm" style={{ color: "rgba(0,0,0,0.25)" }}>{b.name}</span>
                    <span className="text-xs" style={{ color: "rgba(0,0,0,0.25)" }}>popular</span>
                  </div>
                ))}
                <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.3)", borderRadius: "2px" }}>
                  <span className="text-sm" style={{ color: "rgba(0,0,0,0.2)" }}>éliou not mentioned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 text-center">
        <div className="max-w-xl mx-auto">
          <h2
            className="font-goldman mb-2"
            style={{ fontSize: "clamp(24px, 3vw, 30px)", color: "rgba(0,0,0,0.75)" }}
          >
            free forever. pay when ai sends you customers.
          </h2>
          <p className="text-sm mb-12" style={{ color: "rgba(0,0,0,0.35)" }}>
            No subscriptions. No setup. One line of code.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/onboard" className="btn-cta-dark px-8 py-4 text-sm font-medium inline-block">
              get your brand.md
            </Link>
            <Link
              href="/match"
              className="px-8 py-4 text-sm inline-block"
              style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.2)", color: "rgba(0,0,0,0.4)", borderRadius: "2px" }}
            >
              see the demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs" style={{ color: "rgba(0,0,0,0.2)" }}>© 2026 ESINA</span>
          <nav className="flex items-center gap-6">
            <Link href="/brands"    className="nav-link-light">brands</Link>
            <Link href="/match"     className="nav-link-light">match</Link>
            <Link href="/translate" className="nav-link-light">translate</Link>
            <Link href="/audits"    className="nav-link-light">audits</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

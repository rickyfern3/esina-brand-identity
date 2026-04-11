export const dynamic = "force-dynamic";
export const revalidate = 300;

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import NavBar from "../components/NavBar";
import { brandSlug, dimensionSlug, DimensionType, DIMENSION_LABELS } from "@/lib/brand-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DimensionEntry {
  slug: string;
  display: string;
  count: number;
}

type TaxonomyMap = Record<DimensionType, DimensionEntry[]>;

export default async function DiscoverIndexPage() {
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select("id, brand_name, category, archetypes, style_tags, values, communities, status_signal_type, emotional_resonance");

  const all = brands || [];

  // Build frequency maps
  const freq: Record<DimensionType, Map<string, number>> = {
    archetype:  new Map(),
    style:      new Map(),
    value:      new Map(),
    community:  new Map(),
    category:   new Map(),
    signal:     new Map(),
    resonance:  new Map(),
  };

  for (const b of all) {
    // Archetypes
    const archetypes = (b.archetypes as { archetype: string }[]) || [];
    for (const a of archetypes) {
      if (a.archetype) {
        freq.archetype.set(a.archetype, (freq.archetype.get(a.archetype) || 0) + 1);
      }
    }
    // Style tags
    for (const t of (b.style_tags as string[]) || []) {
      freq.style.set(t, (freq.style.get(t) || 0) + 1);
    }
    // Values
    for (const v of (b.values as string[]) || []) {
      freq.value.set(v, (freq.value.get(v) || 0) + 1);
    }
    // Communities
    for (const c of (b.communities as string[]) || []) {
      freq.community.set(c, (freq.community.get(c) || 0) + 1);
    }
    // Category
    if (b.category) {
      freq.category.set(b.category, (freq.category.get(b.category) || 0) + 1);
    }
    // Status signal
    if (b.status_signal_type) {
      freq.signal.set(b.status_signal_type, (freq.signal.get(b.status_signal_type) || 0) + 1);
    }
    // Emotional resonance
    if (b.emotional_resonance) {
      freq.resonance.set(b.emotional_resonance, (freq.resonance.get(b.emotional_resonance) || 0) + 1);
    }
  }

  // Build taxonomy with threshold ≥1 (archetypes), ≥2 others
  const taxonomy: TaxonomyMap = {} as TaxonomyMap;
  const thresholds: Record<DimensionType, number> = {
    archetype: 1, style: 2, value: 2, community: 2, category: 1, signal: 1, resonance: 1,
  };

  for (const [type, map] of Object.entries(freq) as [DimensionType, Map<string, number>][]) {
    taxonomy[type] = Array.from(map.entries())
      .filter(([, count]) => count >= thresholds[type])
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        slug: dimensionSlug(type, value),
        display: value.replace(/_/g, " "),
        count,
      }));
  }

  const totalBrands = all.length;
  const totalDimensions = Object.values(taxonomy).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen">
      <NavBar
        links={[
          { href: "/brands", label: "brands" },
          { href: "/match", label: "match" },
          { href: "/audits", label: "audits" },
          { href: "/questionnaire", label: "add brand", primary: true },
        ]}
      />

      <main className="max-w-6xl mx-auto px-6 py-12" style={{ paddingTop: "88px" }}>

        {/* Header */}
        <div className="mb-12 fade-up-1">
          <h1 className="font-goldman text-5xl text-white mb-4" style={{ fontWeight: 700 }}>
            discover
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            explore brands by identity dimension — archetype, aesthetic, values, and community
          </p>
          <div className="flex gap-4 mt-8">
            {[
              { label: "brands indexed", value: totalBrands },
              { label: "dimensions", value: totalDimensions },
            ].map((s) => (
              <div key={s.label} className="px-5 py-4 card-dark">
                <p className="font-goldman text-2xl text-white" style={{ fontWeight: 700 }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Taxonomy sections */}
        {(
          [
            ["archetype", "archetypes"],
            ["category", "categories"],
            ["style", "style tags"],
            ["value", "brand values"],
            ["community", "communities"],
            ["signal", "status signals"],
            ["resonance", "emotional resonance"],
          ] as [DimensionType, string][]
        ).map(([type, heading], sectionIdx) => {
          const entries = taxonomy[type];
          if (!entries || entries.length === 0) return null;
          return (
            <section
              key={type}
              className={`mb-10 ${sectionIdx === 0 ? "fade-up-2" : sectionIdx === 1 ? "fade-up-3" : sectionIdx === 2 ? "fade-up-4" : ""}`}
            >
              <div className="flex items-baseline gap-3 mb-4">
                <p className="section-tag-mid">{heading}</p>
                <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.2)" }}>{entries.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entries.map(({ slug, display, count }) => (
                  <Link
                    key={slug}
                    href={`/discover/${slug}`}
                    className="flex items-center gap-2 px-4 py-2 esina-brand-card"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: "2px",
                      textDecoration: "none",
                    }}
                  >
                    <span className="text-sm capitalize" style={{ color: "rgba(0,0,0,0.6)" }}>
                      {display}
                    </span>
                    <span
                      className="font-goldman text-[11px]"
                      style={{ color: "rgba(0,0,0,0.25)", fontWeight: 700 }}
                    >
                      {count}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="py-8 mt-12" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs">
          <Link href="/" className="nav-link-light">esina</Link>
          <div className="flex items-center gap-6">
            <Link href="/brands" className="nav-link-light">brands</Link>
            <Link href="/audits" className="nav-link-light">audits</Link>
            <Link href="/match" className="nav-link-light">match</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

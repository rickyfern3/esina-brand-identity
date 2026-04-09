import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Auth guard — same pattern as other protected endpoints
  const auth = checkApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // ── 1. Archetype conversion rates ─────────────────────────────────────
    // Pull all match events that have a translated_profile with archetypes,
    // then aggregate in JS (Supabase free tier doesn't support jsonb_array_elements via RPC easily).
    const { data: allEvents, error: eventsError } = await supabase
      .from("match_events")
      .select(
        "id, attribution_status, translated_profile, consumer_signals, brand_profile_id, created_at"
      )
      .not("translated_profile", "is", null)
      .order("created_at", { ascending: false })
      .limit(5000); // cap to keep response fast

    if (eventsError) throw eventsError;

    // ── 2. Brand profiles for category lookups ────────────────────────────
    const brandProfileIds = [
      ...new Set(
        (allEvents ?? [])
          .map((e) => e.brand_profile_id)
          .filter(Boolean)
      ),
    ];

    let brandCategories: Record<string, string> = {};
    if (brandProfileIds.length > 0) {
      const { data: profiles } = await supabase
        .from("brand_profiles")
        .select("id, category")
        .in("id", brandProfileIds);
      (profiles ?? []).forEach((p) => {
        brandCategories[p.id] = p.category ?? "unknown";
      });
    }

    // ── Aggregate helpers ─────────────────────────────────────────────────
    const events = allEvents ?? [];
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const twoWeeksMs = 2 * oneWeekMs;

    // Counters
    const archetypeTotals: Record<string, number> = {};
    const archetypeConverted: Record<string, number> = {};
    const valueTotals: Record<string, number> = {};
    const valueConverted: Record<string, number> = {};
    const styleTagsThisWeek: Record<string, number> = {};
    const styleTagsLastWeek: Record<string, number> = {};
    const archetypeCategoryTotals: Record<string, number> = {};
    const archetypeCategoryConverted: Record<string, number> = {};

    // For top converting profiles: collect translated_profile from converted events
    const convertedProfiles: Array<{
      archetypes: string[];
      values: string[];
      style_tags: string[];
    }> = [];

    for (const event of events) {
      const tp = event.translated_profile as {
        archetypes?: Array<{ archetype: string; weight?: number; primary?: boolean }>;
        values?: string[];
        style_tags?: string[];
        communities?: string[];
      } | null;

      if (!tp) continue;

      const isConverted = event.attribution_status === "converted";
      const eventTs = new Date(event.created_at).getTime();
      const isThisWeek = now - eventTs < oneWeekMs;
      const isLastWeek =
        now - eventTs >= oneWeekMs && now - eventTs < twoWeeksMs;

      const category =
        brandCategories[event.brand_profile_id] ?? "unknown";

      // Primary archetype for this consumer signal
      const archetypes = tp.archetypes ?? [];
      const primaryArchetype =
        archetypes.find((a) => a.primary)?.archetype ??
        archetypes[0]?.archetype ??
        null;

      // Archetype conversion rates
      for (const a of archetypes) {
        const key = a.archetype;
        archetypeTotals[key] = (archetypeTotals[key] ?? 0) + 1;
        if (isConverted) {
          archetypeConverted[key] = (archetypeConverted[key] ?? 0) + 1;
        }
      }

      // Archetype × category combos
      if (primaryArchetype) {
        const comboKey = `${primaryArchetype}__${category}`;
        archetypeCategoryTotals[comboKey] =
          (archetypeCategoryTotals[comboKey] ?? 0) + 1;
        if (isConverted) {
          archetypeCategoryConverted[comboKey] =
            (archetypeCategoryConverted[comboKey] ?? 0) + 1;
        }
      }

      // Value-purchase correlations
      for (const v of tp.values ?? []) {
        valueTotals[v] = (valueTotals[v] ?? 0) + 1;
        if (isConverted) {
          valueConverted[v] = (valueConverted[v] ?? 0) + 1;
        }
      }

      // Style tag trends (this week vs last week)
      for (const tag of tp.style_tags ?? []) {
        if (isThisWeek) {
          styleTagsThisWeek[tag] = (styleTagsThisWeek[tag] ?? 0) + 1;
        } else if (isLastWeek) {
          styleTagsLastWeek[tag] = (styleTagsLastWeek[tag] ?? 0) + 1;
        }
      }

      // Top converting profiles
      if (isConverted && archetypes.length > 0) {
        convertedProfiles.push({
          archetypes: archetypes.map((a) => a.archetype),
          values: tp.values ?? [],
          style_tags: tp.style_tags ?? [],
        });
      }
    }

    // ── Build response sections ───────────────────────────────────────────

    // 1. Archetype conversion rates
    const archetypeConversionRates = Object.entries(archetypeTotals)
      .map(([archetype, total]) => ({
        archetype,
        total,
        converted: archetypeConverted[archetype] ?? 0,
        conversion_rate:
          total > 0
            ? Math.round(((archetypeConverted[archetype] ?? 0) / total) * 1000) /
              10
            : 0,
      }))
      .sort((a, b) => b.conversion_rate - a.conversion_rate);

    // 2. Value-purchase correlations
    const valuePurchaseCorrelations = Object.entries(valueTotals)
      .map(([value, total]) => ({
        value,
        total,
        converted: valueConverted[value] ?? 0,
        conversion_rate:
          total > 0
            ? Math.round(((valueConverted[value] ?? 0) / total) * 1000) / 10
            : 0,
        lift: (() => {
          const baseRate =
            events.filter((e) => e.attribution_status === "converted").length /
            Math.max(events.length, 1);
          const valueRate =
            (valueConverted[value] ?? 0) / Math.max(total, 1);
          return Math.round((valueRate / Math.max(baseRate, 0.001) - 1) * 100);
        })(),
      }))
      .filter((v) => v.total >= 3) // only statistically meaningful
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 20);

    // 3. Trending style tags (week-over-week)
    const allStyleTagKeys = new Set([
      ...Object.keys(styleTagsThisWeek),
      ...Object.keys(styleTagsLastWeek),
    ]);
    const trendingStyleTags = Array.from(allStyleTagKeys)
      .map((tag) => {
        const thisWeek = styleTagsThisWeek[tag] ?? 0;
        const lastWeek = styleTagsLastWeek[tag] ?? 0;
        const trend =
          lastWeek === 0
            ? thisWeek > 0
              ? 100
              : 0
            : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
        return { tag, this_week: thisWeek, last_week: lastWeek, trend_pct: trend };
      })
      .filter((t) => t.this_week > 0 || t.last_week > 0)
      .sort((a, b) => b.trend_pct - a.trend_pct)
      .slice(0, 30);

    // 4. Archetype × category conversion combos
    const archetypeCategoryMatrix = Object.entries(archetypeCategoryTotals)
      .map(([key, total]) => {
        const [archetype, category] = key.split("__");
        return {
          archetype,
          category,
          total,
          converted: archetypeCategoryConverted[key] ?? 0,
          conversion_rate:
            total > 0
              ? Math.round(
                  ((archetypeCategoryConverted[key] ?? 0) / total) * 1000
                ) / 10
              : 0,
        };
      })
      .filter((r) => r.total >= 2)
      .sort((a, b) => b.conversion_rate - a.conversion_rate)
      .slice(0, 25);

    // 5. Top consumer identity profiles leading to conversions
    //    Aggregate by counting archetype/value/tag combos across converted events
    const profileArchetypeFreq: Record<string, number> = {};
    const profileValueFreq: Record<string, number> = {};
    const profileTagFreq: Record<string, number> = {};

    for (const p of convertedProfiles) {
      for (const a of p.archetypes) {
        profileArchetypeFreq[a] = (profileArchetypeFreq[a] ?? 0) + 1;
      }
      for (const v of p.values) {
        profileValueFreq[v] = (profileValueFreq[v] ?? 0) + 1;
      }
      for (const t of p.style_tags) {
        profileTagFreq[t] = (profileTagFreq[t] ?? 0) + 1;
      }
    }

    const topConvertingIdentityDimensions = {
      total_converted: convertedProfiles.length,
      top_archetypes: Object.entries(profileArchetypeFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([archetype, count]) => ({ archetype, count })),
      top_values: Object.entries(profileValueFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([value, count]) => ({ value, count })),
      top_style_tags: Object.entries(profileTagFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([tag, count]) => ({ tag, count })),
    };

    // ── Summary stats ─────────────────────────────────────────────────────
    const totalEvents = events.length;
    const totalConverted = events.filter(
      (e) => e.attribution_status === "converted"
    ).length;
    const overallConversionRate =
      totalEvents > 0
        ? Math.round((totalConverted / totalEvents) * 1000) / 10
        : 0;

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      summary: {
        total_match_events: totalEvents,
        total_converted: totalConverted,
        overall_conversion_rate_pct: overallConversionRate,
        unique_archetypes: Object.keys(archetypeTotals).length,
        unique_values: Object.keys(valueTotals).length,
        unique_style_tags: allStyleTagKeys.size,
      },
      archetype_conversion_rates: archetypeConversionRates,
      value_purchase_correlations: valuePurchaseCorrelations,
      trending_style_tags: trendingStyleTags,
      archetype_category_matrix: archetypeCategoryMatrix,
      top_converting_identity_dimensions: topConvertingIdentityDimensions,
    });
  } catch (err) {
    console.error("[identity-trends]", err);
    return NextResponse.json(
      { error: "Failed to compute identity trends" },
      { status: 500 }
    );
  }
}

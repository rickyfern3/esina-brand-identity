export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Controlled vocabulary (mirrors questionnaire + translate-identity) ─

const KNOWN_ARCHETYPES = new Set([
  "creator", "sage", "explorer", "rebel", "lover", "caregiver",
  "jester", "everyperson", "hero", "ruler", "magician", "innocent",
]);

const KNOWN_VALUES = new Set([
  "sustainability", "transparency", "craftsmanship", "community", "innovation",
  "inclusivity", "heritage", "irreverence", "minimalism", "wellness",
  "independence", "authenticity", "luxury", "affordability", "boldness",
  "rebellion", "simplicity", "creativity", "performance", "tradition",
]);

const KNOWN_STYLE_TAGS = new Set([
  "minimalist", "maximalist", "brutalist", "cottagecore", "gorpcore",
  "streetwear", "vintage", "futuristic", "bohemian", "preppy",
  "industrial", "organic", "techwear", "avant_garde", "classic",
  "heritage", "artisanal", "raw", "elevated_basics", "athleisure",
]);

const KNOWN_COMMUNITIES = new Set([
  "skate", "yoga / wellness", "tech", "streetwear", "outdoor / adventure",
  "fitness", "art", "music", "gaming", "fashion", "food / cooking",
  "travel", "sustainability", "parenting", "luxury",
  "startup / entrepreneur", "creative",
]);

// Normalise for comparison (lowercase, trim)
const normalise = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

function isKnown(term: string, type: string): boolean {
  const n = normalise(term);
  switch (type) {
    case "archetype": return KNOWN_ARCHETYPES.has(n);
    case "value":     return KNOWN_VALUES.has(n);
    case "style_tag": return KNOWN_STYLE_TAGS.has(n);
    case "community": return KNOWN_COMMUNITIES.has(n);
    default:          return false;
  }
}

// ── Types ────────────────────────────────────────────────────────────

interface TraitOccurrence {
  term: string;
  type: string;
  eventIds: string[];
  convertedCount: number;
}

interface SchemaCandidate {
  id?: string;
  candidate_name: string;
  candidate_type: string;
  definition: string;
  evidence: string[];
  confidence_score: number;
  sample_count: number;
  status: string;
  first_detected?: string;
}

// ── GPT: name + define candidate dimensions ──────────────────────────

async function generateCandidateDefinitions(
  traits: Array<{ term: string; type: string; count: number; convertedCount: number }>
): Promise<Array<{ term: string; type: string; suggested_name: string; definition: string }>> {
  if (traits.length === 0) return [];

  const prompt = `You are a brand identity taxonomy expert. Below are emerging identity traits observed in converted consumer-brand matches that do NOT exist in our current controlled vocabulary.

For each trait, suggest a clean canonical name (lowercase_underscore for multi-word) and a 1-sentence definition suitable for adding to a brand identity schema.

Current controlled vocabulary for context:
- Archetypes: ${Array.from(KNOWN_ARCHETYPES).join(", ")}
- Values: ${Array.from(KNOWN_VALUES).join(", ")}
- Style tags: ${Array.from(KNOWN_STYLE_TAGS).join(", ")}
- Communities: ${Array.from(KNOWN_COMMUNITIES).join(", ")}

Traits to define:
${traits.map((t, i) => `${i + 1}. "${t.term}" (type: ${t.type}, seen in ${t.count} matches, ${t.convertedCount} converted)`).join("\n")}

Return ONLY a JSON array:
[{"term": "original_term", "type": "archetype|value|style_tag|community", "suggested_name": "clean_name", "definition": "one sentence definition"}]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 1500,
    messages: [
      { role: "system", content: "You are a taxonomy expert. Respond ONLY in valid JSON." },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "[]";
  try {
    const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("[schema-evolution] Failed to parse GPT definitions:", raw);
    return traits.map((t) => ({
      term: t.term,
      type: t.type,
      suggested_name: normalise(t.term).replace(/\s+/g, "_"),
      definition: `Emerging ${t.type} detected in ${t.count} converted matches.`,
    }));
  }
}

// ── Main endpoint ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = checkApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // ── 1. Pull converted match events with translated profiles ──────
    const { data: convertedEvents, error: eventsError } = await supabase
      .from("match_events")
      .select("id, translated_profile, created_at, brand_profile_id, brand_name, similarity_score")
      .eq("attribution_status", "converted")
      .not("translated_profile", "is", null)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (eventsError) throw eventsError;

    const events = convertedEvents ?? [];

    if (events.length === 0) {
      return NextResponse.json({
        generated_at: new Date().toISOString(),
        total_converted_analyzed: 0,
        novel_traits: [],
        candidates: [],
        existing_candidates: [],
        message: "No converted events with translated profiles found.",
      });
    }

    // ── 2. Extract all traits from converted profiles ────────────────
    //    Track novel traits (not in controlled vocabulary) with their event IDs
    const traitMap = new Map<string, TraitOccurrence>();

    const makeKey = (term: string, type: string) => `${type}::${normalise(term)}`;

    for (const event of events) {
      const tp = event.translated_profile as {
        archetypes?: Array<{ archetype: string; weight?: number }>;
        values?: string[];
        style_tags?: string[];
        communities?: string[];
      };
      if (!tp) continue;

      // Check archetypes
      for (const a of tp.archetypes ?? []) {
        if (!isKnown(a.archetype, "archetype")) {
          const key = makeKey(a.archetype, "archetype");
          const entry = traitMap.get(key) ?? {
            term: a.archetype,
            type: "archetype",
            eventIds: [],
            convertedCount: 0,
          };
          entry.eventIds.push(event.id);
          entry.convertedCount += 1;
          traitMap.set(key, entry);
        }
      }

      // Check values
      for (const v of tp.values ?? []) {
        if (!isKnown(v, "value")) {
          const key = makeKey(v, "value");
          const entry = traitMap.get(key) ?? {
            term: v,
            type: "value",
            eventIds: [],
            convertedCount: 0,
          };
          entry.eventIds.push(event.id);
          entry.convertedCount += 1;
          traitMap.set(key, entry);
        }
      }

      // Check style tags
      for (const tag of tp.style_tags ?? []) {
        if (!isKnown(tag, "style_tag")) {
          const key = makeKey(tag, "style_tag");
          const entry = traitMap.get(key) ?? {
            term: tag,
            type: "style_tag",
            eventIds: [],
            convertedCount: 0,
          };
          entry.eventIds.push(event.id);
          entry.convertedCount += 1;
          traitMap.set(key, entry);
        }
      }

      // Check communities
      for (const c of tp.communities ?? []) {
        if (!isKnown(c, "community")) {
          const key = makeKey(c, "community");
          const entry = traitMap.get(key) ?? {
            term: c,
            type: "community",
            eventIds: [],
            convertedCount: 0,
          };
          entry.eventIds.push(event.id);
          entry.convertedCount += 1;
          traitMap.set(key, entry);
        }
      }
    }

    // ── 3. Filter to candidates with 10+ converted matches ───────────
    const qualifiedTraits = Array.from(traitMap.values())
      .filter((t) => t.convertedCount >= 10)
      .sort((a, b) => b.convertedCount - a.convertedCount);

    // ── 4. Cluster analysis: find recurring archetype+value combos ───
    //    Look for co-occurring trait combinations in converted profiles
    const comboCounts = new Map<string, { count: number; eventIds: string[] }>();

    for (const event of events) {
      const tp = event.translated_profile as {
        archetypes?: Array<{ archetype: string }>;
        values?: string[];
      };
      if (!tp) continue;

      const primaryArch = tp.archetypes?.[0]?.archetype;
      const topValues = (tp.values ?? []).slice(0, 3);

      if (primaryArch && topValues.length >= 2) {
        // Create a sorted combo key for consistent grouping
        const comboKey = `${normalise(primaryArch)}+${topValues.map(normalise).sort().join("+")}`;
        const existing = comboCounts.get(comboKey) ?? { count: 0, eventIds: [] };
        existing.count += 1;
        existing.eventIds.push(event.id);
        comboCounts.set(comboKey, existing);
      }
    }

    // Recurring combos (10+ occurrences) that include novel traits
    const emergingClusters = Array.from(comboCounts.entries())
      .filter(([, v]) => v.count >= 10)
      .filter(([key]) => {
        // At least one trait in the combo is novel
        const parts = key.split("+");
        return parts.some(
          (p) =>
            !isKnown(p, "archetype") &&
            !isKnown(p, "value") &&
            !isKnown(p, "style_tag")
        );
      })
      .map(([combo, data]) => ({
        combo: combo.split("+"),
        count: data.count,
        event_ids: data.eventIds.slice(0, 20),
      }))
      .sort((a, b) => b.count - a.count);

    // ── 5. Generate definitions for qualified traits via GPT ─────────
    const traitsForGPT = qualifiedTraits.map((t) => ({
      term: t.term,
      type: t.type,
      count: t.eventIds.length,
      convertedCount: t.convertedCount,
    }));

    const definitions = await generateCandidateDefinitions(traitsForGPT);

    // ── 6. Upsert candidates into schema_candidates table ────────────
    const upsertedCandidates: SchemaCandidate[] = [];

    for (const trait of qualifiedTraits) {
      const def = definitions.find(
        (d) => normalise(d.term) === normalise(trait.term) && d.type === trait.type
      );

      const candidateName = def?.suggested_name ?? normalise(trait.term).replace(/\s+/g, "_");
      const definition = def?.definition ?? `Emerging ${trait.type} detected in ${trait.convertedCount} converted matches.`;

      // Calculate confidence score:
      // - Base: count / total_converted (frequency)
      // - Bonus for high counts
      const frequency = trait.convertedCount / Math.max(events.length, 1);
      const countBonus = Math.min(trait.convertedCount / 100, 0.3);
      const confidence = Math.min(Math.round((frequency + countBonus) * 100) / 100, 1.0);

      // Check if candidate already exists
      const { data: existing } = await supabase
        .from("schema_candidates")
        .select("id, status, evidence")
        .eq("candidate_name", candidateName)
        .eq("candidate_type", trait.type)
        .maybeSingle();

      if (existing) {
        // Update existing candidate with new evidence
        if (existing.status !== "rejected") {
          const existingEvidence = (existing.evidence as string[]) ?? [];
          const mergedEvidence = Array.from(new Set([...existingEvidence, ...trait.eventIds])).slice(0, 100);

          await supabase
            .from("schema_candidates")
            .update({
              evidence: mergedEvidence,
              confidence_score: confidence,
              sample_count: trait.convertedCount,
              last_updated: new Date().toISOString(),
              definition,
            })
            .eq("id", existing.id);

          upsertedCandidates.push({
            id: existing.id,
            candidate_name: candidateName,
            candidate_type: trait.type,
            definition,
            evidence: mergedEvidence,
            confidence_score: confidence,
            sample_count: trait.convertedCount,
            status: existing.status,
          });
        }
      } else {
        // Insert new candidate
        const { data: inserted, error: insertError } = await supabase
          .from("schema_candidates")
          .insert({
            candidate_name: candidateName,
            candidate_type: trait.type,
            definition,
            evidence: trait.eventIds.slice(0, 100),
            confidence_score: confidence,
            sample_count: trait.convertedCount,
          })
          .select()
          .single();

        if (insertError) {
          console.error("[schema-evolution] Insert error:", insertError.message);
        } else if (inserted) {
          upsertedCandidates.push({
            id: inserted.id,
            candidate_name: inserted.candidate_name,
            candidate_type: inserted.candidate_type,
            definition: inserted.definition,
            evidence: inserted.evidence,
            confidence_score: inserted.confidence_score,
            sample_count: inserted.sample_count,
            status: inserted.status,
            first_detected: inserted.first_detected,
          });
        }
      }
    }

    // ── 7. Fetch all existing candidates for the dashboard ────────────
    const { data: allCandidates } = await supabase
      .from("schema_candidates")
      .select("*")
      .order("confidence_score", { ascending: false });

    // ── 8. Return response ───────────────────────────────────────────
    return NextResponse.json({
      generated_at: new Date().toISOString(),
      total_converted_analyzed: events.length,
      novel_traits_detected: traitMap.size,
      qualified_candidates: qualifiedTraits.length,
      emerging_clusters: emergingClusters,
      candidates_upserted: upsertedCandidates,
      all_candidates: (allCandidates ?? []).map((c) => ({
        id: c.id,
        candidate_name: c.candidate_name,
        candidate_type: c.candidate_type,
        definition: c.definition,
        confidence_score: c.confidence_score,
        sample_count: c.sample_count,
        evidence_count: Array.isArray(c.evidence) ? c.evidence.length : 0,
        first_detected: c.first_detected,
        last_updated: c.last_updated,
        status: c.status,
        approved_at: c.approved_at,
      })),
    });
  } catch (err) {
    console.error("[schema-evolution]", err);
    return NextResponse.json(
      { error: "Failed to run schema evolution analysis" },
      { status: 500 }
    );
  }
}

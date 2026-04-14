export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalize(s: string): string {
  return s.toLowerCase().replace(/[''`]/g, "'").replace(/\s+/g, " ").trim();
}

const ARCHETYPE_NAMES = ["creator","sage","explorer","rebel","lover","caregiver","jester","everyperson","hero","ruler","magician","innocent"];
const VALUE_NAMES = ["sustainability","transparency","craftsmanship","community","innovation","inclusivity","heritage","irreverence","minimalism","wellness","independence","authenticity","luxury","affordability","boldness","rebellion","simplicity","creativity","performance","tradition"];
const AESTHETIC_NAMES = ["minimalist","maximalist","brutalist","cottagecore","gorpcore","streetwear","vintage","futuristic","bohemian","preppy","industrial","organic","techwear","avant_garde","classic","heritage","artisanal","raw","elevated_basics","athleisure"];
const STATUS_SIGNALS = ["conspicuous","quiet_luxury","counterculture","accessible_premium","anti_status"];
const EMOTIONAL_RESONANCES = ["serenity","empowerment","belonging","excitement","rebellion","nostalgia","joy","confidence","comfort"];

const TYPE_CONTEXTS: Record<string, string> = {
  song: "a song the brand says represents them",
  scent: "a scent descriptor the brand uses to describe themselves",
  neighborhood: "a neighborhood or place the brand identifies with culturally",
  dinner_guest: "a figure (real or fictional, alive or dead) the brand would invite to dinner",
  texture: "a tactile texture that represents the brand's material identity",
  enemy: "something the brand exists to fight against — their cultural enemy",
};

export async function POST(req: NextRequest) {
  try {
    const { signal_type, signal_value } = await req.json();

    if (!signal_type || !signal_value) {
      return NextResponse.json({ error: "signal_type and signal_value required" }, { status: 400 });
    }

    const normalized = normalize(signal_value);
    const context = TYPE_CONTEXTS[signal_type] || "a brand signal";

    // Check if already exists
    const { data: existing } = await supabase
      .from("mapping_ontology")
      .select("*")
      .eq("signal_type", signal_type)
      .eq("signal_value_normalized", normalized)
      .maybeSingle();

    if (existing) {
      // Increment usage and return
      await supabase
        .from("mapping_ontology")
        .update({ usage_count: (existing.usage_count || 1) + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return NextResponse.json({ mapping: existing, cached: true });
    }

    // Map with GPT
    const prompt = `Map this brand identity signal to identity dimensions. The signal is ${context}.

Signal value: "${signal_value}"

Return ONLY valid JSON (no markdown) with exactly these fields:
{
  "archetype_weights": { ${ARCHETYPE_NAMES.map(a => `"${a}": 0`).join(", ")} },
  "value_associations": ["from this list only: ${VALUE_NAMES.join(", ")}"],
  "aesthetic_associations": ["from this list only: ${AESTHETIC_NAMES.join(", ")}"],
  "community_associations": ["2-3 lowercase community names"],
  "status_signal": "one of: ${STATUS_SIGNALS.join(", ")}",
  "emotional_resonance": "one of: ${EMOTIONAL_RESONANCES.join(", ")}"
}

Rules:
- archetype_weights values should sum to approximately 1.0. Only include archetypes with weight > 0.
- value_associations: 2-4 items
- aesthetic_associations: 2-4 items
- community_associations: 1-3 items
- Be specific and culturally accurate. Trust the specific signal over generic defaults.`;

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        { role: "system", content: "You are a brand identity analyst. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    });

    const raw = res.choices[0]?.message?.content?.trim() || "{}";
    const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
    let mapping: Record<string, unknown>;
    try {
      mapping = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse GPT mapping" }, { status: 500 });
    }

    // Store in DB with low confidence (0.3 — GPT-generated custom)
    const { data: inserted } = await supabase
      .from("mapping_ontology")
      .insert({
        signal_type,
        signal_value,
        signal_value_normalized: normalized,
        archetype_weights: mapping.archetype_weights || {},
        value_associations: mapping.value_associations || [],
        aesthetic_associations: mapping.aesthetic_associations || [],
        community_associations: mapping.community_associations || [],
        status_signal: mapping.status_signal || null,
        emotional_resonance: mapping.emotional_resonance || null,
        confidence: 0.3,
        usage_count: 1,
        version: 1,
      })
      .select()
      .maybeSingle();

    return NextResponse.json({ mapping: inserted || mapping, cached: false });
  } catch (err) {
    console.error("[ontology/map-custom]", err);
    return NextResponse.json({ error: "Mapping failed" }, { status: 500 });
  }
}

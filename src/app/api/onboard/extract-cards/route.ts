export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
import { generateIdentityText } from "@/lib/identity-text";
import { calculateGapAnalysis, type BrandSelfReport, type AIPerception } from "@/lib/gap-analysis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────

export interface CardPayload {
  // Card 1
  brandName: string;
  foundingYear: string;
  productDescription: string;
  // Card 2
  song: { selected: { title: string; artist: string } | null; custom: string };
  // Card 3
  scent: { selected: string[]; custom: string };
  // Card 4
  neighborhood: { selected: { name: string; city: string } | null; custom: string };
  // Card 5
  dinnerParty: { guest1: string; guest2: string; guest3: string; respectedOrLoved: "respected" | "loved" | null };
  // Card 6
  enemies: { selected: string[]; custom: string };
  // Card 7
  textures: { selected: string[] };
  // Card 8
  moodboard: { images: string[]; description: string; famousOrMysterious: "famous" | "mysterious" | null };
  // Card 9
  final: { randomMoment: string; firstOrBest: "first" | "best" | null; loudOrQuiet: "loud" | "quiet" | null };
  // Meta
  contactEmail?: string;
}

// ── System prompt ─────────────────────────────────────────────────────

const EXTRACT_SYSTEM_PROMPT = `You are extracting a structured brand identity profile from a multi-modal oblique identity extraction session. The founder provided sensory, cultural, and scenario-based responses. Map these signals to identity dimensions:

- Song → primary archetype, emotional resonance, aesthetic era, energy level
- Scent descriptors → aesthetic identity, design language, emotional tone
- Neighborhood → cultural positioning, community, status signal
- Dinner party guests → values, aspirations. Look for the PATTERN across all three guests.
- Respected/loved → Respected = Sage/Ruler. Loved = Caregiver/Everyman.
- Cultural enemies → anti-values, differentiation, brand mission
- Texture descriptors → design language, visual tone
- Moodboard images or description → visual tone, aesthetic, color palette, emotional register
- Famous/mysterious → Famous = Hero/Ruler. Mysterious = Magician/Explorer.
- Random moment → holistic identity synthesis
- First/best → First = Hero/Pioneer. Best = Sage/Craftsman.
- Loud/quiet → Loud = Rebel/Jester. Quiet = Sage/Creator.

CONSISTENCY CHECK (silent): Compare sensory responses against cultural coordinates against forced trade-offs. Weight the more specific, less coachable response higher — sensory and scenario responses are more reliable than trade-off selections. Note contradictions in consistency_notes but do NOT surface them to the founder.

Generate TWO outputs in ONE JSON object:

OUTPUT 1 — STRUCTURED PROFILE (approximate labels):
archetypes (with weights summing to 1.0, primary flag), values (4-6 from controlled vocabulary), anti_values (2-4), style_tags (3-5), communities (2-5), status_signal_type, emotional_resonance, voice_tone, humor_level, design_language, visual_tone, sustainability_level, origin_story, founder_philosophy, differentiation_claim, identity_statements (2-3), identity_text (3-5 sentence summary), category, price_tier, brand_adjacencies.

Controlled vocabulary:
- archetypes: creator, sage, explorer, rebel, lover, caregiver, jester, everyperson, hero, ruler, magician, innocent
- values: sustainability, transparency, craftsmanship, community, innovation, inclusivity, heritage, irreverence, minimalism, wellness, independence, authenticity, luxury, affordability, boldness, rebellion, simplicity, creativity, performance, tradition
- anti_values: corporate, mass_market, disposable, pretentious, basic, generic, exclusive, cheap, boring, conformist, wasteful, elitist
- style_tags: minimalist, maximalist, brutalist, cottagecore, gorpcore, streetwear, vintage, futuristic, bohemian, preppy, industrial, organic, techwear, avant_garde, classic, heritage, artisanal, raw, elevated_basics, athleisure
- status_signal_type: conspicuous, quiet_luxury, counterculture, accessible_premium, anti_status
- emotional_resonance: serenity, empowerment, belonging, excitement, rebellion, nostalgia, joy, confidence, comfort
- voice_tone: formal, casual, irreverent, authoritative, warm, edgy
- humor_level: none, subtle, moderate, central_to_brand
- design_language: clean, ornate, raw, polished, eclectic, industrial
- visual_tone: serious, playful, ironic, aspirational, authentic, provocative
- sustainability_level: none, basic, committed, leader, regenerative
- category: Fashion & Apparel | Food & Beverage | Beauty & Personal Care | Health & Wellness | Home & Lifestyle | Tech & Accessories | Sports & Outdoor | Entertainment & Media | Other
- price_tier: budget, value, mid, premium, luxury

OUTPUT 2 — IDENTITY SIGNATURE (300-500 words, the real identity):
Preserve every specific cultural reference exactly as given. Name the exact song and what it reveals. Describe the scent combination word-for-word. Name all three dinner guests and explain the pattern they reveal together. Preserve the neighborhood as a cultural coordinate. Include the trade-off choices and what they reveal in combination. Preserve the cultural rejection in full. Describe the random moment with full sensory detail. Name the brand enemy. Weave into a cohesive narrative that reads like a vivid portrait of the brand's soul.

Also include: consistency_notes (internal quality check — note any signal contradictions).

Return ONLY valid JSON with all OUTPUT 1 fields + identity_signature + consistency_notes. No markdown, no explanation.`;

// ── Helpers (same as extract/route.ts) ───────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function queryAI(system: string, user: string): Promise<Record<string, unknown>> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 1500,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  return parseJSON(res.choices[0]?.message?.content || "{}");
}

async function queryGeneralPerception(brandName: string, category: string) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format with no additional text.",
    `Analyze the brand "${brandName}" in the "${category}" category. Based on your knowledge, provide:
{
  "brand_known": true,
  "perceived_archetypes": ["archetype1", "archetype2"],
  "perceived_values": ["value1", "value2", "value3"],
  "perceived_style_tags": ["style1", "style2"],
  "perceived_price_tier": "budget|value|mid|premium|luxury",
  "perceived_target_demographic": "description",
  "perceived_communities": ["community1", "community2"],
  "perceived_status_signal": "conspicuous|quiet_luxury|counterculture|accessible_premium|anti_status",
  "perceived_voice_tone": "formal|casual|irreverent|authoritative|warm|edgy",
  "perceived_strengths": ["strength1"],
  "perceived_weaknesses": ["weakness1"],
  "one_sentence_description": "description"
}`
  );
}

async function queryCompetitivePositioning(brandName: string, category: string) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format.",
    `For the brand "${brandName}" in "${category}", analyze competitive positioning:
{
  "direct_competitors": ["c1", "c2"],
  "identity_differentiators": ["d1"],
  "identity_overlaps": ["o1"],
  "cultural_positioning": "description",
  "trend_alignment": ["t1"],
  "recommendation_likelihood": "high|medium|low"
}`
  );
}

async function queryConsumerSimulation(brandName: string, category: string, identityDesc: string) {
  return queryAI(
    "You are a shopping assistant. Respond ONLY in valid JSON format.",
    `A consumer asks: "I'm looking for a ${category} brand that is ${identityDesc}. What would you recommend?"
{
  "brand_mentioned": true,
  "mention_position": 1,
  "brands_recommended_instead": ["b1"],
  "why_recommended_or_not": "explanation",
  "identity_accuracy": "description"
}`
  );
}

function calculateCompleteness(profile: Record<string, unknown>): number {
  const fields = ["brand_name","category","price_tier","archetypes","values","anti_values","style_tags","voice_tone","status_signal_type","communities","emotional_resonance","sustainability_level","origin_story","differentiation_claim"];
  const filled = fields.filter((f) => { const v = profile[f]; if (Array.isArray(v)) return v.length > 0; return v !== null && v !== undefined && v !== ""; });
  return Math.round((filled.length / fields.length) * 100) / 100;
}

const VALID_CATEGORIES = new Set(["Fashion & Apparel","Food & Beverage","Beauty & Personal Care","Health & Wellness","Home & Lifestyle","Tech & Accessories","Sports & Outdoor","Entertainment & Media","Other"]);
const VALID_VALUES = new Set(["sustainability","transparency","craftsmanship","community","innovation","inclusivity","heritage","irreverence","minimalism","wellness","independence","authenticity","luxury","affordability","boldness","rebellion","simplicity","creativity","performance","tradition"]);
const VALID_ANTI_VALUES = new Set(["corporate","mass_market","disposable","pretentious","basic","generic","exclusive","cheap","boring","conformist","wasteful","elitist"]);
const VALID_STYLE_TAGS = new Set(["minimalist","maximalist","brutalist","cottagecore","gorpcore","streetwear","vintage","futuristic","bohemian","preppy","industrial","organic","techwear","avant_garde","classic","heritage","artisanal","raw","elevated_basics","athleisure"]);
const VALID_PRICE_TIERS = new Set(["budget","value","mid","premium","luxury"]);
const VALID_STATUS_SIGNALS = new Set(["conspicuous","quiet_luxury","counterculture","accessible_premium","anti_status"]);
const VALID_EMOTIONAL = new Set(["serenity","empowerment","belonging","excitement","rebellion","nostalgia","joy","confidence","comfort"]);
const VALID_VOICE_TONE = new Set(["formal","casual","irreverent","authoritative","warm","edgy"]);
const VALID_HUMOR = new Set(["none","subtle","moderate","central_to_brand"]);
const VALID_DESIGN = new Set(["clean","ornate","raw","polished","eclectic","industrial"]);
const VALID_VISUAL = new Set(["serious","playful","ironic","aspirational","authentic","provocative"]);
const VALID_SUSTAINABILITY = new Set(["none","basic","committed","leader","regenerative"]);
const VALID_ARCHETYPES = new Set(["creator","sage","explorer","rebel","lover","caregiver","jester","everyperson","hero","ruler","magician","innocent"]);

const sanitizeArr = (arr: unknown, validSet: Set<string>): string[] =>
  Array.isArray(arr) ? (arr as string[]).filter(v => validSet.has(v)) : [];
const sanitizeEnum = (val: unknown, validSet: Set<string>, fallback: string | null = null): string | null => {
  if (typeof val === "string" && validSet.has(val)) return val;
  return fallback;
};

// ── Build user prompt from card payload ───────────────────────────────

function buildUserPrompt(payload: CardPayload): string {
  const { brandName, foundingYear, productDescription, song, scent, neighborhood, dinnerParty, enemies, textures, moodboard, final } = payload;

  const songDesc = song.selected
    ? `"${song.selected.title}" by ${song.selected.artist}`
    : song.custom || "not specified";

  const scentList = [...scent.selected, ...(scent.custom ? [scent.custom] : [])].join(", ") || "not specified";

  const neighborhoodName = neighborhood.selected
    ? `${neighborhood.selected.name}${neighborhood.selected.city ? `, ${neighborhood.selected.city}` : ""}`
    : neighborhood.custom || "not specified";

  const guests = [dinnerParty.guest1, dinnerParty.guest2, dinnerParty.guest3].filter(Boolean).join(", ");

  const enemyList = [...enemies.selected, ...(enemies.custom ? [enemies.custom] : [])].join(", ") || "not specified";

  const textureList = textures.selected.join(", ") || "not specified";

  const moodboardDesc = moodboard.description || (moodboard.images.length > 0 ? `[${moodboard.images.length} image(s) uploaded]` : "none");

  return `Brand Identity Card Session Data:

BRAND NAME: ${brandName}
FOUNDED: ${foundingYear}
WHAT THEY SELL: ${productDescription}

CARD 2 — SONG:
Selected song: ${songDesc}

CARD 3 — SCENT:
Scent descriptors: ${scentList}

CARD 4 — NEIGHBORHOOD:
Selected neighborhood: ${neighborhoodName}

CARD 5 — DINNER PARTY:
Guests: ${guests || "not specified"}
Trade-off: deeply ${dinnerParty.respectedOrLoved || "not chosen"}

CARD 6 — CULTURAL ENEMY:
Enemies: ${enemyList}

CARD 7 — TEXTURE:
Textures: ${textureList}

CARD 8 — MOODBOARD:
${moodboardDesc}
Trade-off: ${moodboard.famousOrMysterious || "not chosen"}

CARD 9 — FINAL:
Random moment: ${final.randomMoment || "not specified"}
Trade-off 1: ${final.firstOrBest || "not chosen"} (first vs best)
Trade-off 2: ${final.loudOrQuiet || "not chosen"} (loud vs quiet)`;
}

// ── Route ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload: CardPayload & { contactEmail?: string } = await req.json();

    if (!payload.brandName) {
      return NextResponse.json({ error: "brandName required" }, { status: 400 });
    }

    const userPrompt = buildUserPrompt(payload);

    // Build multimodal messages if images were uploaded
    type OAIContent = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "low" } };
    const userContent: OAIContent[] = [{ type: "text", text: userPrompt }];
    if (payload.moodboard.images.length > 0) {
      for (const img of payload.moodboard.images.slice(0, 5)) {
        userContent.push({ type: "image_url", image_url: { url: img, detail: "low" } });
      }
    }

    const extractionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 3000,
      messages: [
        { role: "system", content: EXTRACT_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const raw = extractionRes.choices[0]?.message?.content?.trim() || "{}";
    let extracted: Record<string, unknown>;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
      extracted = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse extraction. Please try again." }, { status: 500 });
    }

    // Override brand_name from card 1 (source of truth)
    extracted.brand_name = payload.brandName;

    // Identity text + signature
    const generatedText = generateIdentityText(extracted as unknown as Parameters<typeof generateIdentityText>[0]);
    const identityText = (extracted.identity_text as string)?.length > generatedText.length
      ? extracted.identity_text as string
      : generatedText;
    const identitySignature = (extracted.identity_signature as string) || null;
    const embeddingSource = identitySignature || identityText;

    // Embedding
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embeddingSource,
    });
    const embedding = embeddingRes.data[0].embedding;

    // Completeness
    const completeness = calculateCompleteness(extracted);

    // Sanitize
    const rawArchetypes = Array.isArray(extracted.archetypes) ? extracted.archetypes as Array<{ archetype?: string; weight?: number; primary?: boolean }> : [];
    const sanitizedArchetypes = rawArchetypes.filter(a => a.archetype && VALID_ARCHETYPES.has(a.archetype));

    // Insert brand profile
    const insertData = {
      brand_name: payload.brandName,
      ...(payload.contactEmail ? { contact_email: payload.contactEmail } : {}),
      category: VALID_CATEGORIES.has(extracted.category as string) ? (extracted.category as string) : "Other",
      price_tier: sanitizeEnum(extracted.price_tier, VALID_PRICE_TIERS),
      archetypes: sanitizedArchetypes,
      values: sanitizeArr(extracted.values, VALID_VALUES).slice(0, 5),
      anti_values: sanitizeArr(extracted.anti_values, VALID_ANTI_VALUES).slice(0, 3),
      style_tags: sanitizeArr(extracted.style_tags, VALID_STYLE_TAGS).slice(0, 5),
      design_language: sanitizeEnum(extracted.design_language, VALID_DESIGN),
      visual_tone: sanitizeEnum((extracted.visual_tone as string)?.toLowerCase(), VALID_VISUAL),
      voice_tone: sanitizeEnum(extracted.voice_tone, VALID_VOICE_TONE),
      humor_level: sanitizeEnum(extracted.humor_level, VALID_HUMOR),
      emotional_resonance: sanitizeEnum(extracted.emotional_resonance, VALID_EMOTIONAL),
      sustainability_level: sanitizeEnum(extracted.sustainability_level, VALID_SUSTAINABILITY),
      status_signal_type: sanitizeEnum(extracted.status_signal_type, VALID_STATUS_SIGNALS),
      communities: ((extracted.communities as string[]) || []).slice(0, 5),
      brand_adjacencies: (extracted.brand_adjacencies as string[]) || [],
      identity_statements: (extracted.identity_statements as string[]) || [],
      trend_alignment: [],
      origin_story: (extracted.origin_story as string) || null,
      founder_philosophy: (extracted.founder_philosophy as string) || null,
      differentiation_claim: (extracted.differentiation_claim as string) || null,
      profile_completeness: completeness,
      profile_status: "complete",
      identity_text: identityText,
      identity_signature: identitySignature,
      identity_embedding: embedding,
      onboard_source: "card_flow",
    };

    const { data: brand, error: insertErr } = await supabase
      .from("brand_profiles")
      .insert(insertData)
      .select("id, brand_name, category")
      .single();

    if (insertErr || !brand) {
      // Retry without onboard_source
      const { data: brand2, error: insertErr2 } = await supabase
        .from("brand_profiles")
        .insert({ ...insertData, onboard_source: undefined })
        .select("id, brand_name, category")
        .single();
      if (insertErr2 || !brand2) {
        return NextResponse.json({ error: `Save failed: ${insertErr2?.message || insertErr?.message}` }, { status: 500 });
      }
      return await runAuditAndReturn(brand2, extracted, identityText, identitySignature);
    }

    return await runAuditAndReturn(brand, extracted, identityText, identitySignature);
  } catch (err) {
    console.error("[extract-cards]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

async function runAuditAndReturn(
  brand: { id: string; brand_name: string; category: string },
  extracted: Record<string, unknown>,
  identityText: string,
  identitySignature: string | null
): Promise<NextResponse> {
  // Normalize archetypes — GPT sometimes returns an object instead of an array
  const safeArchetypes = Array.isArray(extracted.archetypes)
    ? (extracted.archetypes as Array<{ archetype: string; weight: number; primary: boolean }>)
    : [];

  const identityDesc = identitySignature
    ? identitySignature.split(".").slice(0, 3).join(".").trim()
    : identityText.split(".").slice(0, 2).join(".").trim();

  const [q1, q2, q3] = await Promise.all([
    queryGeneralPerception(brand.brand_name, brand.category),
    queryCompetitivePositioning(brand.brand_name, brand.category),
    queryConsumerSimulation(brand.brand_name, brand.category, identityDesc),
  ]);

  const perception: AIPerception = {
    brand_known: (q1.brand_known as boolean) ?? true,
    perceived_archetypes: (q1.perceived_archetypes as string[]) || [],
    perceived_values: (q1.perceived_values as string[]) || [],
    perceived_style_tags: (q1.perceived_style_tags as string[]) || [],
    perceived_price_tier: (q1.perceived_price_tier as string) || "unknown",
    perceived_target_demographic: (q1.perceived_target_demographic as string) || "",
    perceived_communities: (q1.perceived_communities as string[]) || [],
    perceived_status_signal: (q1.perceived_status_signal as string) || "unknown",
    perceived_voice_tone: (q1.perceived_voice_tone as string) || "unknown",
    perceived_strengths: (q1.perceived_strengths as string[]) || [],
    perceived_weaknesses: (q1.perceived_weaknesses as string[]) || [],
    one_sentence_description: (q1.one_sentence_description as string) || "",
    direct_competitors: (q2.direct_competitors as string[]) || [],
    identity_differentiators: (q2.identity_differentiators as string[]) || [],
    identity_overlaps: (q2.identity_overlaps as string[]) || [],
    cultural_positioning: (q2.cultural_positioning as string) || "",
    trend_alignment: (q2.trend_alignment as string[]) || [],
    recommendation_likelihood: (q2.recommendation_likelihood as string) || "low",
    brand_mentioned: (q3.brand_mentioned as boolean) ?? false,
    mention_position: (q3.mention_position as number) || null,
    brands_recommended_instead: (q3.brands_recommended_instead as string[]) || [],
    why_recommended_or_not: (q3.why_recommended_or_not as string) || "",
    identity_accuracy: (q3.identity_accuracy as string) || "",
  };

  const selfReport: BrandSelfReport = {
    brand_name: brand.brand_name,
    category: brand.category,
    archetypes: safeArchetypes,
    values: (extracted.values as string[]) || [],
    style_tags: (extracted.style_tags as string[]) || [],
    price_tier: (extracted.price_tier as string) || null,
    voice_tone: (extracted.voice_tone as string) || null,
    status_signal_type: (extracted.status_signal_type as string) || null,
    communities: (extracted.communities as string[]) || [],
    identity_text: identityText,
    identity_signature: identitySignature,
    differentiation_claim: (extracted.differentiation_claim as string) || null,
  };

  const gap = calculateGapAnalysis(selfReport, perception);

  await supabase.from("perception_audits").insert({
    brand_profile_id: brand.id,
    ai_model_used: "gpt-4o-mini",
    query_category: "full_audit",
    raw_ai_response: JSON.stringify({ q1, q2, q3 }),
    perceived_archetypes: perception.perceived_archetypes,
    perceived_values: perception.perceived_values,
    perceived_style_tags: perception.perceived_style_tags,
    perceived_price_tier: perception.perceived_price_tier,
    perceived_target_demographic: perception.perceived_target_demographic,
    perceived_communities: perception.perceived_communities,
    perceived_status_signal: perception.perceived_status_signal,
    perceived_voice_tone: perception.perceived_voice_tone,
    perceived_strengths: perception.perceived_strengths,
    perceived_weaknesses: perception.perceived_weaknesses,
    identity_alignment_score: gap.alignmentScore,
    aligned_dimensions: gap.alignedDimensions,
    gap_dimensions: gap.gapDimensions,
    gap_details: { dimensions: gap.dimensions, missingDimensions: gap.missingDimensions, oneSentenceDescription: gap.oneSentenceDescription, competitiveData: q2, consumerSimData: q3 },
    recommendations: gap.recommendations,
  });

  await supabase.from("brand_profiles").update({ profile_status: "audited" }).eq("id", brand.id);

  return NextResponse.json({
    brandId: brand.id,
    brandName: brand.brand_name,
    auditScore: gap.alignmentScore,
    profile: {
      archetypes: safeArchetypes,
      values: extracted.values,
      anti_values: extracted.anti_values,
      style_tags: extracted.style_tags,
      communities: extracted.communities,
      status_signal_type: extracted.status_signal_type,
      emotional_resonance: extracted.emotional_resonance,
      identity_text: identityText,
      identity_signature: identitySignature,
      identity_statements: extracted.identity_statements,
      one_sentence_description: gap.oneSentenceDescription,
      recommendations: gap.recommendations,
    },
  });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
import { generateIdentityText } from "@/lib/identity-text";
import { calculateGapAnalysis, type BrandSelfReport, type AIPerception } from "@/lib/gap-analysis";
import type { ChatMessage } from "../chat/route";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Extraction prompt ──────────────────────────────────────────────────

const EXTRACT_SYSTEM_PROMPT = `Extract a structured brand identity profile from this conversation transcript. Return ONLY valid JSON — no markdown, no explanation.

The JSON must match this exact schema:
{
  "brand_name": string,
  "category": string,           // one of: Fashion & Apparel | Food & Beverage | Beauty & Personal Care | Health & Wellness | Home & Lifestyle | Hospitality & Travel | Tech & Accessories | Sports & Outdoor | Entertainment & Media | Automotive | Pets | Baby & Kids | Financial Services | Education | Other
  "price_tier": string,         // one of: budget | value | mid | premium | luxury
  "archetypes": [{ "archetype": string, "weight": number (0-1, sum to 1.0), "primary": boolean }],
  "values": [string],           // 4-6 items from: sustainability, transparency, craftsmanship, community, innovation, inclusivity, heritage, irreverence, minimalism, wellness, independence, authenticity, luxury, affordability, boldness, rebellion, simplicity, creativity, performance, tradition
  "anti_values": [string],      // 2-4 items from: corporate, mass_market, disposable, pretentious, basic, generic, exclusive, cheap, boring, conformist, wasteful, elitist
  "style_tags": [string],       // 3-5 items from: minimalist, maximalist, brutalist, cottagecore, gorpcore, streetwear, vintage, futuristic, bohemian, preppy, industrial, organic, techwear, avant_garde, classic, heritage, artisanal, raw, elevated_basics, athleisure
  "communities": [string],      // 2-5 lowercase community names e.g. "yoga / wellness", "skate", "tech", "food / cooking"
  "status_signal_type": string, // one of: conspicuous | quiet_luxury | counterculture | accessible_premium | anti_status
  "emotional_resonance": string,// one of: serenity | empowerment | belonging | excitement | rebellion | nostalgia | joy | confidence | comfort
  "voice_tone": string,         // one of: formal | casual | irreverent | authoritative | warm | edgy
  "humor_level": string,        // one of: none | subtle | moderate | central_to_brand
  "design_language": string,    // one of: clean | ornate | raw | polished | eclectic | industrial
  "visual_tone": string,        // one of: serious | playful | ironic | aspirational | authentic | provocative
  "sustainability_level": string,// one of: none | basic | committed | leader | regenerative
  "brand_adjacencies": [string],// brands the founder mentioned that customers also love
  "origin_story": string,       // 1-3 sentences from what the founder shared
  "founder_philosophy": string, // the core belief or conviction that drives the brand
  "differentiation_claim": string, // what makes this brand different
  "identity_statements": [string], // 2-3 statements about what choosing this brand says about the buyer
  "identity_text": string       // 3-5 sentence narrative summary of the brand's full identity, written in third person, rich with the identity dimensions above
}

Rules:
- Use ONLY the exact controlled vocabulary listed above for each enum field
- Infer dimensions the founder didn't explicitly state based on strong context clues
- If a dimension genuinely cannot be inferred, use the most neutral/generic option
- archetype valid values: creator, sage, explorer, rebel, lover, caregiver, jester, everyperson, hero, ruler, magician, innocent
- identity_text should be a rich narrative that captures the full brand identity — this gets embedded and used for AI matching
- Return ONLY the JSON object, no other text`;

// ── AI audit helpers (same as submit-profile) ─────────────────────────

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
  "perceived_strengths": ["strength1", "strength2"],
  "perceived_weaknesses": ["weakness1", "weakness2"],
  "one_sentence_description": "How would you describe this brand to someone who's never heard of it?"
}`
  );
}

async function queryCompetitivePositioning(brandName: string, category: string) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format.",
    `For the brand "${brandName}" in "${category}", analyze competitive positioning:
{
  "direct_competitors": ["c1", "c2", "c3"],
  "identity_differentiators": ["differentiator1"],
  "identity_overlaps": ["overlap1"],
  "cultural_positioning": "description",
  "trend_alignment": ["trend1"],
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
  "brands_recommended_instead": ["b1", "b2"],
  "why_recommended_or_not": "explanation",
  "identity_accuracy": "description"
}`
  );
}

function calculateCompleteness(profile: Record<string, unknown>): number {
  const fields = [
    "brand_name", "category", "price_tier",
    "archetypes", "values", "anti_values", "style_tags",
    "voice_tone", "status_signal_type", "communities",
    "emotional_resonance", "sustainability_level",
    "origin_story", "differentiation_claim",
  ];
  const filled = fields.filter((f) => {
    const v = profile[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== "";
  });
  return Math.round((filled.length / fields.length) * 100) / 100;
}

// ── Route ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, contact_email }: { messages: ChatMessage[]; contact_email?: string } =
      await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // ── Step 1: Format transcript for GPT ─────────────────────────────
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Founder" : "Esina"}: ${m.content}`)
      .join("\n\n");

    // ── Step 2: Extract structured profile from transcript ────────────
    const extractionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 2000,
      messages: [
        { role: "system", content: EXTRACT_SYSTEM_PROMPT },
        { role: "user", content: `Here is the conversation transcript:\n\n${transcript}` },
      ],
    });

    const raw = extractionRes.choices[0]?.message?.content?.trim() || "{}";
    let extracted: Record<string, unknown>;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
      extracted = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse brand profile from conversation. Please try again." },
        { status: 500 }
      );
    }

    // ── Step 3: Generate identity text ────────────────────────────────
    // Use the extracted identity_text if rich, otherwise fall back to generateIdentityText
    const generatedText = generateIdentityText(extracted as unknown as Parameters<typeof generateIdentityText>[0]);
    const identityText = (extracted.identity_text as string)?.length > generatedText.length
      ? extracted.identity_text as string
      : generatedText;

    // ── Step 4: Generate embedding ────────────────────────────────────
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: identityText,
    });
    const embedding = embeddingRes.data[0].embedding;

    // ── Step 5: Calculate completeness ────────────────────────────────
    const completeness = calculateCompleteness(extracted);

    // ── Step 5b: Sanitize all controlled-vocab fields ─────────────────
    // GPT may generate values outside the Supabase CHECK constraint lists.
    // Filter each array/enum field to only include allowed values.
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
    // Sanitize archetypes — keep valid archetype strings, drop unknown ones
    const rawArchetypes = Array.isArray(extracted.archetypes) ? extracted.archetypes as Array<{archetype?: string; weight?: number; primary?: boolean}> : [];
    const sanitizedArchetypes = rawArchetypes.filter(a => a.archetype && VALID_ARCHETYPES.has(a.archetype));

    // ── Step 6: Insert brand profile ──────────────────────────────────
    const { data: brand, error: insertErr } = await supabase
      .from("brand_profiles")
      .insert({
        brand_name: extracted.brand_name || "Unknown Brand",
        website_url: null,
        contact_email: contact_email || null,
        contact_name: null,
        category: extracted.category || "Other",
        subcategories: [],
        platforms: [],
        price_tier: sanitizeEnum(extracted.price_tier, VALID_PRICE_TIERS),
        founded_year: null,
        origin_location: null,
        identity_statements: (extracted.identity_statements as string[]) || [],
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
        logo_visibility: null,
        exclusivity_level: null,
        communities: ((extracted.communities as string[]) || []).slice(0, 5),
        brand_adjacencies: (extracted.brand_adjacencies as string[]) || [],
        trend_alignment: [],
        origin_story: (extracted.origin_story as string) || null,
        founder_philosophy: (extracted.founder_philosophy as string) || null,
        mission_statement: null,
        differentiation_claim: (extracted.differentiation_claim as string) || null,
        profile_completeness: completeness,
        profile_status: "complete",
        identity_text: identityText,
        identity_embedding: embedding,
        // Tag as conversation-sourced
        onboard_source: "conversational",
      })
      .select("id, brand_name, category")
      .single();

    if (insertErr || !brand) {
      // onboard_source column may not exist yet — retry without it
      const { data: brand2, error: insertErr2 } = await supabase
        .from("brand_profiles")
        .insert({
          brand_name: extracted.brand_name || "Unknown Brand",
          contact_email: contact_email || null,
          category: extracted.category || "Other",
          price_tier: sanitizeEnum(extracted.price_tier, VALID_PRICE_TIERS),
          identity_statements: (extracted.identity_statements as string[]) || [],
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
          trend_alignment: [],
          origin_story: (extracted.origin_story as string) || null,
          founder_philosophy: (extracted.founder_philosophy as string) || null,
          differentiation_claim: (extracted.differentiation_claim as string) || null,
          profile_completeness: completeness,
          profile_status: "complete",
          identity_text: identityText,
          identity_embedding: embedding,
        })
        .select("id, brand_name, category")
        .single();

      if (insertErr2 || !brand2) {
        return NextResponse.json(
          { error: `Failed to save profile: ${insertErr2?.message || insertErr?.message}` },
          { status: 500 }
        );
      }

      // Continue with brand2
      return await runAuditAndReturn(brand2, extracted, identityText);
    }

    return await runAuditAndReturn(brand, extracted, identityText);
  } catch (err: unknown) {
    console.error("[onboard/extract]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function runAuditAndReturn(
  brand: { id: string; brand_name: string; category: string },
  extracted: Record<string, unknown>,
  identityText: string
): Promise<NextResponse> {
  // ── Run AI Perception Audit ────────────────────────────────────────
  const identitySnippet = [
    (extracted.values as string[])?.length
      ? `values ${(extracted.values as string[]).join(", ")}`
      : "",
    (extracted.style_tags as string[])?.length
      ? `style is ${(extracted.style_tags as string[]).join(", ")}`
      : "",
    extracted.voice_tone ? `voice is ${extracted.voice_tone}` : "",
    extracted.status_signal_type ? `${extracted.status_signal_type} positioning` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const identityDesc = identitySnippet || identityText.split(".").slice(0, 2).join(".").trim();

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
    archetypes: (extracted.archetypes as BrandSelfReport["archetypes"]) || [],
    values: (extracted.values as string[]) || [],
    style_tags: (extracted.style_tags as string[]) || [],
    price_tier: (extracted.price_tier as string) || null,
    voice_tone: (extracted.voice_tone as string) || null,
    status_signal_type: (extracted.status_signal_type as string) || null,
    communities: (extracted.communities as string[]) || [],
    identity_text: identityText,
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
    gap_details: {
      dimensions: gap.dimensions,
      missingDimensions: gap.missingDimensions,
      oneSentenceDescription: gap.oneSentenceDescription,
      competitiveData: q2,
      consumerSimData: q3,
    },
    recommendations: gap.recommendations,
  });

  await supabase
    .from("brand_profiles")
    .update({ profile_status: "audited" })
    .eq("id", brand.id);

  return NextResponse.json({ brandId: brand.id, brandName: brand.brand_name });
}

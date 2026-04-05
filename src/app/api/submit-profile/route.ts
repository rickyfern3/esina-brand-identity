import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
import { generateIdentityText } from "@/lib/identity-text";
import {
  calculateGapAnalysis,
  type BrandSelfReport,
  type AIPerception,
} from "@/lib/gap-analysis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── AI Query Helpers ─────────────────────────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function queryAI(system: string, user: string): Promise<Record<string, unknown>> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 1500,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
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

// ── Profile completeness calculator ─────────────────────────────────

function calculateCompleteness(profile: Record<string, unknown>): number {
  const fields = [
    "brand_name", "category", "contact_email", "price_tier",
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

// ── Main Route ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Generate identity text
    const identityText = generateIdentityText(body);

    // 2. Generate embedding
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: identityText,
    });
    const embedding = embeddingRes.data[0].embedding;

    // 3. Calculate completeness
    const completeness = calculateCompleteness(body);

    // 4. Save brand profile to Supabase
    const { data: brand, error: insertErr } = await supabase
      .from("brand_profiles")
      .insert({
        brand_name: body.brand_name,
        website_url: body.website_url || null,
        contact_email: body.contact_email,
        contact_name: body.contact_name || null,
        category: body.category,
        subcategories: body.subcategories || [],
        platforms: body.platforms || [],
        price_tier: body.price_tier || null,
        founded_year: body.founded_year || null,
        origin_location: body.origin_location || null,
        identity_statements: body.identity_statements || [],
        archetypes: body.archetypes || [],
        target_age_min: body.target_age_min || null,
        target_age_max: body.target_age_max || null,
        target_gender_affinity: body.target_gender_affinity || null,
        values: body.values || [],
        anti_values: body.anti_values || [],
        style_tags: body.style_tags || [],
        design_language: body.design_language || null,
        visual_tone: body.visual_tone || null,
        voice_tone: body.voice_tone || null,
        humor_level: body.humor_level || null,
        emotional_resonance: body.emotional_resonance || null,
        sustainability_level: body.sustainability_level || null,
        status_signal_type: body.status_signal_type || null,
        logo_visibility: body.logo_visibility || null,
        exclusivity_level: body.exclusivity_level || null,
        communities: body.communities || [],
        brand_adjacencies: body.brand_adjacencies || [],
        trend_alignment: body.trend_alignment || [],
        origin_story: body.origin_story || null,
        founder_philosophy: body.founder_philosophy || null,
        mission_statement: body.mission_statement || null,
        differentiation_claim: body.differentiation_claim || null,
        profile_completeness: completeness,
        profile_status: "complete",
        identity_text: identityText,
        identity_embedding: embedding,
      })
      .select("id, brand_name, category")
      .single();

    if (insertErr || !brand) {
      return NextResponse.json(
        { error: `Failed to save profile: ${insertErr?.message}` },
        { status: 500 }
      );
    }

    // 5. Run AI Perception Audit
    const identitySnippet = [
      body.values?.length ? `values ${(body.values as string[]).join(", ")}` : "",
      body.style_tags?.length ? `style is ${(body.style_tags as string[]).join(", ")}` : "",
      body.voice_tone ? `voice is ${body.voice_tone}` : "",
      body.status_signal_type ? `${body.status_signal_type} positioning` : "",
    ].filter(Boolean).join(", ");
    const identityDesc = identitySnippet || identityText.split(".").slice(0, 2).join(".").trim();

    const [q1, q2, q3] = await Promise.all([
      queryGeneralPerception(brand.brand_name, brand.category),
      queryCompetitivePositioning(brand.brand_name, brand.category),
      queryConsumerSimulation(brand.brand_name, brand.category, identityDesc),
    ]);

    // 6. Assemble perception
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

    // 7. Gap analysis
    const selfReport: BrandSelfReport = {
      brand_name: brand.brand_name,
      category: brand.category,
      archetypes: body.archetypes || [],
      values: body.values || [],
      style_tags: body.style_tags || [],
      price_tier: body.price_tier || null,
      voice_tone: body.voice_tone || null,
      status_signal_type: body.status_signal_type || null,
      communities: body.communities || [],
      identity_text: identityText,
      differentiation_claim: body.differentiation_claim || null,
    };

    const gap = calculateGapAnalysis(selfReport, perception);

    // 8. Store audit
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

    // 9. Update profile status to audited
    await supabase
      .from("brand_profiles")
      .update({ profile_status: "audited" })
      .eq("id", brand.id);

    return NextResponse.json({ brandId: brand.id });
  } catch (err: unknown) {
    console.error("submit-profile error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

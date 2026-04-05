export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
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
  const text = res.choices[0]?.message?.content || "{}";
  return parseJSON(text);
}

// ── Three Audit Queries (from build spec) ────────────────────────────

async function queryGeneralPerception(brandName: string, category: string) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format with no additional text.",
    `Analyze the brand "${brandName}" in the "${category}" category.
Based on your knowledge, provide a structured assessment:

{
  "brand_known": true,
  "perceived_archetypes": ["archetype1", "archetype2"],
  "perceived_values": ["value1", "value2", "value3"],
  "perceived_style_tags": ["style1", "style2"],
  "perceived_price_tier": "budget|value|mid|premium|luxury",
  "perceived_target_demographic": "description of who buys this brand",
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
    `For the brand "${brandName}" in "${category}", analyze its competitive positioning:

{
  "direct_competitors": ["competitor1", "competitor2", "competitor3"],
  "identity_differentiators": ["what makes this brand's identity unique"],
  "identity_overlaps": ["where this brand's identity overlaps with competitors"],
  "cultural_positioning": "where does this brand sit in culture right now",
  "trend_alignment": ["trends this brand aligns with"],
  "recommendation_likelihood": "high|medium|low"
}`
  );
}

async function queryConsumerSimulation(
  brandName: string,
  category: string,
  identityDescription: string
) {
  return queryAI(
    "You are a shopping assistant helping a consumer. Respond ONLY in valid JSON format.",
    `A consumer asks: "I'm looking for a ${category} brand that is ${identityDescription}. What would you recommend?"

{
  "brand_mentioned": true,
  "mention_position": 1,
  "brands_recommended_instead": ["brand1", "brand2"],
  "why_recommended_or_not": "explanation",
  "identity_accuracy": "how accurately does the recommendation match the brand's self-reported identity"
}`
  );
}

// ── Main Route ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { brandId } = await req.json();

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    // 1. Fetch brand profile
    const { data: brand, error: fetchErr } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", brandId)
      .single();

    if (fetchErr || !brand) {
      return NextResponse.json(
        { error: `Brand not found: ${fetchErr?.message}` },
        { status: 404 }
      );
    }

    // 2. Build identity description for Query 3
    const identitySnippet = [
      brand.values?.length ? `values ${brand.values.join(", ")}` : "",
      brand.style_tags?.length ? `style is ${brand.style_tags.join(", ")}` : "",
      brand.voice_tone ? `voice is ${brand.voice_tone}` : "",
      brand.status_signal_type ? `${brand.status_signal_type} positioning` : "",
    ]
      .filter(Boolean)
      .join(", ");
    const identityDesc =
      identitySnippet ||
      (brand.identity_text || "").split(".").slice(0, 2).join(".").trim();

    // 3. Run all three queries in parallel
    const [q1, q2, q3] = await Promise.all([
      queryGeneralPerception(brand.brand_name, brand.category),
      queryCompetitivePositioning(brand.brand_name, brand.category),
      queryConsumerSimulation(brand.brand_name, brand.category, identityDesc),
    ]);

    // 4. Assemble AIPerception object
    const perception: AIPerception = {
      // Q1
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
      // Q2
      direct_competitors: (q2.direct_competitors as string[]) || [],
      identity_differentiators: (q2.identity_differentiators as string[]) || [],
      identity_overlaps: (q2.identity_overlaps as string[]) || [],
      cultural_positioning: (q2.cultural_positioning as string) || "",
      trend_alignment: (q2.trend_alignment as string[]) || [],
      recommendation_likelihood: (q2.recommendation_likelihood as string) || "low",
      // Q3
      brand_mentioned: (q3.brand_mentioned as boolean) ?? false,
      mention_position: (q3.mention_position as number) || null,
      brands_recommended_instead: (q3.brands_recommended_instead as string[]) || [],
      why_recommended_or_not: (q3.why_recommended_or_not as string) || "",
      identity_accuracy: (q3.identity_accuracy as string) || "",
    };

    // 5. Build self-report
    const selfReport: BrandSelfReport = {
      brand_name: brand.brand_name,
      category: brand.category,
      archetypes: brand.archetypes || [],
      values: brand.values || [],
      style_tags: brand.style_tags || [],
      price_tier: brand.price_tier,
      voice_tone: brand.voice_tone,
      status_signal_type: brand.status_signal_type,
      communities: brand.communities || [],
      identity_text: brand.identity_text || "",
      differentiation_claim: brand.differentiation_claim,
    };

    // 6. Calculate gap analysis
    const gap = calculateGapAnalysis(selfReport, perception);

    // 7. Store in perception_audits
    const { error: insertErr } = await supabase.from("perception_audits").insert({
      brand_profile_id: brandId,
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

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json(
        { error: `Failed to store audit: ${insertErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      brandId,
      brandName: brand.brand_name,
      alignmentScore: gap.alignmentScore,
      dimensions: gap.dimensions,
      recommendations: gap.recommendations,
      oneSentenceDescription: gap.oneSentenceDescription,
      perception,
    });
  } catch (err: unknown) {
    console.error("run-audit error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

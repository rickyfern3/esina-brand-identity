export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";
import { generateIdentityText } from "@/lib/identity-text";
import {
  calculateGapAnalysis,
  type BrandSelfReport,
  type AIPerception,
} from "@/lib/gap-analysis";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Helpers ──────────────────────────────────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function queryAI(
  system: string,
  user: string,
  maxTokens = 2000
): Promise<Record<string, unknown>> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return parseJSON(res.choices[0]?.message?.content || "{}");
}

// ── GPT: Generate brand profile from Depop seller data ───────────────

const PROFILE_SYSTEM_PROMPT = `You are a brand identity analyst specializing in independent and Depop sellers.
Based on a Depop seller's shop data — their bio, listing titles, and descriptions — generate a structured brand identity profile.

Use ONLY the controlled vocabulary below. Return valid JSON only, no markdown.

CONTROLLED VOCABULARY:

category (pick ONE): fashion, jewelry, accessories, beauty, homeware, lifestyle, streetwear, vintage, art

subcategories (array, pick relevant): womenswear, menswear, unisex, jewellery, bags, shoes, outerwear, knitwear, denim,
  ceramics, prints, candles, skincare, fragrance, vintage-90s, vintage-y2k, vintage-70s, deadstock, upcycled, handmade

archetypes (array of objects with archetype, weight 0-1, primary bool — max 3):
  Creator, Caregiver, Ruler, Jester, Everyman, Lover, Hero, Outlaw, Magician, Sage, Explorer, Innocent

values (max 5, priority order): craftsmanship, sustainability, individuality, authenticity, community, nostalgia,
  self-expression, quality, accessibility, creativity, intentionality, storytelling, heritage, inclusivity,
  minimalism, maximalism, slow-fashion, circularity, femininity, empowerment

anti_values (max 3): fast-fashion, mass-production, conformity, logos, wastefulness, status-signaling, inauthenticity

style_tags (max 5): minimalist, maximalist, vintage, contemporary, artisanal, streetwear, preppy, bohemian,
  romantic, utilitarian, androgynous, feminine, sculptural, organic, graphic, monochrome, earthy, playful

design_language (pick ONE): clean, ornate, handcrafted, architectural, raw, refined, playful, geometric, fluid, eclectic

visual_tone (pick ONE): muted, bold, earthy, monochrome, vibrant, pastel, dark, washed, saturated

voice_tone (pick ONE): formal, casual, irreverent, authoritative, warm, edgy

humor_level (pick ONE): none, subtle, moderate, heavy

emotional_resonance (pick ONE): joy, nostalgia, confidence, calm, rebellion, belonging, aspiration, intimacy,
  wonder, pride, discovery

sustainability_level (pick ONE): none, partial, committed, core

status_signal_type (pick ONE): conspicuous, quiet_luxury, counterculture, accessible_premium, anti_status

logo_visibility (pick ONE): hidden, subtle, visible, prominent

exclusivity_level (pick ONE): mass, accessible, selective, exclusive

communities (max 5): vintage-lovers, thrifters, sustainability-advocates, fashion-students, artists, creatives,
  slow-fashion-community, upcyclers, streetwear-heads, independent-fashion, craft-enthusiasts, jewellery-lovers,
  Depop-community, London-fashion-scene, NYC-fashion-scene, the-sartorialist, archival-fashion

price_tier (pick ONE): budget, value, mid, premium

Return a JSON object with ALL of these fields:
{
  "brand_name": "seller shop name",
  "category": "...",
  "subcategories": [],
  "price_tier": "...",
  "archetypes": [{"archetype": "...", "weight": 0.8, "primary": true}],
  "values": [],
  "anti_values": [],
  "style_tags": [],
  "design_language": "...",
  "visual_tone": "...",
  "voice_tone": "...",
  "humor_level": "...",
  "emotional_resonance": "...",
  "sustainability_level": "...",
  "status_signal_type": "...",
  "logo_visibility": "...",
  "exclusivity_level": "...",
  "communities": [],
  "identity_statements": ["statement 1", "statement 2", "statement 3"],
  "origin_story": "...",
  "differentiation_claim": "...",
  "identity_text": "A rich 3-5 sentence natural language blob describing the brand's full identity, values, aesthetic, community, and positioning — written for embedding/retrieval."
}`;

async function generateDepopProfile(
  shopName: string,
  bio: string,
  listings: string
): Promise<Record<string, unknown>> {
  return queryAI(
    PROFILE_SYSTEM_PROMPT,
    `SELLER SHOP NAME: ${shopName}

SHOP BIO:
${bio}

LISTING TITLES & DESCRIPTIONS:
${listings}`,
    2500
  );
}

// ── Audit helpers (same as run-audit) ────────────────────────────────

async function queryGeneralPerception(brandName: string, category: string) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format with no additional text.",
    `Analyze the Depop seller/brand "${brandName}" in the "${category}" category.
Based on their identity profile, provide:
{
  "brand_known": false,
  "perceived_archetypes": [],
  "perceived_values": [],
  "perceived_style_tags": [],
  "perceived_price_tier": "budget|value|mid|premium|luxury",
  "perceived_target_demographic": "",
  "perceived_communities": [],
  "perceived_status_signal": "conspicuous|quiet_luxury|counterculture|accessible_premium|anti_status",
  "perceived_voice_tone": "formal|casual|irreverent|authoritative|warm|edgy",
  "perceived_strengths": [],
  "perceived_weaknesses": [],
  "one_sentence_description": ""
}`
  );
}

async function queryCompetitivePositioning(brandName: string, category: string) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format.",
    `For the Depop seller "${brandName}" in "${category}", analyze competitive positioning among independent/resale sellers:
{
  "direct_competitors": [],
  "identity_differentiators": [],
  "identity_overlaps": [],
  "cultural_positioning": "",
  "trend_alignment": [],
  "recommendation_likelihood": "high|medium|low"
}`
  );
}

async function queryConsumerSimulation(
  brandName: string,
  category: string,
  identityDesc: string
) {
  return queryAI(
    "You are a Depop shopping assistant. Respond ONLY in valid JSON format.",
    `A shopper asks: "I'm looking for an independent ${category} seller that ${identityDesc}. Any recs?"
{
  "brand_mentioned": false,
  "mention_position": null,
  "brands_recommended_instead": [],
  "why_recommended_or_not": "",
  "identity_accuracy": ""
}`
  );
}

// ── Main Route ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  try {
    const body = await req.json();
    const { sellerUsername, shopName, bio, listings } = body as {
      sellerUsername?: string;
      shopName: string;
      bio: string;
      listings: string;
    };

    if (!shopName?.trim()) {
      return NextResponse.json({ error: "shopName is required" }, { status: 400 });
    }
    if (!listings?.trim()) {
      return NextResponse.json({ error: "listings is required" }, { status: 400 });
    }

    // ── Step 1: Generate brand profile via GPT ────────────────────────
    const profile = await generateDepopProfile(shopName.trim(), bio?.trim() ?? "", listings.trim());

    // Override brand_name with the exact shopName provided
    profile.brand_name = shopName.trim();

    // ── Step 1b: Sanitize controlled vocabulary fields ───────────────
    const VALID = {
      category: ['fashion','jewelry','accessories','beauty','homeware','lifestyle','streetwear','vintage','art'],
      price_tier: ['budget','value','mid','premium','luxury'],
      status_signal_type: ['conspicuous','quiet_luxury','counterculture','accessible_premium','anti_status'],
      voice_tone: ['formal','casual','irreverent','authoritative','warm','edgy'],
      humor_level: ['none','subtle','moderate','heavy'],
      sustainability_level: ['none','partial','committed','core'],
      logo_visibility: ['hidden','subtle','visible','prominent'],
      exclusivity_level: ['mass','accessible','selective','exclusive'],
      design_language: ['clean','ornate','handcrafted','architectural','raw','refined','playful','geometric','fluid','eclectic'],
      visual_tone: ['muted','bold','earthy','monochrome','vibrant','pastel','dark','washed','saturated'],
    };
    function sanitize(val: unknown, allowed: string[]): string | null {
      if (!val || typeof val !== 'string') return null;
      const v = val.toLowerCase().replace(/[_\s-]+/g, '_');
      return allowed.includes(val as string) ? (val as string) :
             allowed.find(a => a === v || v.includes(a) || a.includes(val.toString().toLowerCase())) || null;
    }
    profile.category = sanitize(profile.category, VALID.category) || 'fashion';
    profile.price_tier = sanitize(profile.price_tier, VALID.price_tier);
    profile.status_signal_type = sanitize(profile.status_signal_type, VALID.status_signal_type);
    profile.voice_tone = sanitize(profile.voice_tone, VALID.voice_tone);
    profile.humor_level = sanitize(profile.humor_level, VALID.humor_level);
    profile.sustainability_level = sanitize(profile.sustainability_level, VALID.sustainability_level);
    profile.logo_visibility = sanitize(profile.logo_visibility, VALID.logo_visibility);
    profile.exclusivity_level = sanitize(profile.exclusivity_level, VALID.exclusivity_level);
    profile.design_language = sanitize(profile.design_language, VALID.design_language);
    profile.visual_tone = sanitize(profile.visual_tone, VALID.visual_tone);

    // ── Step 2: Build identity text ───────────────────────────────────
    // Use GPT's identity_text blob if provided and substantial; otherwise generate from fields
    const gptIdentityText = typeof profile.identity_text === "string" && profile.identity_text.length > 50
      ? profile.identity_text
      : null;

    const structuredIdentityText = generateIdentityText({
      brand_name: String(profile.brand_name),
      category: String(profile.category || "fashion"),
      price_tier: profile.price_tier as string | null,
      archetypes: (profile.archetypes as { archetype: string; weight: number; primary: boolean }[]) || [],
      values: (profile.values as string[]) || [],
      anti_values: (profile.anti_values as string[]) || [],
      style_tags: (profile.style_tags as string[]) || [],
      design_language: profile.design_language as string | null,
      visual_tone: profile.visual_tone as string | null,
      voice_tone: profile.voice_tone as string | null,
      humor_level: profile.humor_level as string | null,
      emotional_resonance: profile.emotional_resonance as string | null,
      sustainability_level: profile.sustainability_level as string | null,
      status_signal_type: profile.status_signal_type as string | null,
      logo_visibility: profile.logo_visibility as string | null,
      exclusivity_level: profile.exclusivity_level as string | null,
      communities: (profile.communities as string[]) || [],
      identity_statements: (profile.identity_statements as string[]) || [],
      origin_story: profile.origin_story as string | null,
      differentiation_claim: profile.differentiation_claim as string | null,
    });

    // Combine both: structured text + GPT blob for richer embedding
    const identityText = gptIdentityText
      ? `${structuredIdentityText} ${gptIdentityText}`
      : structuredIdentityText;

    // ── Step 3: Generate embedding ────────────────────────────────────
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: identityText,
    });
    const embedding = embeddingRes.data[0].embedding;

    // ── Step 4: Insert into brand_profiles ───────────────────────────
    const { data: brand, error: insertErr } = await supabase
      .from("brand_profiles")
      .insert({
        brand_name: String(profile.brand_name),
        category: String(profile.category || "fashion"),
        subcategories: (profile.subcategories as string[]) || [],
        price_tier: profile.price_tier || null,
        archetypes: (profile.archetypes as object[]) || [],
        values: (profile.values as string[]) || [],
        anti_values: (profile.anti_values as string[]) || [],
        style_tags: (profile.style_tags as string[]) || [],
        design_language: profile.design_language || null,
        visual_tone: profile.visual_tone || null,
        voice_tone: profile.voice_tone || null,
        humor_level: profile.humor_level || null,
        emotional_resonance: profile.emotional_resonance || null,
        sustainability_level: profile.sustainability_level || null,
        status_signal_type: profile.status_signal_type || null,
        logo_visibility: profile.logo_visibility || null,
        exclusivity_level: profile.exclusivity_level || null,
        communities: (profile.communities as string[]) || [],
        identity_statements: (profile.identity_statements as string[]) || [],
        origin_story: profile.origin_story || null,
        differentiation_claim: profile.differentiation_claim || null,
        // Depop seller-specific metadata stored in origin_location
        contact_email: `${(sellerUsername || String(profile.brand_name)).toLowerCase().replace(/[^a-z0-9]/g, '')}@depop.seller`,
        origin_location: sellerUsername ? `depop:${sellerUsername}` : null,
        profile_status: "complete",
        profile_completeness: 0.85,
        identity_text: identityText,
        identity_embedding: embedding,
      })
      .select("id, brand_name, category")
      .single();

    if (insertErr || !brand) {
      return NextResponse.json(
        { error: `Failed to insert brand profile: ${insertErr?.message}` },
        { status: 500 }
      );
    }

    // ── Step 5: Run perception audit ──────────────────────────────────
    const identitySnippet = [
      (profile.values as string[])?.length
        ? `values ${(profile.values as string[]).join(", ")}`
        : "",
      (profile.style_tags as string[])?.length
        ? `style is ${(profile.style_tags as string[]).join(", ")}`
        : "",
      profile.voice_tone ? `voice is ${profile.voice_tone}` : "",
      profile.status_signal_type ? `${profile.status_signal_type} positioning` : "",
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
      brand_known: (q1.brand_known as boolean) ?? false,
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
      archetypes: (profile.archetypes as { archetype: string; weight: number; primary: boolean }[]) || [],
      values: (profile.values as string[]) || [],
      style_tags: (profile.style_tags as string[]) || [],
      price_tier: (profile.price_tier as string) || null,
      voice_tone: (profile.voice_tone as string) || null,
      status_signal_type: (profile.status_signal_type as string) || null,
      communities: (profile.communities as string[]) || [],
      identity_text: identityText,
      differentiation_claim: (profile.differentiation_claim as string) || null,
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

    return NextResponse.json({
      brandId: brand.id,
      brandName: brand.brand_name,
      category: brand.category,
      alignmentScore: gap.alignmentScore,
      recommendations: gap.recommendations,
      generatedProfile: {
        archetypes: profile.archetypes,
        values: profile.values,
        style_tags: profile.style_tags,
        communities: profile.communities,
        status_signal_type: profile.status_signal_type,
        sustainability_level: profile.sustainability_level,
        identity_statements: profile.identity_statements,
        differentiation_claim: profile.differentiation_claim,
      },
    });
  } catch (err: unknown) {
    console.error("seed-brand error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

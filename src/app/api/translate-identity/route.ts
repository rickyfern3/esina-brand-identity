export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────

export interface ConsumerSignals {
  purchase_history?: string[];   // brand names or product descriptions
  search_queries?: string[];     // recent searches
  interests?: string[];          // topics, accounts, communities they follow
  free_text?: string;            // natural language description
}

export interface TranslatedConsumerProfile {
  archetypes: { archetype: string; weight: number; primary: boolean }[];
  values: string[];              // in priority order
  anti_preferences: string[];   // what they actively avoid
  style_tags: string[];
  communities: string[];
  status_signal: string;
  emotional_resonance: string;
  price_sensitivity: string;     // budget | value | mid | premium | luxury
  sustainability_orientation: string; // none | basic | committed | leader
  identity_summary: string;      // 2-3 sentence prose summary
}

export interface BrandMatch {
  brandId: string;
  brandName: string;
  category: string;
  score: number;
  rawSimilarity: number;
  snippet: string;
  matchToken: string;
}

// ── System prompt ──────────────────────────────────────────────────────

const TRANSLATION_SYSTEM_PROMPT = `You are a consumer identity analyst. Your job is to analyze raw behavioral signals and translate them into a structured identity profile that captures who this consumer *is* — not just what they bought.

You will receive behavioral signals and must return a JSON object matching this exact schema:

{
  "archetypes": [
    { "archetype": string, "weight": number (0-1, sum to 1.0), "primary": boolean }
  ],
  "values": [string],           // 4-6 core values, priority order, lowercase_underscore
  "anti_preferences": [string], // 3-5 things they actively avoid, lowercase_underscore
  "style_tags": [string],       // 4-6 aesthetic descriptors, lowercase_underscore
  "communities": [string],      // 3-5 communities/tribes they belong to, lowercase
  "status_signal": string,      // one of: conspicuous | quiet_luxury | counterculture | accessible_premium | anti_status
  "emotional_resonance": string, // one of: confidence | joy | serenity | excitement | nostalgia | belonging | security
  "price_sensitivity": string,  // one of: budget | value | mid | premium | luxury
  "sustainability_orientation": string, // one of: none | basic | committed | leader
  "identity_summary": string    // 2-3 sentence prose summary of who this consumer is
}

Valid archetype values: creator, sage, explorer, rebel, lover, caregiver, jester, everyperson, hero, ruler, magician, innocent

Rules:
- Infer identity from behavioral patterns, not surface-level demographics
- Purchase history reveals values more than preferences — what brands someone buys signals who they want to be
- Weight archetypes honestly — most people have 2-3 dominant ones
- Anti-preferences should reflect genuine avoidance patterns visible in the signals
- style_tags should match the aesthetic vocabulary used in brand profiles (e.g. minimalist, maximalist, artisanal, avant_garde, classic, bohemian, heritage, organic, elevated_basics, streetwear, techwear, preppy)
- Use ONLY the exact controlled vocabulary from the brand schema. Do not invent new terms.
- Return ONLY valid JSON, no markdown, no explanation`;

// ── Route ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth + rate limit ──────────────────────────────────────────────
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  try {
    const body: ConsumerSignals = await req.json();

    const { purchase_history, search_queries, interests, free_text } = body;

    // Require at least one signal
    if (
      (!purchase_history || purchase_history.length === 0) &&
      (!search_queries || search_queries.length === 0) &&
      (!interests || interests.length === 0) &&
      !free_text
    ) {
      return NextResponse.json(
        { error: "At least one signal field is required (purchase_history, search_queries, interests, or free_text)" },
        { status: 400 }
      );
    }

    // ── Step 1: Build signal text for GPT ─────────────────────────────
    const signalParts: string[] = [];

    if (purchase_history && purchase_history.length > 0) {
      signalParts.push(`Purchase history / brands they buy:\n${purchase_history.map((s) => `- ${s}`).join("\n")}`);
    }
    if (search_queries && search_queries.length > 0) {
      signalParts.push(`Recent searches:\n${search_queries.map((s) => `- ${s}`).join("\n")}`);
    }
    if (interests && interests.length > 0) {
      signalParts.push(`Interests / accounts they follow / communities:\n${interests.map((s) => `- ${s}`).join("\n")}`);
    }
    if (free_text) {
      signalParts.push(`Additional context:\n${free_text}`);
    }

    const userMessage = `Analyze these behavioral signals and translate them into a structured consumer identity profile:\n\n${signalParts.join("\n\n")}`;

    // ── Step 2: GPT-4o-mini identity translation ───────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 1200,
      messages: [
        { role: "system", content: TRANSLATION_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";

    let profile: TranslatedConsumerProfile;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
      profile = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse identity translation from AI", raw },
        { status: 500 }
      );
    }

    // ── Step 3: Build embedding text from translated profile ───────────
    const embeddingText = [
      profile.identity_summary,
      `Archetypes: ${profile.archetypes.map((a) => `${a.archetype} (${a.weight})`).join(", ")}.`,
      `Values: ${profile.values.join(", ")}.`,
      `Style: ${profile.style_tags.join(", ")}.`,
      `Communities: ${profile.communities.join(", ")}.`,
      `Status signal: ${profile.status_signal}.`,
      `Emotional resonance: ${profile.emotional_resonance}.`,
      `Price sensitivity: ${profile.price_sensitivity}.`,
      `Sustainability: ${profile.sustainability_orientation}.`,
      `Avoids: ${profile.anti_preferences.join(", ")}.`,
    ]
      .filter(Boolean)
      .join(" ");

    // ── Step 4: Generate embedding ─────────────────────────────────────
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embeddingText,
    });
    const queryEmbedding = embeddingRes.data[0].embedding;

    // ── Step 5: Match against brand database ───────────────────────────
    const { data: matches, error: rpcError } = await supabase.rpc(
      "match_brands_by_embedding",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.2,
        match_count: 10,
      }
    );

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return NextResponse.json(
        { error: `Supabase RPC error: ${rpcError.message}` },
        { status: 500 }
      );
    }

    // ── Step 6: Format matches, generate tokens, insert match_events ───
    const brandMatches: BrandMatch[] = await Promise.all(
      (matches || []).map(
        async (m: {
          brand_id: string;
          brand_name: string;
          category: string;
          similarity: number;
          identity_text: string;
        }) => {
          const sentences = (m.identity_text || "").match(/[^.!?]+[.!?]+/g) || [];
          const snippet = sentences.slice(0, 2).join("").trim();

          // Generate a unique token for this match event
          const matchToken = crypto.randomUUID();

          // Insert match event with full consumer context (non-fatal)
          const { error: insertError } = await supabase
            .from("match_events")
            .insert({
              id: matchToken,
              brand_profile_id: m.brand_id,
              brand_name: m.brand_name,
              similarity_score: m.similarity,
              preference_text: embeddingText,       // the embedding text used for matching
              consumer_signals: body,               // raw input signals as jsonb
              translated_profile: profile,          // GPT-translated identity profile as jsonb
            });

          if (insertError) {
            console.error("match_events insert failed:", insertError.message);
          }

          return {
            brandId: m.brand_id,
            brandName: m.brand_name,
            category: m.category,
            score: Math.round(m.similarity * 100),
            rawSimilarity: m.similarity,
            snippet,
            matchToken,
          };
        }
      )
    );

    // ── Step 7: Return full result ─────────────────────────────────────
    return NextResponse.json({
      translatedProfile: profile,
      embeddingText,
      brandMatches,
    });
  } catch (err: unknown) {
    console.error("translate-identity error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

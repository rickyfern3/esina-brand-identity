export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";
import { getVocabularyPromptExtension } from "@/lib/approved-vocabulary";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────

export interface ConsumerSignals {
  // Core signals (original)
  purchase_history?: string[];   // brand names or product descriptions
  search_queries?: string[];     // recent searches
  interests?: string[];          // topics, accounts, communities they follow
  free_text?: string;            // natural language description
  // Multimodal signals (new)
  music?: string[];              // artists, genres, playlists they listen to
  films_tv?: string[];           // movies, shows, directors they watch
  art_design?: string[];         // artists, movements, aesthetics they engage with
  social_follows?: string[];     // accounts or creators they follow
  saved_content?: string[];      // descriptions of saved/bookmarked content
}

export interface IdentityBlend {
  blend_name: string;            // 2-3 word descriptive label
  blend_dimensions: string[];    // which dimensions combine to create this blend
  blend_description: string;    // one sentence explaining what this combination reveals
  blend_strength: number;        // 0.0-1.0 confidence score
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
  blends?: IdentityBlend[];      // cross-dimensional identity blend signatures
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
  "identity_summary": string,   // 2-3 sentence prose summary of who this consumer is
  "blends": [
    {
      "blend_name": string,         // 2-3 word descriptive label for this cross-dimensional pattern
      "blend_dimensions": [string], // which dimensions (archetype + value + style_tag etc.) combine here
      "blend_description": string,  // one sentence: what does this specific combination reveal that individual dimensions miss
      "blend_strength": number      // 0.0-1.0 confidence this is a real signal, not noise
    }
  ]
}

Valid archetype values: creator, sage, explorer, rebel, lover, caregiver, jester, everyperson, hero, ruler, magician, innocent

Rules:
- Infer identity from behavioral patterns, not surface-level demographics
- Purchase history reveals values more than preferences — what brands someone buys signals who they want to be
- Weight archetypes honestly — most people have 2-3 dominant ones
- Anti-preferences should reflect genuine avoidance patterns visible in the signals
- style_tags should match the aesthetic vocabulary used in brand profiles (e.g. minimalist, maximalist, artisanal, avant_garde, classic, bohemian, heritage, organic, elevated_basics, streetwear, techwear, preppy)
- Use ONLY the exact controlled vocabulary from the brand schema for standard dimensions. For blend signatures, you may create new descriptive labels as these represent emergent cross-dimensional patterns.
- Return ONLY valid JSON, no markdown, no explanation

IDENTITY BLENDING ANALYSIS: After generating the standard identity dimensions, analyze how the dimensions interact and generate 2-3 identity blend signatures. A blend signature captures a cross-dimensional pattern that is more specific and predictive than any single dimension alone. Format each blend as: blend_name (a descriptive 2-3 word label), blend_dimensions (which dimensions combine to create this blend), blend_description (one sentence explaining what this specific combination reveals about the person that the individual dimensions miss), and blend_strength (0.0-1.0 confidence that this blend is a real signal, not noise).

Example: A consumer with Rebel archetype + artisanal aesthetic + music community creates a Cultural Dissenter blend — they reject mainstream from taste not anger. This is distinct from Rebel + streetwear + gaming which creates an Anti-Establishment Digital Native blend. The blend is the insight the individual dimensions miss.

Also analyze any music, film, art, or social signals as deep identity markers. A person who listens to Japanese city pop, watches Wes Anderson, and saves Bauhaus architecture has a specific aesthetic-cultural identity that maps to Creator/Sage archetype with heritage-modern aesthetic and curation-driven status signal. These signals are often stronger identity indicators than purchase history because people curate their cultural consumption more intentionally than their purchases.`;

// ── Route ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth + rate limit ──────────────────────────────────────────────
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  try {
    const body: ConsumerSignals = await req.json();

    const {
      purchase_history, search_queries, interests, free_text,
      music, films_tv, art_design, social_follows, saved_content,
    } = body;

    // Require at least one signal (any field)
    const hasSignal =
      (purchase_history && purchase_history.length > 0) ||
      (search_queries && search_queries.length > 0) ||
      (interests && interests.length > 0) ||
      !!free_text ||
      (music && music.length > 0) ||
      (films_tv && films_tv.length > 0) ||
      (art_design && art_design.length > 0) ||
      (social_follows && social_follows.length > 0) ||
      (saved_content && saved_content.length > 0);

    if (!hasSignal) {
      return NextResponse.json(
        { error: "At least one signal field is required" },
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
    if (music && music.length > 0) {
      signalParts.push(`Music they listen to (artists, genres, playlists):\n${music.map((s) => `- ${s}`).join("\n")}`);
    }
    if (films_tv && films_tv.length > 0) {
      signalParts.push(`Films & TV they watch (movies, shows, directors):\n${films_tv.map((s) => `- ${s}`).join("\n")}`);
    }
    if (art_design && art_design.length > 0) {
      signalParts.push(`Art & design they engage with (artists, movements, aesthetics):\n${art_design.map((s) => `- ${s}`).join("\n")}`);
    }
    if (social_follows && social_follows.length > 0) {
      signalParts.push(`Accounts / creators they follow:\n${social_follows.map((s) => `- ${s}`).join("\n")}`);
    }
    if (saved_content && saved_content.length > 0) {
      signalParts.push(`Saved / bookmarked content:\n${saved_content.map((s) => `- ${s}`).join("\n")}`);
    }
    if (free_text) {
      signalParts.push(`Additional context:\n${free_text}`);
    }

    const userMessage = `Analyze these behavioral signals and translate them into a structured consumer identity profile:\n\n${signalParts.join("\n\n")}`;

    // ── Step 2: GPT-4o-mini identity translation ───────────────────────
    // Extend the system prompt with any approved schema candidates
    const vocabExtension = await getVocabularyPromptExtension();
    const systemPrompt = TRANSLATION_SYSTEM_PROMPT + vocabExtension;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 1800,
      messages: [
        { role: "system", content: systemPrompt },
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
    const blendText =
      profile.blends && profile.blends.length > 0
        ? `Identity blends: ${profile.blends
            .map(
              (b) =>
                `${b.blend_name} (${b.blend_dimensions.join(" + ")}) — ${b.blend_description}`
            )
            .join(". ")}.`
        : "";

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
      blendText,
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

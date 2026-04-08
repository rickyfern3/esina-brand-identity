export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  // ── Auth + rate limit ──────────────────────────────────────────────
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  try {
    const { preferenceText } = await req.json();

    if (!preferenceText || typeof preferenceText !== "string") {
      return NextResponse.json(
        { error: "preferenceText is required" },
        { status: 400 }
      );
    }

    // 1. Generate embedding from the consumer's preference text
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: preferenceText,
    });
    const queryEmbedding = embeddingRes.data[0].embedding;

    // 2. Call the Supabase RPC to match against brand identity embeddings
    const { data: matches, error } = await supabase.rpc(
      "match_brands_by_embedding",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.25,
        match_count: 12,
      }
    );

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json(
        { error: `Supabase RPC error: ${error.message}` },
        { status: 500 }
      );
    }

    // 3. Format results, generate a match token per brand, and insert match_events
    const results = await Promise.all(
      (matches || []).map(
        async (m: {
          brand_id: string;
          brand_name: string;
          category: string;
          similarity: number;
          identity_text: string;
        }) => {
          // Extract first 2 sentences from identity_text for the snippet
          const sentences = (m.identity_text || "").match(/[^.!?]+[.!?]+/g) || [];
          const snippet = sentences.slice(0, 2).join("").trim();

          // Generate a unique token for this match event
          const matchToken = crypto.randomUUID();

          // Insert match event (non-fatal — log error but don't fail the response)
          const { error: insertError } = await supabase
            .from("match_events")
            .insert({
              id: matchToken,
              brand_profile_id: m.brand_id,
              brand_name: m.brand_name,
              similarity_score: m.similarity,
              preference_text: preferenceText,
              // consumer_signals and translated_profile are null for raw-text matches
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

    return NextResponse.json({ matches: results });
  } catch (err: unknown) {
    console.error("run-match error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

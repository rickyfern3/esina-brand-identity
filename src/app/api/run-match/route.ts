export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
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

    // 3. Format results with percentage scores and text snippets
    const results = (matches || []).map(
      (m: {
        brand_id: string;
        brand_name: string;
        category: string;
        similarity: number;
        identity_text: string;
      }) => {
        // Extract first 2 sentences from identity_text for the snippet
        const sentences = (m.identity_text || "").match(/[^.!?]+[.!?]+/g) || [];
        const snippet = sentences.slice(0, 2).join("").trim();

        return {
          brandId: m.brand_id,
          brandName: m.brand_name,
          category: m.category,
          score: Math.round(m.similarity * 100),
          rawSimilarity: m.similarity,
          snippet,
        };
      }
    );

    return NextResponse.json({ matches: results });
  } catch (err: unknown) {
    console.error("run-match error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

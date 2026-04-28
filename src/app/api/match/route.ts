export const dynamic = "force-dynamic";

/**
 * GET /api/match?q=consumer+description&limit=5
 *
 * Public, no-auth brand-matching endpoint.
 * Accepts a natural-language consumer description, embeds it with
 * text-embedding-3-small, and returns ranked brand matches from the
 * match_brands_by_embedding RPC.
 *
 * Designed as an AI tool integration surface — any LLM or agent can
 * call this to resolve "find me a brand for X" queries.
 *
 * Query params:
 *   q      (required) Consumer description, e.g. "minimalist jewelry for surfers"
 *   limit  (optional) Number of results, 1–20. Default: 5.
 *
 * Response shape:
 * {
 *   _meta: { query, limit, model, total, generated, docs },
 *   matches: [
 *     {
 *       id, name, slug, category, priceTier, primaryArchetype,
 *       values, emotionalResonance, statusSignal,
 *       description, score,
 *       profileUrl, brandMdUrl, apiUrl
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { brandSlug } from "@/lib/brand-utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limitParam = parseInt(searchParams.get("limit") ?? "5", 10);
  const limit = Math.max(1, Math.min(isNaN(limitParam) ? 5 : limitParam, 20));

  // ── Validate ────────────────────────────────────────────────────────────────

  if (!q) {
    return NextResponse.json(
      {
        error: "Missing required parameter: q",
        hint: "Pass a consumer description, e.g. ?q=minimalist+sustainable+jewelry+for+surfers",
      },
      { status: 400, headers: CORS }
    );
  }

  if (q.length < 3) {
    return NextResponse.json(
      { error: "Query too short — minimum 3 characters" },
      { status: 400, headers: CORS }
    );
  }

  if (q.length > 1000) {
    return NextResponse.json(
      { error: "Query too long — maximum 1000 characters" },
      { status: 400, headers: CORS }
    );
  }

  // ── Embed ────────────────────────────────────────────────────────────────────

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let embedding: number[];
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: q,
    });
    embedding = res.data[0].embedding;
  } catch (err) {
    console.error("[/api/match] embedding error:", err);
    return NextResponse.json(
      { error: "Failed to generate query embedding" },
      { status: 502, headers: CORS }
    );
  }

  // ── Vector search ────────────────────────────────────────────────────────────

  const { data: rpcMatches, error: rpcError } = await supabase.rpc(
    "match_brands_by_embedding",
    {
      query_embedding: embedding,
      match_threshold: 0.25,
      match_count: limit,
    }
  );

  if (rpcError) {
    console.error("[/api/match] RPC error:", rpcError);
    return NextResponse.json(
      { error: "Match query failed", detail: rpcError.message },
      { status: 500, headers: CORS }
    );
  }

  const raw = (rpcMatches || []) as {
    brand_id: string;
    brand_name: string;
    category: string;
    similarity: number;
    identity_text: string;
  }[];

  if (raw.length === 0) {
    return NextResponse.json(
      {
        _meta: {
          query: q,
          limit,
          model: "text-embedding-3-small",
          total: 0,
          generated: new Date().toISOString(),
          docs: "https://esina.app/llms.txt",
        },
        matches: [],
      },
      { headers: { ...CORS, "Cache-Control": "no-store" } }
    );
  }

  // ── Enrich with full brand details ───────────────────────────────────────────

  const ids = raw.map((m) => m.brand_id);

  const { data: details } = await supabase
    .from("brand_profiles")
    .select(
      "id, brand_name, category, price_tier, archetypes, values, " +
      "emotional_resonance, status_signal_type, differentiation_claim"
    )
    .in("id", ids);

  const detailMap = new Map(
    (details || []).map((d) => [d.id as string, d])
  );

  // ── Format response ──────────────────────────────────────────────────────────

  const matches = raw.map((m) => {
    const detail = detailMap.get(m.brand_id);
    const slug = brandSlug(m.brand_name);

    const archetypes =
      ((detail?.archetypes ?? []) as {
        archetype: string;
        weight: number;
        primary: boolean;
      }[]) || [];
    const primaryArchetype =
      archetypes.find((a) => a.primary)?.archetype ||
      archetypes[0]?.archetype ||
      null;

    const values = ((detail?.values ?? []) as string[]) || [];

    // Description: prefer differentiation_claim, fall back to identity_text first sentence
    let description: string | null = null;
    if (detail?.differentiation_claim) {
      description = String(detail.differentiation_claim).slice(0, 200);
    } else if (m.identity_text) {
      const firstSentence =
        m.identity_text.match(/^[^.!?]+[.!?]/)?.[0] ?? m.identity_text.slice(0, 160);
      description = firstSentence.trim();
    }

    return {
      id: m.brand_id,
      name: m.brand_name,
      slug,
      category: m.category || detail?.category || null,
      priceTier: (detail?.price_tier as string) || null,
      primaryArchetype,
      values: values.slice(0, 6),
      emotionalResonance: (detail?.emotional_resonance as string) || null,
      statusSignal: (detail?.status_signal_type as string) || null,
      description,
      score: Math.round(m.similarity * 1000) / 1000,
      profileUrl: `https://esina.app/brands/${slug}`,
      brandMdUrl: `https://esina.app/brands/${slug}/brand.md`,
      apiUrl: `https://esina.app/api/brand/${m.brand_id}`,
    };
  });

  return NextResponse.json(
    {
      _meta: {
        query: q,
        limit,
        model: "text-embedding-3-small",
        total: matches.length,
        generated: new Date().toISOString(),
        docs: "https://esina.app/llms.txt",
      },
      matches,
    },
    {
      headers: {
        ...CORS,
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    }
  );
}

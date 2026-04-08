export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  const { data, error } = await supabase
    .from("match_events")
    .select(
      "id, created_at, brand_name, similarity_score, preference_text, attribution_status, converted_at, conversion_type, consumer_signals, translated_profile"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return a summary-friendly view
  const summary = (data || []).map((row: {
    id: string;
    created_at: string;
    brand_name: string;
    similarity_score: number;
    preference_text: string | null;
    attribution_status: string;
    converted_at: string | null;
    conversion_type: string | null;
    consumer_signals: unknown;
    translated_profile: unknown;
  }) => ({
    id: row.id,
    created_at: row.created_at,
    brand_name: row.brand_name,
    similarity_score: row.similarity_score,
    preference_text_snippet: row.preference_text ? row.preference_text.slice(0, 80) + "…" : null,
    attribution_status: row.attribution_status,
    has_consumer_signals: row.consumer_signals !== null,
    has_translated_profile: row.translated_profile !== null,
    consumer_signals: row.consumer_signals,
    translated_profile_keys: row.translated_profile
      ? Object.keys(row.translated_profile as Record<string, unknown>)
      : null,
  }));

  return NextResponse.json({ count: summary.length, rows: summary });
}

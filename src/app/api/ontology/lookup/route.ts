export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[''`]/g, "'").replace(/\s+/g, " ").trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const value = searchParams.get("value");

  if (!type || !value) {
    return NextResponse.json({ error: "type and value required" }, { status: 400 });
  }

  const normalized = normalize(value);

  // Exact normalized match
  const { data, error } = await supabase
    .from("mapping_ontology")
    .select("archetype_weights, value_associations, aesthetic_associations, community_associations, status_signal, emotional_resonance, confidence")
    .eq("signal_type", type)
    .eq("signal_value_normalized", normalized)
    .maybeSingle();

  if (error) {
    console.error("[ontology/lookup]", error.message);
    return NextResponse.json({ found: false, mapping: null });
  }

  if (data) {
    // Increment usage_count (non-blocking)
    supabase
      .from("mapping_ontology")
      .update({ usage_count: supabase.rpc as unknown as number, updated_at: new Date().toISOString() })
      .eq("signal_type", type)
      .eq("signal_value_normalized", normalized)
      .then(() => {});

    return NextResponse.json({ found: true, mapping: data });
  }

  // Fuzzy fallback: try contains match
  const { data: fuzzy } = await supabase
    .from("mapping_ontology")
    .select("archetype_weights, value_associations, aesthetic_associations, community_associations, status_signal, emotional_resonance, confidence")
    .eq("signal_type", type)
    .ilike("signal_value_normalized", `%${normalized.split(" ").slice(0, 2).join(" ")}%`)
    .limit(1)
    .maybeSingle();

  if (fuzzy) {
    return NextResponse.json({ found: true, mapping: fuzzy, fuzzy: true });
  }

  return NextResponse.json({ found: false, mapping: null });
}

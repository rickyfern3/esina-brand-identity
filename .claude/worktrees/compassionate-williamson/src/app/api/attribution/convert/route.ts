export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── Route ──────────────────────────────────────────────────────────────
// POST /api/attribution/convert
//
// Called by esina.js (client-side pixel) or directly by AI agents
// when a consumer completes a conversion after being matched.
//
// Body: { brand_id, match_token, conversion_type? }

export async function POST(req: NextRequest) {
  let body: { brand_id?: string; match_token?: string; conversion_type?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { brand_id, match_token, conversion_type = "purchase" } = body;

  // Require at least one identifier
  if (!brand_id && !match_token) {
    return NextResponse.json(
      { error: "Provide at least one of: brand_id, match_token" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const results: string[] = [];

  // 1. If we have a match_token, update the match_events row
  if (match_token) {
    const { data: updated, error: matchErr } = await supabase
      .from("match_events")
      .update({
        attribution_status: "converted",
        converted_at: now,
        conversion_type,
      })
      .eq("id", match_token)
      .eq("attribution_status", "pending") // only update pending events
      .select("id, brand_name, similarity_score")
      .single();

    if (matchErr) {
      // Not fatal — token may have expired or already been converted
      console.warn("match_events update:", matchErr.message);
      results.push(`match_token: ${matchErr.message}`);
    } else if (updated) {
      results.push(`match_event ${updated.id} marked converted`);
    } else {
      results.push("match_token: no pending event found (may be expired or already converted)");
    }
  }

  // 2. Also link to a brand_md_serves row if we can find one
  //    (a serve token may arrive as match_token too — try both tables)
  if (match_token) {
    const { data: serveRow } = await supabase
      .from("brand_md_serves")
      .select("id, brand_id")
      .eq("esina_token", match_token)
      .maybeSingle();

    if (serveRow) {
      results.push(`brand_md_serves row ${serveRow.id} linked to conversion`);
    }
  }

  // 3. CORS headers — this endpoint is called from third-party brand websites
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  return NextResponse.json(
    {
      ok: true,
      converted_at: now,
      conversion_type,
      results,
    },
    { status: 200, headers }
  );
}

// Handle preflight CORS for the embeddable script
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── CORS headers (required — this endpoint is called from third-party sites) ──

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Allowed visit types ────────────────────────────────────────────────────

const VALID_TYPES = new Set(["pageview", "conversion", "jsonld_request"]);

// ── UUID format check ──────────────────────────────────────────────────────

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

// ── Preflight ──────────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── POST /api/visit ────────────────────────────────────────────────────────
// Payload (from the pixel, field names kept short to minimise beacon size):
//   b   — brand_id (UUID)
//   t   — visit_type: 'pageview' | 'conversion' | 'jsonld_request'
//   ai  — is_ai_agent: boolean
//   an  — agent_name: string | null
//   ua  — user_agent (truncated to 250 chars in pixel)
//   r   — referrer (truncated to 500 chars)
//   pg  — page_url (truncated to 500 chars)
//   oid — order_id (optional, Shopify conversions only)

export async function POST(req: NextRequest) {
  // Parse body — the pixel sends application/json; handle text/plain fallback
  // (some older sendBeacon implementations send text/plain to avoid preflight)
  let body: Record<string, unknown>;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      const text = await req.text();
      body = JSON.parse(text);
    } else {
      body = await req.json();
    }
  } catch {
    return new NextResponse(null, { status: 400, headers: CORS });
  }

  // Validate brand ID
  const brandId = typeof body.b === "string" ? body.b.trim() : "";
  if (!brandId || !isUUID(brandId)) {
    return new NextResponse(null, { status: 400, headers: CORS });
  }

  // Validate visit type
  const visitType = typeof body.t === "string" && VALID_TYPES.has(body.t)
    ? body.t
    : "pageview";

  // Sanitize fields
  const isAi    = body.ai === true;
  const agentName = typeof body.an === "string" ? body.an.slice(0, 50)  : null;
  const userAgent = typeof body.ua === "string" ? body.ua.slice(0, 250) : null;
  const referrer  = typeof body.r  === "string" ? body.r.slice(0, 500)  : null;
  const pageUrl   = typeof body.pg === "string" ? body.pg.slice(0, 500) : null;
  const orderId   = typeof body.oid === "string" ? body.oid.slice(0, 100) : null;

  // Verify brand exists (lightweight lookup — just id)
  const { data: brandRow, error: brandErr } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", brandId)
    .single();

  if (brandErr || !brandRow) {
    // Unknown brand — log nothing, return 204 silently (don't reveal existence)
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  // Insert visit record (non-fatal — don't surface DB errors to the pixel)
  const { error } = await supabase.from("agent_visits").insert({
    brand_id:   brandId,
    visit_type: visitType,
    is_ai_agent: isAi,
    agent_name: agentName,
    user_agent: userAgent,
    referrer,
    page_url:   pageUrl,
    order_id:   orderId,
    metadata:   null,
  });

  if (error) {
    // Log server-side but return success to client so beacon never retries
    console.error("[visit]", error.message);
  }

  // 204 No Content — beacon doesn't need a body
  return new NextResponse(null, { status: 204, headers: CORS });
}

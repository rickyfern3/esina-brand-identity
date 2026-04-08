export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/cleanup-expired-matches
 *
 * Deletes match_events rows where:
 *   - expires_at < NOW()  (older than 30 days)
 *   - attribution_status = 'pending'  (not converted — never delete converted rows)
 *
 * Called automatically by Vercel Cron (daily at 03:00 UTC, see vercel.json).
 * Can also be triggered manually with the CRON_SECRET header.
 */
export async function POST(req: NextRequest) {
  // Verify the request comes from Vercel Cron or an authorized caller
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call the cleanup function we created in Supabase
    const { data, error } = await supabase.rpc("cleanup_expired_match_events");

    if (error) {
      console.error("cleanup_expired_match_events RPC error:", error);
      return NextResponse.json(
        { error: error.message, detail: error.details },
        { status: 500 }
      );
    }

    const deletedCount = data as number ?? 0;
    console.log(`[cleanup] Deleted ${deletedCount} expired pending match_events`);

    return NextResponse.json({
      ok: true,
      deleted: deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("cleanup route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Also support GET so Vercel Cron can call it directly
export async function GET(req: NextRequest) {
  return POST(req);
}

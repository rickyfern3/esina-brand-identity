export const dynamic = "force-dynamic";

/**
 * GET /brands/[slug]/brand.md
 *
 * Human-readable URL serving the full brand identity profile as plain-text Markdown.
 * Resolves the slug to a brand ID, then proxies /api/brand/[brandId].
 *
 * AI crawlers get stable, slug-based URLs that don't expose internal UUIDs.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { brandSlug } from "@/lib/brand-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Resolve slug → brand ID
  const { data: brands } = await supabase
    .from("brand_profiles")
    .select("id, brand_name");

  const brand = (brands || []).find((b) => brandSlug(b.brand_name) === slug);

  if (!brand) {
    return new NextResponse("Brand not found", { status: 404 });
  }

  // Proxy the /api/brand/[brandId] response so the content is served
  // directly at the slug-based URL (no redirect that would change the URL).
  const origin = new URL(req.url).origin;
  const apiUrl = `${origin}/api/brand/${brand.id}`;

  const upstream = await fetch(apiUrl, {
    headers: { Accept: "text/markdown, text/plain" },
    // next.js revalidation isn't needed here — force-dynamic handles it
  });

  if (!upstream.ok) {
    return new NextResponse("Upstream error", { status: upstream.status });
  }

  const body = await upstream.text();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

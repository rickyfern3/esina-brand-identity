export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url")?.trim();
  const brandId = searchParams.get("brandId")?.trim();

  if (!url) return NextResponse.json({ verified: false, error: "url required" }, { status: 400 });

  // Normalise URL
  let targetUrl = url;
  if (!/^https?:\/\//i.test(targetUrl)) targetUrl = `https://${targetUrl}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "ESINA-Verifier/1.0 (brand identity infrastructure)",
        Accept: "text/html",
      },
      // 8-second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({
        verified: false,
        error: `Website returned ${res.status}. Double-check the URL and try again.`,
      });
    }

    const html = await res.text();

    // Check for esina.js script OR brand-identity link rel
    const hasEsinaScript = html.includes("esina.js") || html.includes("esina.app/esina");
    const hasBrandIdentityTag = html.includes('rel="brand-identity"') || html.includes("brand-identity");

    // If a brandId was provided, also check it appears
    const hasBrandId = brandId ? html.includes(brandId) : true;

    const verified = (hasEsinaScript || hasBrandIdentityTag) && hasBrandId;

    return NextResponse.json({ verified });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("timeout") || msg.includes("TimeoutError")) {
      return NextResponse.json({
        verified: false,
        error: "Your website took too long to respond. It may still be installing — wait a minute and try again.",
      });
    }

    return NextResponse.json({
      verified: false,
      error: "We couldn't reach your website. Check the URL and try again.",
    });
  }
}

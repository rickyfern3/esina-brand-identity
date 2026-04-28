export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

// ── Pixel source ───────────────────────────────────────────────────────────
// Written in ES5-compatible style for maximum compatibility.
// Brand ID is injected server-side; everything else runs client-side.
// Designed to be loaded with the `async` attribute — zero blocking.
//
// Usage:
//   <script async src="https://esina.app/api/esina.js?brand=BRAND_ID"></script>
//
// Optional config (set before the script tag):
//   <script>window.esina = { conversionUrl: '/order-confirmed' };</script>

function buildPixel(brandId: string): string {
  // Known AI crawlers — name maps to a short normalized slug for analytics
  // Kept as a flat array of pairs to minimize bytes in the served script.
  const BOTS = JSON.stringify([
    ["GPTBot",             "gptbot"],
    ["ChatGPT-User",       "chatgpt"],
    ["ClaudeBot",          "claude"],
    ["Claude-Web",         "claude"],
    ["anthropic-ai",       "claude"],
    ["PerplexityBot",      "perplexity"],
    ["YouBot",             "you"],
    ["cohere-ai",          "cohere"],
    ["Applebot",           "applebot"],
    ["Amazonbot",          "amazonbot"],
    ["Bytespider",         "bytespider"],
    ["Meta-ExternalAgent", "meta"],
    ["Googlebot",          "googlebot"],
    ["bingbot",            "bingbot"],
    ["Diffbot",            "diffbot"],
    ["CCBot",              "ccbot"],
    ["facebookexternalhit","facebook"],
  ]);

  return `/* ESINA Identity Pixel v1 | https://esina.app */
(function(w,d,n){
var B=${JSON.stringify(brandId)},A="https://esina.app/api",
BOTS=${BOTS},
ua=n.userAgent||"",ai={is:false,name:null};

// Detect AI agent from user-agent string
for(var i=0;i<BOTS.length;i++){if(ua.indexOf(BOTS[i][0])>-1){ai={is:true,name:BOTS[i][1]};break;}}

// Non-blocking fire-and-forget beacon
// sendBeacon is used when available (guaranteed delivery on unload);
// falls back to async XHR.
function ping(path,data){
  var j=JSON.stringify(data);
  try{if(n.sendBeacon&&n.sendBeacon(A+path,new Blob([j],{type:"application/json"})))return;}catch(e){}
  try{var x=new XMLHttpRequest();x.open("POST",A+path,true);x.setRequestHeader("Content-Type","application/json");x.send(j);}catch(e){}
}

// Build and send a visit payload
function log(type,extra){
  var p={b:B,t:type,ai:ai.is,an:ai.name,
         ua:ua.slice(0,250),r:(d.referrer||"").slice(0,500),
         pg:w.location.href.slice(0,500)};
  if(extra)for(var k in extra)if(Object.prototype.hasOwnProperty.call(extra,k))p[k]=extra[k];
  ping("/visit",p);
}

// Fetch brand identity in JSON-LD and inject into <head> so AI crawlers
// that parse structured data can read it without fetching brand.md.
function injectJsonLd(){
  if(!w.fetch)return;
  w.fetch(A+"/brand/"+B+"?format=jsonld",{headers:{"Accept":"application/json"}})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(data){
      if(!data)return;
      var s=d.createElement("script");
      s.type="application/ld+json";
      s.textContent=JSON.stringify(data);
      (d.head||d.documentElement).appendChild(s);
    }).catch(function(){});
}

// Conversion detection — fires a 'conversion' event once per unique page load.
// Priority order: explicit config > Shopify checkout object > URL pattern > Shopify AJAX event.
var _conv=false;
function conv(){
  if(_conv)return;
  // 1. Brand-configured URL fragment
  var cfg=w.esina||{};
  if(cfg.conversionUrl&&w.location.href.indexOf(cfg.conversionUrl)>-1){_conv=true;log("conversion");return;}
  // 2. Shopify Checkout object present on order-status page
  if(w.Shopify){
    var co=(w.Shopify.checkout||w.Shopify.Checkout);
    if(co){_conv=true;log("conversion",{oid:String((co.order_id||co.orderId)||"")});return;}
  }
  // 3. URL pattern matching (covers most common thank-you page patterns)
  if(/\/(thank.you|order.confirmation|order.complete|order.status|checkout.complete|purchase.complete|success)\b/i.test(w.location.pathname)||
     /[?&](thank_you|order_id)=/i.test(w.location.search)){
    _conv=true;log("conversion");return;
  }
  // 4. Shopify Liquid AJAX navigation event (liquid themes with Shopify.js)
  d.addEventListener("page:change",function(){if(!_conv&&/thank.you/i.test(w.location.href)){_conv=true;log("conversion");}});
}

// Entry: log pageview + run conversion check
function run(){log("pageview");conv();}

// If AI agent: inject JSON-LD immediately (before DOM ready — head already exists)
if(ai.is)injectJsonLd();

// Defer main run until DOM is interactive so it never blocks render
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",run);
else run();

})(window,document,navigator);`;
}

// ── Route ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand") ?? "";

  // Validate brand ID format (UUID-like, 10+ chars) before serving the pixel.
  // We don't hit the DB here — the /api/visit endpoint validates on every beacon.
  if (!brandId || !/^[0-9a-f-]{10,}$/i.test(brandId)) {
    return new NextResponse(
      `/* ESINA pixel: missing or invalid ?brand= parameter */\nconsole.warn("[ESINA] missing brand ID");`,
      {
        status: 400,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }

  const pixel = buildPixel(brandId);

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      // Cache for 5 minutes on CDN, stale-while-revalidate 1 hour.
      // Short enough to pick up pixel updates; long enough to avoid hammering the server.
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      // Allow any site to load this script (no CORS restriction on script src itself)
      "Access-Control-Allow-Origin": "*",
      "Vary": "Accept-Encoding",
    },
  });
}

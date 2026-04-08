#!/usr/bin/env node
/**
 * seed-depop-sellers.mjs
 *
 * Seeds Depop seller profiles into ESINA's brand_profiles table.
 * Accepts seller data from a JSON input file, generates structured brand
 * identity profiles via GPT-4o-mini, embeds them, and runs a perception audit.
 *
 * Usage:
 *   node seed-depop-sellers.mjs sellers.json
 *   node seed-depop-sellers.mjs sellers.json --dry-run
 *
 * Input file format (sellers.json):
 * [
 *   {
 *     "sellerUsername": "margot_vintage",          // Depop @handle (optional)
 *     "shopName": "Margot Vintage",                 // Displayed shop name
 *     "bio": "Curating slow fashion since 2019…",  // Shop bio text
 *     "listings": "1. Levi's 501 90s deadstock…\n2. Y2K slip dress…" // 10-15 listings
 *   }
 * ]
 *
 * Env vars required (add to .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ── Load env from .env.local if not already set ────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error("\n❌ Missing env vars. Set in .env.local:\n  NEXT_PUBLIC_SUPABASE_URL\n  SUPABASE_SERVICE_ROLE_KEY\n  OPENAI_API_KEY\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

const DRY_RUN = process.argv.includes("--dry-run");

// ── Helpers ────────────────────────────────────────────────────────────

function parseJSON(raw) {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function gpt(system, user, maxTokens = 2000) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return parseJSON(res.choices[0]?.message?.content || "{}");
}

// ── Controlled vocabulary prompt ────────────────────────────────────────

const PROFILE_SYSTEM_PROMPT = `You are a brand identity analyst specializing in independent and Depop sellers.
Based on a Depop seller's shop data — their bio, listing titles, and descriptions — generate a structured brand identity profile.

Use ONLY the controlled vocabulary below. Return valid JSON only, no markdown.

CONTROLLED VOCABULARY:

category (pick ONE): fashion, jewelry, accessories, beauty, homeware, lifestyle, streetwear, vintage, art

subcategories (array, pick relevant): womenswear, menswear, unisex, jewellery, bags, shoes, outerwear, knitwear, denim,
  ceramics, prints, candles, skincare, fragrance, vintage-90s, vintage-y2k, vintage-70s, deadstock, upcycled, handmade

archetypes (array of objects with archetype, weight 0-1, primary bool — max 3):
  Creator, Caregiver, Ruler, Jester, Everyman, Lover, Hero, Outlaw, Magician, Sage, Explorer, Innocent

values (max 5, priority order): craftsmanship, sustainability, individuality, authenticity, community, nostalgia,
  self-expression, quality, accessibility, creativity, intentionality, storytelling, heritage, inclusivity,
  minimalism, maximalism, slow-fashion, circularity, femininity, empowerment

anti_values (max 3): fast-fashion, mass-production, conformity, logos, wastefulness, status-signaling, inauthenticity

style_tags (max 5): minimalist, maximalist, vintage, contemporary, artisanal, streetwear, preppy, bohemian,
  romantic, utilitarian, androgynous, feminine, sculptural, organic, graphic, monochrome, earthy, playful

design_language (pick ONE): clean, ornate, handcrafted, architectural, raw, refined, playful, geometric, fluid, eclectic

visual_tone (pick ONE): muted, bold, earthy, monochrome, vibrant, pastel, dark, washed, saturated

voice_tone (pick ONE): formal, casual, irreverent, authoritative, warm, edgy

humor_level (pick ONE): none, subtle, moderate, heavy

emotional_resonance (pick ONE): joy, nostalgia, confidence, calm, rebellion, belonging, aspiration, intimacy,
  wonder, pride, discovery

sustainability_level (pick ONE): none, partial, committed, core

status_signal_type (pick ONE): conspicuous, quiet_luxury, counterculture, accessible_premium, anti_status

logo_visibility (pick ONE): hidden, subtle, visible, prominent

exclusivity_level (pick ONE): mass, accessible, selective, exclusive

communities (max 5): vintage-lovers, thrifters, sustainability-advocates, fashion-students, artists, creatives,
  slow-fashion-community, upcyclers, streetwear-heads, independent-fashion, craft-enthusiasts, jewellery-lovers,
  Depop-community, London-fashion-scene, NYC-fashion-scene, the-sartorialist, archival-fashion

price_tier (pick ONE): budget, value, mid, premium

Return a JSON object with ALL of these fields:
{
  "brand_name": "seller shop name",
  "category": "...",
  "subcategories": [],
  "price_tier": "...",
  "archetypes": [{"archetype": "...", "weight": 0.8, "primary": true}],
  "values": [],
  "anti_values": [],
  "style_tags": [],
  "design_language": "...",
  "visual_tone": "...",
  "voice_tone": "...",
  "humor_level": "...",
  "emotional_resonance": "...",
  "sustainability_level": "...",
  "status_signal_type": "...",
  "logo_visibility": "...",
  "exclusivity_level": "...",
  "communities": [],
  "identity_statements": ["statement 1", "statement 2", "statement 3"],
  "origin_story": "...",
  "differentiation_claim": "...",
  "identity_text": "A rich 3-5 sentence natural language blob describing the brand's full identity, values, aesthetic, community, and positioning — written for embedding/retrieval."
}`;

// ── Identity text builder (mirrors lib/identity-text.ts) ──────────────

function generateIdentityText(p) {
  const parts = [];
  const priceTier = p.price_tier ? `${p.price_tier}-tier` : "";
  parts.push(`${p.brand_name} is a ${[priceTier, p.category].filter(Boolean).join(" ")} brand.`);
  if (p.archetypes?.length) {
    const names = [...p.archetypes].sort((a, b) => b.weight - a.weight).map((a) => a.archetype);
    parts.push(`Brand archetypes: ${names.join(", ")}.`);
  }
  if (p.values?.length) parts.push(`Core values: ${p.values.join(", ")}.`);
  if (p.anti_values?.length) parts.push(`This brand is not: ${p.anti_values.join(", ")}.`);
  if (p.style_tags?.length) parts.push(`Visual style: ${p.style_tags.join(", ")}.`);
  const aesthetic = [p.design_language, p.visual_tone].filter(Boolean);
  if (aesthetic.length) parts.push(`Aesthetic: ${aesthetic.join(", ")}.`);
  if (p.voice_tone) {
    const humor = p.humor_level && p.humor_level !== "none" ? ` with ${p.humor_level} humor` : "";
    parts.push(`Brand voice: ${p.voice_tone}${humor}.`);
  }
  if (p.status_signal_type) {
    const logo = p.logo_visibility ? `, ${p.logo_visibility} logo visibility` : "";
    parts.push(`Status signal: ${p.status_signal_type}${logo}.`);
  }
  if (p.exclusivity_level) parts.push(`Exclusivity: ${p.exclusivity_level}.`);
  if (p.emotional_resonance) parts.push(`Buying this brand evokes: ${p.emotional_resonance}.`);
  if (p.sustainability_level && p.sustainability_level !== "none")
    parts.push(`Sustainability commitment: ${p.sustainability_level}.`);
  if (p.communities?.length) parts.push(`Communities: ${p.communities.join(", ")}.`);
  if (p.identity_statements?.length) {
    p.identity_statements.forEach((s) => { if (s?.trim()) parts.push(s.trim()); });
  }
  if (p.origin_story?.trim()) parts.push(p.origin_story.trim());
  if (p.differentiation_claim?.trim()) parts.push(`Differentiation: ${p.differentiation_claim.trim()}`);
  return parts.join(" ");
}

// ── Audit helpers ──────────────────────────────────────────────────────

async function runAudit(brandId, brandName, category, profile, identityText) {
  const identitySnippet = [
    profile.values?.length ? `values ${profile.values.join(", ")}` : "",
    profile.style_tags?.length ? `style is ${profile.style_tags.join(", ")}` : "",
    profile.voice_tone ? `voice is ${profile.voice_tone}` : "",
    profile.status_signal_type ? `${profile.status_signal_type} positioning` : "",
  ].filter(Boolean).join(", ") || identityText.split(".").slice(0, 2).join(".").trim();

  const [q1, q2, q3] = await Promise.all([
    gpt(
      "You are a brand analyst. Respond ONLY in valid JSON format.",
      `Analyze the Depop seller/brand "${brandName}" in the "${category}" category. Provide:
{
  "brand_known": false,
  "perceived_archetypes": [],
  "perceived_values": [],
  "perceived_style_tags": [],
  "perceived_price_tier": "budget|value|mid|premium|luxury",
  "perceived_target_demographic": "",
  "perceived_communities": [],
  "perceived_status_signal": "conspicuous|quiet_luxury|counterculture|accessible_premium|anti_status",
  "perceived_voice_tone": "formal|casual|irreverent|authoritative|warm|edgy",
  "perceived_strengths": [],
  "perceived_weaknesses": [],
  "one_sentence_description": ""
}`
    ),
    gpt(
      "You are a brand analyst. Respond ONLY in valid JSON format.",
      `For Depop seller "${brandName}" in "${category}", analyze competitive positioning:
{
  "direct_competitors": [],
  "identity_differentiators": [],
  "identity_overlaps": [],
  "cultural_positioning": "",
  "trend_alignment": [],
  "recommendation_likelihood": "high|medium|low"
}`
    ),
    gpt(
      "You are a Depop shopping assistant. Respond ONLY in valid JSON format.",
      `A shopper asks: "I'm looking for an independent ${category} seller that ${identitySnippet}. Any recs?"
{
  "brand_mentioned": false,
  "mention_position": null,
  "brands_recommended_instead": [],
  "why_recommended_or_not": "",
  "identity_accuracy": ""
}`
    ),
  ]);

  // Simple alignment score — match arrays between self-report and perception
  function overlap(a = [], b = []) {
    const bLow = b.map((x) => x.toLowerCase());
    return a.filter((x) => bLow.some((y) => y.includes(x.toLowerCase()) || x.toLowerCase().includes(y))).length;
  }

  const archetypePoints = Math.min(
    15,
    Math.round(
      (overlap(
        (profile.archetypes || []).map((a) => a.archetype),
        q1.perceived_archetypes || []
      ) / Math.max(1, (profile.archetypes || []).length)) * 15
    )
  );
  const valuePoints = Math.min(
    15,
    Math.round(
      (overlap(profile.values || [], q1.perceived_values || []) /
        Math.max(1, (profile.values || []).length)) * 15
    )
  );
  const stylePoints = Math.min(
    10,
    Math.round(
      (overlap(profile.style_tags || [], q1.perceived_style_tags || []) /
        Math.max(1, (profile.style_tags || []).length)) * 10
    )
  );
  const priceMatch = profile.price_tier === q1.perceived_price_tier ? 10 : 0;
  const communityPoints = Math.min(
    10,
    Math.round(
      (overlap(profile.communities || [], q1.perceived_communities || []) /
        Math.max(1, (profile.communities || []).length)) * 10
    )
  );
  const signalMatch = profile.status_signal_type === q1.perceived_status_signal ? 10 : 5;
  const voiceMatch = profile.voice_tone === q1.perceived_voice_tone ? 10 : 5;
  const recPoints = q2.recommendation_likelihood === "high" ? 10 : q2.recommendation_likelihood === "medium" ? 5 : 0;
  const mentionPoints = q3.brand_mentioned ? 10 : 0;

  const alignmentScore = Math.min(
    100,
    archetypePoints + valuePoints + stylePoints + priceMatch +
    communityPoints + signalMatch + voiceMatch + recPoints + mentionPoints
  );

  const { error: auditErr } = await supabase.from("perception_audits").insert({
    brand_profile_id: brandId,
    ai_model_used: "gpt-4o-mini",
    query_category: "full_audit",
    raw_ai_response: JSON.stringify({ q1, q2, q3 }),
    perceived_archetypes: q1.perceived_archetypes || [],
    perceived_values: q1.perceived_values || [],
    perceived_style_tags: q1.perceived_style_tags || [],
    perceived_price_tier: q1.perceived_price_tier || null,
    perceived_target_demographic: q1.perceived_target_demographic || null,
    perceived_communities: q1.perceived_communities || [],
    perceived_status_signal: q1.perceived_status_signal || null,
    perceived_voice_tone: q1.perceived_voice_tone || null,
    perceived_strengths: q1.perceived_strengths || [],
    perceived_weaknesses: q1.perceived_weaknesses || [],
    identity_alignment_score: alignmentScore,
    aligned_dimensions: [],
    gap_dimensions: [],
    gap_details: { q1, q2, q3 },
    recommendations: [],
  });

  if (auditErr) console.warn(`  ⚠ Audit insert warning: ${auditErr.message}`);
  return alignmentScore;
}

// ── Main pipeline for one seller ───────────────────────────────────────

async function seedSeller(seller, index, total) {
  const { sellerUsername = "", shopName, bio = "", listings } = seller;

  console.log(`\n[${index + 1}/${total}] ${shopName}${sellerUsername ? ` (@${sellerUsername})` : ""}`);

  // 1. Generate profile
  process.stdout.write("  ▸ Generating brand profile… ");
  const profile = await gpt(
    PROFILE_SYSTEM_PROMPT,
    `SELLER SHOP NAME: ${shopName}\n\nSHOP BIO:\n${bio}\n\nLISTING TITLES & DESCRIPTIONS:\n${listings}`,
    2500
  );
  profile.brand_name = shopName;
  console.log("done");

  if (DRY_RUN) {
    console.log("  [DRY RUN] Profile preview:");
    console.log(`    Values: ${(profile.values || []).join(", ")}`);
    console.log(`    Style:  ${(profile.style_tags || []).join(", ")}`);
    console.log(`    Signal: ${profile.status_signal_type}`);
    return { shopName, skipped: true };
  }

  // 2. Build identity text
  process.stdout.write("  ▸ Building identity text… ");
  const structuredText = generateIdentityText(profile);
  const gptBlob = typeof profile.identity_text === "string" && profile.identity_text.length > 50
    ? profile.identity_text
    : null;
  const identityText = gptBlob ? `${structuredText} ${gptBlob}` : structuredText;
  console.log("done");

  // 3. Generate embedding
  process.stdout.write("  ▸ Generating embedding… ");
  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: identityText,
  });
  const embedding = embRes.data[0].embedding;
  console.log("done");

  // 4. Insert brand_profiles
  process.stdout.write("  ▸ Inserting brand profile… ");
  const { data: brand, error: insertErr } = await supabase
    .from("brand_profiles")
    .insert({
      brand_name: String(profile.brand_name),
      category: String(profile.category || "fashion"),
      subcategories: profile.subcategories || [],
      price_tier: profile.price_tier || null,
      archetypes: profile.archetypes || [],
      values: profile.values || [],
      anti_values: profile.anti_values || [],
      style_tags: profile.style_tags || [],
      design_language: profile.design_language || null,
      visual_tone: profile.visual_tone || null,
      voice_tone: profile.voice_tone || null,
      humor_level: profile.humor_level || null,
      emotional_resonance: profile.emotional_resonance || null,
      sustainability_level: profile.sustainability_level || null,
      status_signal_type: profile.status_signal_type || null,
      logo_visibility: profile.logo_visibility || null,
      exclusivity_level: profile.exclusivity_level || null,
      communities: profile.communities || [],
      identity_statements: profile.identity_statements || [],
      origin_story: profile.origin_story || null,
      differentiation_claim: profile.differentiation_claim || null,
      origin_location: sellerUsername ? `depop:${sellerUsername}` : null,
      profile_status: "complete",
      profile_completeness: 0.85,
      identity_text: identityText,
      identity_embedding: embedding,
    })
    .select("id, brand_name")
    .single();

  if (insertErr || !brand) {
    console.log("FAILED");
    console.error(`  ❌ ${insertErr?.message}`);
    return { shopName, error: insertErr?.message };
  }
  console.log(`done → ${brand.id}`);

  // 5. Run audit
  process.stdout.write("  ▸ Running perception audit… ");
  const score = await runAudit(brand.id, brand.brand_name, String(profile.category), profile, identityText);
  console.log(`done → score: ${score}/100`);

  // 6. Mark audited
  await supabase
    .from("brand_profiles")
    .update({ profile_status: "audited" })
    .eq("id", brand.id);

  console.log(`  ✓ ${brand.brand_name} seeded (score: ${score}/100)`);
  return { shopName, brandId: brand.id, score };
}

// ── Entry point ───────────────────────────────────────────────────────

async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error(`
Usage:
  node seed-depop-sellers.mjs sellers.json
  node seed-depop-sellers.mjs sellers.json --dry-run

Input file format (sellers.json):
[
  {
    "sellerUsername": "margot_vintage",
    "shopName": "Margot Vintage",
    "bio": "Curating slow fashion since 2019…",
    "listings": "1. Levi's 501 90s deadstock…\\n2. Y2K slip dress…"
  }
]
`);
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  let sellers;
  try {
    sellers = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(`❌ Invalid JSON in ${inputFile}: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(sellers) || sellers.length === 0) {
    console.error("❌ Input must be a non-empty JSON array of sellers");
    process.exit(1);
  }

  console.log(`\n🌱 ESINA Depop Seller Seeder`);
  if (DRY_RUN) console.log("   (DRY RUN — no DB writes)");
  console.log(`   ${sellers.length} seller(s) to process`);

  const results = [];
  for (let i = 0; i < sellers.length; i++) {
    try {
      const result = await seedSeller(sellers[i], i, sellers.length);
      results.push(result);
    } catch (err) {
      console.error(`\n  ❌ Failed: ${err.message}`);
      results.push({ shopName: sellers[i].shopName, error: err.message });
    }
  }

  // Summary
  console.log("\n" + "─".repeat(50));
  console.log("Summary:");
  results.forEach((r) => {
    if (r.error) {
      console.log(`  ✗ ${r.shopName} — ERROR: ${r.error}`);
    } else if (r.skipped) {
      console.log(`  ○ ${r.shopName} — dry run`);
    } else {
      const bar = "█".repeat(Math.round(r.score / 10)) + "░".repeat(10 - Math.round(r.score / 10));
      console.log(`  ✓ ${r.shopName} — ${r.score}/100 ${bar}`);
    }
  });

  const succeeded = results.filter((r) => r.brandId).length;
  console.log(`\n${succeeded}/${sellers.length} sellers seeded successfully.\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * test-liquid-death.mjs
 *
 * Self-contained test: deletes all old audits, runs a fresh audit
 * on Liquid Death ONLY, prints detailed debug output for every
 * dimension comparison to verify the scoring engine works.
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ══════════════════════════════════════════════════════════════════════
// STEP 1: DELETE ALL OLD AUDITS
// ══════════════════════════════════════════════════════════════════════

async function deleteAllAudits() {
  console.log("━━━ STEP 1: Deleting all old audits ━━━");

  // Count existing
  const { data: existing, error: countErr } = await supabase
    .from("perception_audits")
    .select("id", { count: "exact" });

  console.log(`  Found ${existing?.length ?? 0} existing audit rows`);

  if (existing && existing.length > 0) {
    // Delete each row by ID to guarantee deletion
    for (const row of existing) {
      const { error } = await supabase
        .from("perception_audits")
        .delete()
        .eq("id", row.id);
      if (error) console.log(`  Delete error for ${row.id}: ${error.message}`);
    }

    // Verify
    const { data: remaining } = await supabase
      .from("perception_audits")
      .select("id");
    console.log(`  After delete: ${remaining?.length ?? 0} rows remaining`);

    if (remaining && remaining.length > 0) {
      console.log("  ⚠️  Delete via API failed (RLS likely blocking).");
      console.log("  ⚠️  Please run this in Supabase SQL Editor:");
      console.log("      DELETE FROM perception_audits;");
      console.log("  Then re-run this script.");
      process.exit(1);
    }
  }

  console.log("  ✓ All audits deleted\n");
}

// ══════════════════════════════════════════════════════════════════════
// STEP 2: FETCH LIQUID DEATH
// ══════════════════════════════════════════════════════════════════════

async function fetchLiquidDeath() {
  console.log("━━━ STEP 2: Fetching Liquid Death profile ━━━");
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .ilike("brand_name", "%liquid death%")
    .single();

  if (error || !data) throw new Error(`Couldn't find Liquid Death: ${error?.message}`);

  console.log(`  Brand: ${data.brand_name}`);
  console.log(`  Category: ${data.category}`);
  console.log(`  Archetypes: ${JSON.stringify((data.archetypes || []).map(a => a.archetype || a))}`);
  console.log(`  Values: ${JSON.stringify(data.values)}`);
  console.log(`  Style Tags: ${JSON.stringify(data.style_tags)}`);
  console.log(`  Price Tier: ${data.price_tier}`);
  console.log(`  Voice Tone: ${data.voice_tone}`);
  console.log(`  Status Signal: ${data.status_signal_type}`);
  console.log(`  Communities: ${JSON.stringify(data.communities)}`);
  console.log("");
  return data;
}

// ══════════════════════════════════════════════════════════════════════
// STEP 3: RUN AI QUERIES
// ══════════════════════════════════════════════════════════════════════

function parseJSON(raw) {
  return JSON.parse(raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim());
}

async function queryAI(system, user) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", temperature: 0.3, max_tokens: 1500,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  return parseJSON(res.choices[0]?.message?.content || "{}");
}

async function runAIQueries(brand) {
  console.log("━━━ STEP 3: Running AI perception queries ━━━");

  const [q1, q2, q3] = await Promise.all([
    queryAI(
      "You are a brand analyst. Respond ONLY in valid JSON format with no additional text.",
      `Analyze the brand "${brand.brand_name}" in the "${brand.category}" category.\nBased on your knowledge, provide:\n{\n  "brand_known": true,\n  "perceived_archetypes": ["archetype1", "archetype2"],\n  "perceived_values": ["value1", "value2", "value3"],\n  "perceived_style_tags": ["style1", "style2"],\n  "perceived_price_tier": "budget|value|mid|premium|luxury",\n  "perceived_target_demographic": "description",\n  "perceived_communities": ["community1", "community2"],\n  "perceived_status_signal": "conspicuous|quiet_luxury|counterculture|accessible_premium|anti_status",\n  "perceived_voice_tone": "formal|casual|irreverent|authoritative|warm|edgy",\n  "perceived_strengths": ["strength1", "strength2"],\n  "perceived_weaknesses": ["weakness1", "weakness2"],\n  "one_sentence_description": "description"\n}`
    ),
    queryAI(
      "You are a brand analyst. Respond ONLY in valid JSON format.",
      `For the brand "${brand.brand_name}" in "${brand.category}", analyze competitive positioning:\n{\n  "direct_competitors": ["c1", "c2", "c3"],\n  "identity_differentiators": ["d1"],\n  "identity_overlaps": ["o1"],\n  "cultural_positioning": "description",\n  "trend_alignment": ["t1"],\n  "recommendation_likelihood": "high|medium|low"\n}`
    ),
    queryAI(
      "You are a shopping assistant. Respond ONLY in valid JSON format.",
      `A consumer asks: "I'm looking for a ${brand.category} brand that has values ${(brand.values || []).join(", ")}, style is ${(brand.style_tags || []).join(", ")}, voice is ${brand.voice_tone}. What would you recommend?"\n{\n  "brand_mentioned": true,\n  "mention_position": 1,\n  "brands_recommended_instead": ["b1", "b2"],\n  "why_recommended_or_not": "explanation",\n  "identity_accuracy": "description"\n}`
    ),
  ]);

  console.log(`  AI Archetypes: ${JSON.stringify(q1.perceived_archetypes)}`);
  console.log(`  AI Values: ${JSON.stringify(q1.perceived_values)}`);
  console.log(`  AI Style Tags: ${JSON.stringify(q1.perceived_style_tags)}`);
  console.log(`  AI Price Tier: ${q1.perceived_price_tier}`);
  console.log(`  AI Voice Tone: ${q1.perceived_voice_tone}`);
  console.log(`  AI Status Signal: ${q1.perceived_status_signal}`);
  console.log(`  AI Communities: ${JSON.stringify(q1.perceived_communities)}`);
  console.log(`  AI Rec Likelihood: ${q2.recommendation_likelihood}`);
  console.log(`  Brand Mentioned: ${q3.brand_mentioned}, Position: ${q3.mention_position}`);
  console.log(`  Brands Recommended: ${JSON.stringify(q3.brands_recommended_instead)}`);
  console.log("");

  return { q1, q2, q3 };
}

// ══════════════════════════════════════════════════════════════════════
// STEP 4: SCORING ENGINE (with full debug output)
// ══════════════════════════════════════════════════════════════════════

const SYNONYMS = {
  everyperson: ["everyman", "everyperson", "regular guy", "common man"],
  creator: ["creator", "artist", "maker"], rebel: ["rebel", "outlaw", "maverick", "disruptor"],
  jester: ["jester", "joker", "trickster", "comedian"], hero: ["hero", "warrior", "champion"],
  sage: ["sage", "scholar", "thinker", "mentor"], explorer: ["explorer", "adventurer", "seeker"],
  magician: ["magician", "visionary", "alchemist"], lover: ["lover", "romantic"],
  caregiver: ["caregiver", "nurturer", "protector", "guardian"],
  ruler: ["ruler", "leader", "boss", "king"], innocent: ["innocent", "optimist", "purist"],
  fitness: ["fitness", "gym", "workout", "exercise", "athletic"],
  wellness: ["wellness", "health", "wellbeing", "healthy", "holistic"],
  outdoor: ["outdoor", "outdoors", "adventure", "nature", "hiking"],
  streetwear: ["streetwear", "street", "urban"], yoga: ["yoga", "mindfulness"],
  tech: ["tech", "technology", "digital"], creative: ["creative", "creatives", "design"],
  sustainability_c: ["sustainability", "sustainable", "eco", "green", "environmental"],
  music: ["music", "musician", "audio"], gaming: ["gaming", "gamer", "esports"],
  fashion: ["fashion", "style", "apparel"], skate: ["skate", "skating", "skateboard"],
  art: ["art", "arts", "artistic", "gallery"], luxury: ["luxury", "luxe", "high-end"],
  irreverence: ["irreverence", "irreverent", "rebellious", "rebellion", "anti-establishment"],
  sustainability_v: ["sustainability", "sustainable", "eco-friendly", "eco", "environmental", "green"],
  transparency: ["transparency", "transparent", "honest", "honesty"],
  community: ["community", "belonging", "togetherness", "connection"],
  innovation: ["innovation", "innovative", "cutting-edge"],
  inclusivity: ["inclusivity", "inclusive", "diversity", "diverse"],
  craftsmanship: ["craftsmanship", "craft", "quality", "handmade", "artisanal"],
  heritage: ["heritage", "tradition", "traditional", "legacy"],
  minimalism: ["minimalism", "minimalist", "minimal", "simplicity", "simple"],
  boldness: ["boldness", "bold", "daring", "audacious", "fearless"],
  authenticity: ["authenticity", "authentic", "genuine", "real"],
  performance: ["performance", "perform", "athletic", "achievement"],
  creativity: ["creativity", "creative", "imagination"],
  independence: ["independence", "independent", "freedom"],
  rebellion: ["rebellion", "rebellious", "rebel", "counterculture"],
  minimalist_s: ["minimalist", "minimal", "clean", "simple"],
  maximalist: ["maximalist", "bold", "loud", "vibrant", "expressive"],
  industrial: ["industrial", "raw", "utilitarian"], vintage: ["vintage", "retro", "nostalgic"],
  athleisure: ["athleisure", "athletic", "sporty", "activewear"],
  organic: ["organic", "natural", "earthy"], classic: ["classic", "timeless", "traditional"],
  artisanal: ["artisanal", "handcrafted", "handmade", "craft"],
  counterculture: ["counterculture", "counter-culture", "anti-mainstream", "alternative"],
  quiet_luxury: ["quiet luxury", "quiet_luxury", "understated", "subtle luxury"],
  accessible_premium: ["accessible premium", "accessible_premium", "affordable luxury"],
  anti_status: ["anti-status", "anti_status", "anti status", "no logo"],
  conspicuous: ["conspicuous", "visible", "prominent", "flashy"],
  irreverent_voice: ["irreverent", "irreverence", "sarcastic", "witty", "humorous"],
  casual: ["casual", "relaxed", "laid-back", "friendly", "conversational"],
  edgy: ["edgy", "bold", "provocative", "aggressive", "raw"],
  warm: ["warm", "welcoming", "approachable", "nurturing"],
  authoritative: ["authoritative", "expert", "professional", "confident"],
  formal: ["formal", "professional", "polished", "sophisticated"],
};

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(phrase) {
  const stop = new Set(["the", "a", "an", "and", "or", "of", "for", "in", "to", "is", "are", "with", "that", "this", "on", "by", "as", "its"]);
  return normalize(phrase).split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
}

function findSynonymKey(val) {
  const n = normalize(val);
  const kws = extractKeywords(val);
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    for (const syn of syns) {
      const ns = normalize(syn);
      if (n === ns || n.includes(ns) || ns.includes(n)) return key;
    }
    for (const kw of kws) {
      for (const syn of syns) {
        const ns = normalize(syn);
        if (kw === ns || kw.includes(ns) || ns.includes(kw)) return key;
      }
    }
  }
  return null;
}

function fuzzyMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const keyA = findSynonymKey(a);
  const keyB = findSynonymKey(b);
  if (keyA && keyB && keyA === keyB) return true;
  const kwA = extractKeywords(a);
  const kwB = extractKeywords(b);
  for (const ka of kwA) for (const kb of kwB) if (ka === kb || ka.includes(kb) || kb.includes(ka)) return true;
  return false;
}

function overlapScoreDebug(label, a, b) {
  if (!a.length || !b.length) {
    console.log(`    ${label}: self=[] or ai=[] → 0 matches`);
    return 0;
  }
  let matches = 0;
  const usedB = new Set();
  for (const itemA of a) {
    let found = false;
    for (let i = 0; i < b.length; i++) {
      if (usedB.has(i)) continue;
      const isMatch = fuzzyMatch(itemA, b[i]);
      if (isMatch) {
        console.log(`    ${label}: "${itemA}" ↔ "${b[i]}" → ✓ MATCH`);
        matches++;
        usedB.add(i);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`    ${label}: "${itemA}" → ✗ no match in [${b.join(", ")}]`);
    }
  }
  const score = matches / a.length;
  console.log(`    ${label}: ${matches}/${a.length} matched → overlap=${score.toFixed(2)}`);
  return score;
}

function flexMatchDebug(label, a, b) {
  if (!a || !b) {
    console.log(`    ${label}: "${a}" vs "${b}" → null → ✗`);
    return false;
  }
  const result = fuzzyMatch(a, b);
  console.log(`    ${label}: "${a}" vs "${b}" → ${result ? "✓ MATCH" : "✗ no match"}`);
  return result;
}

function safeStringify(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map(v => typeof v === "string" ? v : v?.brand || v?.name || v?.text || JSON.stringify(v)).join(", ");
  if (typeof val === "object") return val.brand || val.name || JSON.stringify(val);
  return String(val);
}

function calculateGapDebug(brand, q1, q2, q3) {
  console.log("━━━ STEP 4: Scoring (with debug) ━━━\n");
  const dims = [];
  let totalScore = 0;

  // 1. ARCHETYPES (15)
  console.log("  [1] ARCHETYPES (max 15):");
  const selfArch = (brand.archetypes || []).map(a => a.archetype || a);
  const aiArch = q1.perceived_archetypes || [];
  console.log(`    Self: [${selfArch.join(", ")}]`);
  console.log(`    AI:   [${aiArch.join(", ")}]`);
  const archOv = overlapScoreDebug("Arch", selfArch, aiArch);
  const archPts = Math.round(archOv * 15);
  console.log(`    → ${archPts}/15 points\n`);
  totalScore += archPts;
  dims.push({ dimension: "Archetypes", maxPoints: 15, earnedPoints: archPts,
    status: archPts >= 10 ? "aligned" : archPts > 0 ? "gap" : "missing",
    selfReported: selfArch.join(", ") || "Not set",
    aiPerceived: aiArch.join(", ") || "Unknown",
    detail: archPts >= 10 ? "AI closely matches self-reported archetypes." : archPts > 0 ? "Partial archetype overlap." : "AI doesn't see claimed archetypes." });

  // 2. VALUES (15)
  console.log("  [2] VALUES (max 15):");
  const selfVals = brand.values || [];
  const aiVals = q1.perceived_values || [];
  console.log(`    Self: [${selfVals.join(", ")}]`);
  console.log(`    AI:   [${aiVals.join(", ")}]`);
  const valOv = overlapScoreDebug("Vals", selfVals, aiVals);
  const valPts = Math.round(valOv * 15);
  console.log(`    → ${valPts}/15 points\n`);
  totalScore += valPts;
  dims.push({ dimension: "Values", maxPoints: 15, earnedPoints: valPts,
    status: valPts >= 10 ? "aligned" : valPts > 0 ? "gap" : "missing",
    selfReported: selfVals.join(", ") || "Not set",
    aiPerceived: aiVals.join(", ") || "Unknown",
    detail: valPts >= 10 ? "Core values well-represented." : valPts > 0 ? "Some values come through." : "Values not recognized." });

  // 3. STYLE (10)
  console.log("  [3] STYLE & AESTHETIC (max 10):");
  const selfStyle = brand.style_tags || [];
  const aiStyle = q1.perceived_style_tags || [];
  console.log(`    Self: [${selfStyle.join(", ")}]`);
  console.log(`    AI:   [${aiStyle.join(", ")}]`);
  const styleOv = overlapScoreDebug("Style", selfStyle, aiStyle);
  const stylePts = Math.round(styleOv * 10);
  console.log(`    → ${stylePts}/10 points\n`);
  totalScore += stylePts;
  dims.push({ dimension: "Style & Aesthetic", maxPoints: 10, earnedPoints: stylePts,
    status: stylePts >= 7 ? "aligned" : stylePts > 0 ? "gap" : "missing",
    selfReported: selfStyle.join(", ") || "Not set",
    aiPerceived: aiStyle.join(", ") || "Unknown",
    detail: stylePts >= 7 ? "Aesthetic clearly perceived." : stylePts > 0 ? "Partial style recognition." : "Style differs significantly." });

  // 4. PRICE (10)
  console.log("  [4] PRICE TIER (max 10):");
  const priceOk = flexMatchDebug("Price", brand.price_tier, q1.perceived_price_tier);
  const pricePts = priceOk ? 10 : 0;
  console.log(`    → ${pricePts}/10 points\n`);
  totalScore += pricePts;
  dims.push({ dimension: "Price Tier", maxPoints: 10, earnedPoints: pricePts,
    status: priceOk ? "aligned" : "gap",
    selfReported: brand.price_tier || "Not set",
    aiPerceived: q1.perceived_price_tier || "Unknown",
    detail: priceOk ? "Price accurately perceived." : `Self: "${brand.price_tier}", AI: "${q1.perceived_price_tier}".` });

  // 5. COMMUNITIES (10)
  console.log("  [5] COMMUNITIES (max 10):");
  const selfComm = brand.communities || [];
  const aiComm = q1.perceived_communities || [];
  console.log(`    Self: [${selfComm.join(", ")}]`);
  console.log(`    AI:   [${aiComm.join(", ")}]`);
  const commOv = overlapScoreDebug("Comm", selfComm, aiComm);
  const commPts = Math.round(commOv * 10);
  console.log(`    → ${commPts}/10 points\n`);
  totalScore += commPts;
  dims.push({ dimension: "Communities", maxPoints: 10, earnedPoints: commPts,
    status: commPts >= 7 ? "aligned" : commPts > 0 ? "gap" : "missing",
    selfReported: selfComm.join(", ") || "Not set",
    aiPerceived: aiComm.join(", ") || "Unknown",
    detail: commPts >= 7 ? "Community ties well-recognized." : commPts > 0 ? "Some communities visible." : "Different communities perceived." });

  // 6. STATUS SIGNAL (10)
  console.log("  [6] STATUS SIGNAL (max 10):");
  const statusOk = flexMatchDebug("Status", brand.status_signal_type, q1.perceived_status_signal);
  const statusPts = statusOk ? 10 : 0;
  console.log(`    → ${statusPts}/10 points\n`);
  totalScore += statusPts;
  dims.push({ dimension: "Status Signal", maxPoints: 10, earnedPoints: statusPts,
    status: statusOk ? "aligned" : "gap",
    selfReported: brand.status_signal_type || "Not set",
    aiPerceived: q1.perceived_status_signal || "Unknown",
    detail: statusOk ? "Status positioning matches." : `Self: "${brand.status_signal_type}", AI: "${q1.perceived_status_signal}".` });

  // 7. VOICE / TONE (10)
  console.log("  [7] VOICE & TONE (max 10):");
  const voiceOk = flexMatchDebug("Voice", brand.voice_tone, q1.perceived_voice_tone);
  const voicePts = voiceOk ? 10 : 0;
  console.log(`    → ${voicePts}/10 points\n`);
  totalScore += voicePts;
  dims.push({ dimension: "Voice & Tone", maxPoints: 10, earnedPoints: voicePts,
    status: voiceOk ? "aligned" : "gap",
    selfReported: brand.voice_tone || "Not set",
    aiPerceived: q1.perceived_voice_tone || "Unknown",
    detail: voiceOk ? "Brand voice perceived as intended." : `Self: "${brand.voice_tone}", AI: "${q1.perceived_voice_tone}".` });

  // 8. CONSUMER DISCOVERY (10)
  console.log("  [8] CONSUMER DISCOVERY (max 10):");
  const bn = normalize(brand.brand_name);
  let mentioned = q3.brand_mentioned === true && q3.mention_position;
  let mentionPos = q3.mention_position || 99;
  console.log(`    Brand name normalized: "${bn}"`);
  console.log(`    AI brand_mentioned: ${q3.brand_mentioned}, position: ${q3.mention_position}`);
  console.log(`    brands_recommended_instead: ${JSON.stringify(q3.brands_recommended_instead)}`);

  // Check recommended list
  const recList = q3.brands_recommended_instead || [];
  if (!mentioned) {
    for (let i = 0; i < recList.length; i++) {
      const item = typeof recList[i] === "string" ? recList[i] : safeStringify(recList[i]);
      const ni = normalize(item);
      console.log(`    Checking rec[${i}]: "${item}" → normalized: "${ni}" includes "${bn}"? ${ni.includes(bn)}`);
      if (ni.includes(bn) || bn.includes(ni)) {
        mentioned = true;
        mentionPos = i + 1;
        console.log(`    → Found brand at position ${mentionPos}!`);
        break;
      }
    }
  }
  // Check why text
  if (!mentioned) {
    const whyNorm = normalize(q3.why_recommended_or_not || "");
    if (whyNorm.includes(bn)) { mentioned = true; mentionPos = 3; console.log(`    → Found in why_recommended text`); }
  }

  const demoPts = mentioned ? (mentionPos <= 2 ? 10 : mentionPos <= 4 ? 6 : 3) : 0;
  const recBrandsStr = safeStringify(recList.slice(0, 3));
  console.log(`    Mentioned: ${mentioned}, Position: ${mentionPos}, Points: ${demoPts}`);
  console.log(`    → ${demoPts}/10 points\n`);
  totalScore += demoPts;
  dims.push({ dimension: "Consumer Discovery", maxPoints: 10, earnedPoints: demoPts,
    status: demoPts >= 7 ? "aligned" : demoPts > 0 ? "gap" : "missing",
    selfReported: "Should appear when consumers search its identity",
    aiPerceived: mentioned ? `Mentioned at position ${mentionPos}` : `Not mentioned — AI recommended: ${recBrandsStr}`,
    detail: mentioned ? (demoPts >= 7 ? "Top recommendation." : "Appears but not top.") : "AI doesn't recommend this brand — critical gap." });

  // 9. COMPETITIVE DIFFERENTIATION (10)
  console.log("  [9] COMPETITIVE DIFFERENTIATION (max 10):");
  const recLike = normalize(q2.recommendation_likelihood || "");
  const diffPts = recLike === "high" ? 10 : recLike === "medium" ? 5 : 0;
  console.log(`    Recommendation likelihood: "${q2.recommendation_likelihood}" → normalized: "${recLike}"`);
  console.log(`    → ${diffPts}/10 points\n`);
  totalScore += diffPts;
  dims.push({ dimension: "Competitive Differentiation", maxPoints: 10, earnedPoints: diffPts,
    status: diffPts >= 7 ? "aligned" : diffPts > 0 ? "gap" : "missing",
    selfReported: brand.differentiation_claim || "Not set",
    aiPerceived: `Likelihood: ${q2.recommendation_likelihood}. Differentiators: ${(q2.identity_differentiators || []).slice(0, 2).join("; ")}`,
    detail: diffPts >= 7 ? "Unique positioning clearly recognized." : diffPts > 0 ? "Some recognition." : "Not strongly differentiated." });

  console.log("═══════════════════════════════════════════════");
  console.log(`  TOTAL ALIGNMENT SCORE: ${totalScore}/100`);
  console.log("═══════════════════════════════════════════════\n");

  const aligned = dims.filter(d => d.status === "aligned").map(d => d.dimension);
  const gaps = dims.filter(d => d.status === "gap").map(d => d.dimension);
  const missing = dims.filter(d => d.status === "missing").map(d => d.dimension);

  const recs = [];
  for (const d of dims) {
    if (d.status === "missing") recs.push(`Critical: "${d.dimension}" invisible to AI.`);
    else if (d.status === "gap") recs.push(`Improve: "${d.dimension}".`);
  }

  return { score: totalScore, dims, aligned, gaps, missing, recs, oneSentence: q1.one_sentence_description || "" };
}

// ══════════════════════════════════════════════════════════════════════
// STEP 5: STORE AND REPORT
// ══════════════════════════════════════════════════════════════════════

async function storeAudit(brandId, q1, q2, q3, gap) {
  console.log("━━━ STEP 5: Storing audit result ━━━");

  const { error } = await supabase.from("perception_audits").insert({
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
    identity_alignment_score: gap.score,
    aligned_dimensions: gap.aligned,
    gap_dimensions: gap.gaps,
    gap_details: {
      dimensions: gap.dims.map(d => ({
        dimension: d.dimension, maxPoints: d.maxPoints,
        earnedPoints: d.earnedPoints, status: d.status,
        selfReported: d.selfReported, aiPerceived: d.aiPerceived,
        detail: d.detail,
      })),
      missingDimensions: gap.missing,
      oneSentenceDescription: gap.oneSentence,
      competitiveData: q2,
      consumerSimData: q3,
    },
    recommendations: gap.recs,
  });

  if (error) {
    console.log(`  ✗ Store error: ${error.message}`);
    return false;
  }
  console.log("  ✓ Audit stored successfully\n");
  return true;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

async function main() {
  try {
    await deleteAllAudits();
    const brand = await fetchLiquidDeath();
    const { q1, q2, q3 } = await runAIQueries(brand);
    const gap = calculateGapDebug(brand, q1, q2, q3);
    await storeAudit(brand.id, q1, q2, q3, gap);

    console.log("━━━ DONE ━━━");
    console.log(`Liquid Death Alignment Score: ${gap.score}/100`);
    console.log(`View report at: http://localhost:3000/audit/${brand.id}`);
  } catch (err) {
    console.error("Fatal:", err);
    process.exit(1);
  }
}

main();

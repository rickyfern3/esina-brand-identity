#!/usr/bin/env node
/**
 * run-all-audits.mjs — v2 (Two-Tier Scoring)
 *
 * Runs the AI Perception Audit on every brand in brand_profiles.
 * Queries gpt-4o-mini for three perception analyses per brand,
 * calculates gap scores with two-tier matching, and stores results.
 *
 * Usage:
 *   node run-all-audits.mjs
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY; //

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ── AI Helpers ───────────────────────────────────────────────────────

function parseJSON(raw) {
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function queryAI(system, user) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 1500,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return parseJSON(res.choices[0]?.message?.content || "{}");
}

// ── Three Audit Queries ──────────────────────────────────────────────

async function queryGeneral(brandName, category) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format with no additional text.",
    `Analyze the brand "${brandName}" in the "${category}" category.
Based on your knowledge, provide a structured assessment:
{
  "brand_known": true,
  "perceived_archetypes": ["archetype1", "archetype2"],
  "perceived_values": ["value1", "value2", "value3"],
  "perceived_style_tags": ["style1", "style2"],
  "perceived_price_tier": "budget|value|mid|premium|luxury",
  "perceived_target_demographic": "description",
  "perceived_communities": ["community1", "community2"],
  "perceived_status_signal": "conspicuous|quiet_luxury|counterculture|accessible_premium|anti_status",
  "perceived_voice_tone": "formal|casual|irreverent|authoritative|warm|edgy",
  "perceived_strengths": ["strength1", "strength2"],
  "perceived_weaknesses": ["weakness1", "weakness2"],
  "one_sentence_description": "How would you describe this brand to someone who's never heard of it?"
}`
  );
}

async function queryCompetitive(brandName, category) {
  return queryAI(
    "You are a brand analyst. Respond ONLY in valid JSON format.",
    `For the brand "${brandName}" in "${category}", analyze its competitive positioning:
{
  "direct_competitors": ["competitor1", "competitor2", "competitor3"],
  "identity_differentiators": ["what makes this brand's identity unique"],
  "identity_overlaps": ["where this brand's identity overlaps with competitors"],
  "cultural_positioning": "where does this brand sit in culture right now",
  "trend_alignment": ["trends this brand aligns with"],
  "recommendation_likelihood": "high|medium|low"
}`
  );
}

async function queryConsumerSim(brandName, category, identityDesc) {
  return queryAI(
    "You are a shopping assistant helping a consumer. Respond ONLY in valid JSON format.",
    `A consumer asks: "I'm looking for a ${category} brand that is ${identityDesc}. What would you recommend?"
{
  "brand_mentioned": true,
  "mention_position": 1,
  "brands_recommended_instead": ["brand1", "brand2"],
  "why_recommended_or_not": "explanation",
  "identity_accuracy": "description"
}`
  );
}

// ── Two-Tier Scoring Engine ─────────────────────────────────────────

const SYNONYMS = {
  // Archetypes
  everyperson: ["everyman", "everyperson", "regular guy", "regular gal", "common man"],
  creator: ["creator", "artist", "maker"],
  rebel: ["rebel", "outlaw", "maverick", "disruptor"],
  jester: ["jester", "joker", "trickster", "comedian"],
  hero: ["hero", "warrior", "champion"],
  sage: ["sage", "scholar", "thinker", "mentor"],
  explorer: ["explorer", "adventurer", "seeker", "wanderer"],
  magician: ["magician", "visionary", "alchemist"],
  lover: ["lover", "romantic", "sensualist"],
  caregiver: ["caregiver", "nurturer", "protector", "guardian"],
  ruler: ["ruler", "leader", "boss", "king"],
  innocent: ["innocent", "optimist", "purist", "dreamer"],
  // Communities
  fitness: ["fitness", "gym", "workout", "exercise", "athletic", "fitness community"],
  wellness: ["wellness", "health", "wellbeing", "well-being", "healthy", "holistic", "health enthusiasts", "skincare advocates"],
  outdoor: ["outdoor", "outdoors", "adventure", "nature", "hiking"],
  streetwear: ["streetwear", "street", "urban"],
  yoga: ["yoga", "mindfulness", "meditation"],
  tech: ["tech", "technology", "digital"],
  creative: ["creative", "creatives", "design", "artistic", "online influencers", "social media influencers"],
  sustainability_c: ["sustainability", "sustainable", "eco", "green", "environmental"],
  music: ["music", "musician", "audio", "music festival goers"],
  gaming: ["gaming", "gamer", "esports"],
  fashion: ["fashion", "style", "apparel", "beauty enthusiasts"],
  skate: ["skate", "skating", "skateboard", "skateboarding"],
  art: ["art", "arts", "artistic", "gallery"],
  luxury: ["luxury", "luxe", "high-end", "premium"],
  // Values
  irreverence: ["irreverence", "irreverent", "rebellious", "rebellion", "anti-establishment", "humor"],
  sustainability_v: ["sustainability", "sustainable", "eco-friendly", "eco", "environmental", "green"],
  transparency: ["transparency", "transparent", "honest", "honesty", "openness"],
  community_val: ["community", "belonging", "togetherness", "connection", "community engagement"],
  innovation: ["innovation", "innovative", "cutting-edge", "forward-thinking"],
  inclusivity: ["inclusivity", "inclusive", "diversity", "diverse"],
  craftsmanship: ["craftsmanship", "craft", "quality", "handmade", "artisanal"],
  heritage: ["heritage", "tradition", "traditional", "legacy", "history"],
  minimalism: ["minimalism", "minimalist", "minimal", "simplicity", "simple"],
  boldness: ["boldness", "bold", "daring", "audacious", "fearless"],
  authenticity: ["authenticity", "authentic", "genuine", "real"],
  performance_val: ["performance", "perform", "athletic", "achievement"],
  creativity: ["creativity", "creative", "imagination", "imaginative"],
  wellness_val: ["wellness", "wellbeing", "health", "healthy"],
  independence: ["independence", "independent", "self-reliant", "freedom", "individuality"],
  rebellion: ["rebellion", "rebellious", "rebel", "counter-culture", "counterculture"],
  empowerment: ["empowerment", "empowering", "fitness empowerment"],
  // Style tags
  minimalist_style: ["minimalist", "minimal", "clean", "simple"],
  maximalist: ["maximalist", "loud", "vibrant", "expressive"],
  industrial: ["industrial", "raw", "utilitarian", "functional"],
  vintage: ["vintage", "retro", "nostalgic", "throwback"],
  streetwear_style: ["streetwear", "street", "urban", "hip-hop"],
  athleisure: ["athleisure", "athletic", "sporty", "activewear"],
  organic: ["organic", "natural", "earth", "earthy"],
  classic: ["classic", "timeless", "traditional"],
  elevated_basics: ["elevated basics", "elevated_basics", "elevated", "basics", "essentials"],
  artisanal_style: ["artisanal", "handcrafted", "handmade", "craft"],
  edgy_style: ["edgy", "provocative", "aggressive"],
  bold_style: ["bold", "daring", "statement"],
  modern: ["modern", "contemporary", "current"],
  // Status signals
  counterculture: ["counterculture", "counter-culture", "counter culture", "anti-mainstream", "alternative"],
  quiet_luxury: ["quiet luxury", "quiet_luxury", "understated", "subtle luxury", "iykyk"],
  accessible_premium: ["accessible premium", "accessible_premium", "affordable luxury", "attainable"],
  anti_status: ["anti-status", "anti_status", "anti status", "no logo"],
  conspicuous: ["conspicuous", "visible", "prominent", "logo-heavy", "flashy"],
  // Voice / Tone
  irreverent_voice: ["irreverent", "irreverence", "sarcastic", "witty", "tongue-in-cheek", "humorous"],
  casual: ["casual", "relaxed", "laid-back", "friendly", "conversational"],
  edgy_voice: ["edgy", "bold", "provocative", "aggressive", "raw"],
  warm: ["warm", "welcoming", "approachable", "nurturing", "caring"],
  authoritative: ["authoritative", "expert", "professional", "confident"],
  formal: ["formal", "professional", "polished", "sophisticated"],
};

const SEMANTIC_PAIRS = [
  // Style & Aesthetic
  ["bold", "maximalist"],
  ["edgy", "raw"],
  ["edgy", "avant-garde"], ["edgy", "avant garde"], ["edgy", "avant_garde"],
  ["modern", "futuristic"],
  ["modern", "minimalist"],
  ["classic", "heritage"],
  ["classic", "vintage"],
  ["clean", "minimalist"],
  ["performance", "athleisure"],
  ["performance wear", "athleisure"],
  ["streetwear", "urban"],
  ["raw", "industrial"],
  ["bold", "edgy"],
  // Values
  ["health", "wellness"],
  ["fitness", "performance"],
  ["individuality", "independence"],
  ["humor", "irreverence"],
  ["transparency", "authenticity"],
  ["empowerment", "independence"],
  ["community engagement", "community"],
  ["self-expression", "creativity"],
  ["quality", "craftsmanship"],
  // Communities
  ["health enthusiasts", "fitness"],
  ["beauty enthusiasts", "wellness"],
  ["alternative lifestyle communities", "outdoor"],
  ["alternative lifestyle communities", "wellness"],
  ["skincare advocates", "fashion"],
  ["social media influencers", "fashion"],
  ["online influencers", "fashion"],
  // Cross-domain
  ["athletic", "performance"],
  ["sporty", "athletic"],
  ["natural", "organic"],
  ["handmade", "artisanal"],
];

function toStr(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.archetype || v.name || v.brand || v.text || v.value || JSON.stringify(v);
  return String(v);
}

function normalize(s) {
  const str = toStr(s);
  return str.toLowerCase().replace(/^(the|a|an)\s+/i, "").replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
}

function extractKeywords(phrase) {
  const stop = new Set(["the", "a", "an", "and", "or", "of", "for", "in", "to", "is", "are", "with", "that", "this", "on", "by", "as", "its"]);
  return normalize(phrase).split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
}

function findSynonymKey(val) {
  const n = normalize(val);
  const keywords = extractKeywords(val);
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    for (const syn of synonyms) {
      const ns = normalize(syn);
      if (n === ns || n.includes(ns) || ns.includes(n)) return key;
    }
    for (const kw of keywords) {
      for (const syn of synonyms) {
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
  for (const ka of kwA) { for (const kb of kwB) { if (ka === kb || ka.includes(kb) || kb.includes(ka)) return true; } }
  return false;
}

function semanticMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  const kwA = extractKeywords(a);
  const kwB = extractKeywords(b);

  for (const [pairA, pairB] of SEMANTIC_PAIRS) {
    const npa = normalize(pairA);
    const npb = normalize(pairB);

    if ((na === npa || na.includes(npa) || npa.includes(na)) &&
        (nb === npb || nb.includes(npb) || npb.includes(nb))) return true;
    if ((na === npb || na.includes(npb) || npb.includes(na)) &&
        (nb === npa || nb.includes(npa) || npa.includes(nb))) return true;

    for (const ka of kwA) {
      for (const kb of kwB) {
        if ((ka === npa || ka.includes(npa) || npa.includes(ka)) &&
            (kb === npb || kb.includes(npb) || npb.includes(kb))) return true;
        if ((ka === npb || ka.includes(npb) || npb.includes(ka)) &&
            (kb === npa || kb.includes(npa) || npa.includes(kb))) return true;
      }
    }
  }
  return false;
}

function matchScore(a, b) {
  if (fuzzyMatch(a, b)) return 1;
  if (semanticMatch(a, b)) return 0.5;
  return 0;
}

function overlapScore(a, b) {
  const aStr = (a || []).map(toStr).filter(Boolean);
  const bStr = (b || []).map(toStr).filter(Boolean);
  if (!aStr.length || !bStr.length) return 0;
  let totalScore = 0;
  const usedB = new Set();
  for (const itemA of aStr) {
    let bestScore = 0;
    let bestIdx = -1;
    for (let i = 0; i < bStr.length; i++) {
      if (usedB.has(i)) continue;
      const s = matchScore(itemA, bStr[i]);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
      if (s === 1) break;
    }
    if (bestIdx >= 0 && bestScore > 0) {
      totalScore += bestScore;
      usedB.add(bestIdx);
    }
  }
  return totalScore / aStr.length;
}

function flexMatch(a, b) {
  if (!a || !b) return 0;
  return matchScore(a, b);
}

function safeStringify(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.map((v) => typeof v === "string" ? v : v?.brand || v?.name || v?.text || JSON.stringify(v)).join(", ");
  if (typeof val === "object") return val.brand || val.name || JSON.stringify(val);
  return String(val);
}

function checkBrandMentioned(brandName, p) {
  const bn = normalize(brandName);
  if (p.brand_mentioned === true && p.mention_position) return { mentioned: true, position: p.mention_position };
  const recList = p.brands_recommended_instead || [];
  for (let i = 0; i < recList.length; i++) {
    const itemStr = normalize(typeof recList[i] === "string" ? recList[i] : safeStringify(recList[i]));
    if (itemStr.includes(bn) || bn.includes(itemStr)) return { mentioned: true, position: i + 1 };
  }
  const whyText = normalize(p.why_recommended_or_not || "");
  if (whyText.includes(bn)) return { mentioned: true, position: 3 };
  const accText = normalize(p.identity_accuracy || "");
  if (accText.includes(bn)) return { mentioned: true, position: 3 };
  return { mentioned: p.brand_mentioned ?? false, position: p.mention_position || null };
}

function calculateGap(brand, p) {
  const dims = [];

  // 1. Archetypes (15) — two-tier
  const selfArch = (brand.archetypes || []).map((a) => toStr(a.archetype || a));
  const archOv = overlapScore(selfArch, p.perceived_archetypes || []);
  const archPts = Math.round(archOv * 15);
  dims.push({ dimension: "Archetypes", max: 15, earned: archPts,
    status: archPts >= 10 ? "aligned" : archPts > 0 ? "gap" : "missing",
    selfReported: selfArch.join(", ") || "Not set",
    aiPerceived: (p.perceived_archetypes || []).join(", ") || "Unknown",
    detail: archPts >= 10 ? "AI closely matches self-reported archetypes." : archPts > 0 ? "Partial archetype overlap." : "AI doesn't see claimed archetypes." });

  // 2. Values (15) — two-tier
  const valOv = overlapScore(brand.values || [], p.perceived_values || []);
  const valPts = Math.round(valOv * 15);
  dims.push({ dimension: "Values", max: 15, earned: valPts,
    status: valPts >= 10 ? "aligned" : valPts > 0 ? "gap" : "missing",
    selfReported: (brand.values || []).join(", ") || "Not set",
    aiPerceived: (p.perceived_values || []).join(", ") || "Unknown",
    detail: valPts >= 10 ? "Core values well-represented." : valPts > 0 ? "Some values come through." : "Values not recognized." });

  // 3. Style (10) — two-tier
  const styleOv = overlapScore(brand.style_tags || [], p.perceived_style_tags || []);
  const stylePts = Math.round(styleOv * 10);
  dims.push({ dimension: "Style & Aesthetic", max: 10, earned: stylePts,
    status: stylePts >= 7 ? "aligned" : stylePts > 0 ? "gap" : "missing",
    selfReported: (brand.style_tags || []).join(", ") || "Not set",
    aiPerceived: (p.perceived_style_tags || []).join(", ") || "Unknown",
    detail: stylePts >= 7 ? "Aesthetic clearly perceived." : stylePts > 0 ? "Partial style recognition." : "Style differs significantly." });

  // 4. Price (10) — two-tier
  const priceScore = flexMatch(brand.price_tier, p.perceived_price_tier);
  const pricePts = Math.round(priceScore * 10);
  dims.push({ dimension: "Price Tier", max: 10, earned: pricePts,
    status: pricePts >= 7 ? "aligned" : pricePts > 0 ? "gap" : "missing",
    selfReported: brand.price_tier || "Not set",
    aiPerceived: p.perceived_price_tier || "Unknown",
    detail: pricePts >= 7 ? "Price accurately perceived." : pricePts > 0 ? "Price partially recognized." : `Self: "${brand.price_tier}", AI: "${p.perceived_price_tier}".` });

  // 5. Communities (10) — two-tier
  const commOv = overlapScore(brand.communities || [], p.perceived_communities || []);
  const commPts = Math.round(commOv * 10);
  dims.push({ dimension: "Communities", max: 10, earned: commPts,
    status: commPts >= 7 ? "aligned" : commPts > 0 ? "gap" : "missing",
    selfReported: (brand.communities || []).join(", ") || "Not set",
    aiPerceived: (p.perceived_communities || []).join(", ") || "Unknown",
    detail: commPts >= 7 ? "Community ties well-recognized." : commPts > 0 ? "Some communities visible." : "Different communities perceived." });

  // 6. Status Signal (10) — two-tier
  const statusScore = flexMatch(brand.status_signal_type, p.perceived_status_signal);
  const statusPts = Math.round(statusScore * 10);
  dims.push({ dimension: "Status Signal", max: 10, earned: statusPts,
    status: statusPts >= 7 ? "aligned" : statusPts > 0 ? "gap" : "missing",
    selfReported: brand.status_signal_type || "Not set",
    aiPerceived: p.perceived_status_signal || "Unknown",
    detail: statusPts >= 7 ? "Status positioning matches." : statusPts > 0 ? "Status partially recognized." : `Self: "${brand.status_signal_type}", AI: "${p.perceived_status_signal}".` });

  // 7. Voice / Tone (10) — two-tier
  const voiceScore = flexMatch(brand.voice_tone, p.perceived_voice_tone);
  const voicePts = Math.round(voiceScore * 10);
  dims.push({ dimension: "Voice & Tone", max: 10, earned: voicePts,
    status: voicePts >= 7 ? "aligned" : voicePts > 0 ? "gap" : "missing",
    selfReported: brand.voice_tone || "Not set",
    aiPerceived: p.perceived_voice_tone || "Unknown",
    detail: voicePts >= 7 ? "Brand voice perceived as intended." : voicePts > 0 ? "Voice partially recognized." : `Self: "${brand.voice_tone}", AI: "${p.perceived_voice_tone}".` });

  // 8. Consumer Discovery (10)
  const brandMention = checkBrandMentioned(brand.brand_name, p);
  const mentioned = brandMention.mentioned;
  const pos = brandMention.position || 99;
  const demoPts = mentioned ? (pos <= 2 ? 10 : pos <= 4 ? 6 : 3) : 0;
  const recBrandsStr = safeStringify((p.brands_recommended_instead || []).slice(0, 3));
  dims.push({ dimension: "Consumer Discovery", max: 10, earned: demoPts,
    status: demoPts >= 7 ? "aligned" : demoPts > 0 ? "gap" : "missing",
    selfReported: "Should appear when consumers search its identity",
    aiPerceived: mentioned ? `Mentioned at position ${pos}` : `Not mentioned. AI recommended: ${recBrandsStr}`,
    detail: mentioned ? (demoPts >= 7 ? "Top recommendation." : "Appears but not top.") : "AI doesn't recommend this brand for its own identity — critical gap." });

  // 9. Competitive Differentiation (10)
  const rec = normalize(p.recommendation_likelihood || "");
  const diffPts = rec === "high" ? 10 : rec === "medium" ? 5 : 0;
  dims.push({ dimension: "Competitive Differentiation", max: 10, earned: diffPts,
    status: diffPts >= 7 ? "aligned" : diffPts > 0 ? "gap" : "missing",
    selfReported: brand.differentiation_claim || "Not set",
    aiPerceived: `Recommendation likelihood: ${p.recommendation_likelihood}`,
    detail: diffPts >= 7 ? "Unique positioning clearly recognized." : diffPts > 0 ? "Some recognition." : "Not strongly differentiated." });

  const score = dims.reduce((s, d) => s + d.earned, 0);
  const aligned = dims.filter((d) => d.status === "aligned").map((d) => d.dimension);
  const gaps = dims.filter((d) => d.status === "gap").map((d) => d.dimension);
  const missing = dims.filter((d) => d.status === "missing").map((d) => d.dimension);

  const recs = [];
  for (const d of dims) {
    if (d.status === "missing") recs.push(`Critical: "${d.dimension}" is invisible to AI.`);
    else if (d.status === "gap") recs.push(`Improve: "${d.dimension}" — self: ${d.selfReported}, AI: ${d.aiPerceived}.`);
  }
  if (!mentioned) recs.push("Critical: AI doesn't recommend you when consumers describe your identity.");

  return { score, dims, aligned, gaps, missing, recs: recs.slice(0, 5), oneSentence: p.one_sentence_description || "" };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\n━━━ ESINA AI Perception Audit v2 (Two-Tier Scoring) ━━━\n");

  // Clear old audits so we get fresh results
  const { error: delErr } = await supabase
    .from("perception_audits")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows
  if (delErr) console.log(`Warning: couldn't clear old audits: ${delErr.message}`);
  else console.log("Cleared old audit data.\n");

  const { data: brands, error } = await supabase
    .from("brand_profiles")
    .select("*");

  if (error) throw new Error(`Fetch error: ${error.message}`);
  console.log(`Found ${brands.length} brands to audit.\n`);

  for (const brand of brands) {
    process.stdout.write(`Auditing "${brand.brand_name}" … `);

    try {
      // Build identity description for Q3
      const idSnippet = [
        brand.values?.length ? `values ${brand.values.join(", ")}` : "",
        brand.style_tags?.length ? `style is ${brand.style_tags.join(", ")}` : "",
        brand.voice_tone ? `voice is ${brand.voice_tone}` : "",
      ].filter(Boolean).join(", ");
      const idDesc = idSnippet || (brand.identity_text || "").split(".").slice(0, 2).join(".").trim();

      // Run 3 queries in parallel
      const [q1, q2, q3] = await Promise.all([
        queryGeneral(brand.brand_name, brand.category),
        queryCompetitive(brand.brand_name, brand.category),
        queryConsumerSim(brand.brand_name, brand.category, idDesc),
      ]);

      // Merge perception
      const p = { ...q1, ...q2, ...q3 };

      // Gap analysis
      const gap = calculateGap(brand, p);

      // Store
      const { error: insertErr } = await supabase.from("perception_audits").insert({
        brand_profile_id: brand.id,
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
          dimensions: gap.dims.map((d) => ({
            dimension: d.dimension,
            maxPoints: d.max,
            earnedPoints: d.earned,
            status: d.status,
            selfReported: d.selfReported,
            aiPerceived: d.aiPerceived,
            detail: d.detail,
          })),
          missingDimensions: gap.missing,
          oneSentenceDescription: gap.oneSentence,
          competitiveData: q2,
          consumerSimData: q3,
        },
        recommendations: gap.recs,
      });

      if (insertErr) {
        console.log(`STORE ERROR: ${insertErr.message}`);
      } else {
        const emoji = gap.score >= 70 ? "🟢" : gap.score >= 45 ? "🟡" : "🔴";
        console.log(`${emoji} Score: ${gap.score}/100  (${gap.aligned.length} aligned, ${gap.gaps.length} gaps, ${gap.missing.length} missing)`);
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log("\n━━━ Audit Complete ━━━\n");
  console.log("View reports at: http://localhost:3000/audits");
  console.log("");
}

main();

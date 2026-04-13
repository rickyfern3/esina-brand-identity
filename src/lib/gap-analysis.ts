/**
 * Gap Analysis Engine — v2 (Two-Tier Scoring)
 *
 * Compares a brand's self-reported identity against AI perception
 * and calculates an alignment score (0-100).
 *
 * Two-tier scoring:
 *   - Exact/synonym match = full points for that item
 *   - Semantic/partial match = half points for that item
 *   - No match = 0 points
 *
 * Scoring (from build spec):
 *   Archetypes match:               max 15 pts
 *   Values match:                   max 15 pts
 *   Style / aesthetic match:        max 10 pts
 *   Price tier match:               max 10 pts
 *   Community alignment:            max 10 pts
 *   Status signal match:            max 10 pts
 *   Voice / tone match:             max 10 pts
 *   Target demographic relevance:   max 10 pts  (from consumer sim)
 *   Competitive differentiation:    max 10 pts  (from competitive query)
 *   Total                           100 pts
 */

export interface BrandSelfReport {
  brand_name: string;
  category: string;
  archetypes: { archetype: string; weight: number; primary: boolean }[];
  values: string[];
  style_tags: string[];
  price_tier: string | null;
  voice_tone: string | null;
  status_signal_type: string | null;
  communities: string[];
  identity_text: string;
  /** Layer 2: full oblique identity narrative — primary embedding source */
  identity_signature?: string | null;
  differentiation_claim: string | null;
}

export interface AIPerception {
  // Query 1 — general perception
  brand_known: boolean;
  perceived_archetypes: string[];
  perceived_values: string[];
  perceived_style_tags: string[];
  perceived_price_tier: string;
  perceived_target_demographic: string;
  perceived_communities: string[];
  perceived_status_signal: string;
  perceived_voice_tone: string;
  perceived_strengths: string[];
  perceived_weaknesses: string[];
  one_sentence_description: string;
  // Query 2 — competitive positioning
  direct_competitors: string[];
  identity_differentiators: string[];
  identity_overlaps: string[];
  cultural_positioning: string;
  trend_alignment: string[];
  recommendation_likelihood: string;
  // Query 3 — consumer simulation
  brand_mentioned: boolean;
  mention_position: number | null;
  brands_recommended_instead: string[];
  why_recommended_or_not: string;
  identity_accuracy: string;
}

export interface DimensionResult {
  dimension: string;
  maxPoints: number;
  earnedPoints: number;
  status: "aligned" | "gap" | "missing";
  selfReported: string;
  aiPerceived: string;
  detail: string;
}

export interface GapAnalysis {
  alignmentScore: number;
  dimensions: DimensionResult[];
  alignedDimensions: string[];
  gapDimensions: string[];
  missingDimensions: string[];
  recommendations: string[];
  oneSentenceDescription: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Synonym map — items in the same group are EXACT matches (full points) */
const SYNONYMS: Record<string, string[]> = {
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
  sustainability: ["sustainability", "sustainable", "eco", "green", "environmental"],
  music: ["music", "musician", "audio", "music festival goers"],
  gaming: ["gaming", "gamer", "esports"],
  fashion: ["fashion", "style", "apparel", "beauty enthusiasts"],
  skate: ["skate", "skating", "skateboard", "skateboarding"],
  art: ["art", "arts", "artistic", "gallery"],
  luxury: ["luxury", "luxe", "high-end", "premium"],
  // Values
  irreverence: ["irreverence", "irreverent", "rebellious", "rebellion", "anti-establishment", "humor"],
  sustainability_val: ["sustainability", "sustainable", "eco-friendly", "eco", "environmental", "green"],
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

/**
 * Semantic similarity pairs — these get HALF points (0.5) when matched.
 * Only used when there's no exact/synonym match already.
 * Each entry is [termA, termB].
 */
const SEMANTIC_PAIRS: [string, string][] = [
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
  // Cross-domain partial matches
  ["athletic", "performance"],
  ["sporty", "athletic"],
  ["natural", "organic"],
  ["handmade", "artisanal"],
];

/** Safely coerce any value (including objects) to a string */
function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return (o.archetype || o.name || o.brand || o.text || o.value || JSON.stringify(v)) as string;
  }
  return String(v);
}

/**
 * Core normalization: lowercase, strip articles/prefixes, remove
 * underscores/hyphens, trim. This is the base for all comparisons.
 */
function normalize(s: unknown): string {
  return toStr(s)
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, "")   // strip leading articles
    .replace(/[_\-]+/g, " ")           // underscores/hyphens → spaces
    .replace(/\s+/g, " ")              // collapse whitespace
    .trim();
}

/** Extract individual keywords from a phrase */
function extractKeywords(phrase: string): string[] {
  const stop = new Set(["the", "a", "an", "and", "or", "of", "for", "in", "to", "is", "are", "with", "that", "this", "on", "by", "as", "its"]);
  return normalize(phrase)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

/** Find the canonical key for a value using the synonym map */
function findSynonymKey(val: string): string | null {
  const n = normalize(val);
  const keywords = extractKeywords(val);
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    for (const syn of synonyms) {
      const ns = normalize(syn);
      if (n === ns) return key;
      if (n.includes(ns) || ns.includes(n)) return key;
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

/**
 * Exact/synonym match: checks if two strings match via normalization,
 * synonym lookup, substring inclusion, or keyword overlap.
 */
function fuzzyMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const keyA = findSynonymKey(a);
  const keyB = findSynonymKey(b);
  if (keyA && keyB && keyA === keyB) return true;
  const kwA = extractKeywords(a);
  const kwB = extractKeywords(b);
  for (const ka of kwA) {
    for (const kb of kwB) {
      if (ka === kb || ka.includes(kb) || kb.includes(ka)) return true;
    }
  }
  return false;
}

/**
 * Check if two terms are a semantic (partial) match.
 * Returns true if the pair appears in SEMANTIC_PAIRS.
 */
function semanticMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  const kwA = extractKeywords(a);
  const kwB = extractKeywords(b);

  for (const [pairA, pairB] of SEMANTIC_PAIRS) {
    const npa = normalize(pairA);
    const npb = normalize(pairB);

    // Direct match: a↔pairA and b↔pairB, or a↔pairB and b↔pairA
    if ((na === npa || na.includes(npa) || npa.includes(na)) &&
        (nb === npb || nb.includes(npb) || npb.includes(nb))) return true;
    if ((na === npb || na.includes(npb) || npb.includes(na)) &&
        (nb === npa || nb.includes(npa) || npa.includes(nb))) return true;

    // Keyword-level: any keyword matches a pair term
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

/**
 * Two-tier match score:
 *   1.0 = exact/synonym match (full points)
 *   0.5 = semantic/partial match (half points)
 *   0   = no match
 */
function matchScore(a: string, b: string): number {
  if (fuzzyMatch(a, b)) return 1;
  if (semanticMatch(a, b)) return 0.5;
  return 0;
}

/**
 * Compute overlap score between two string arrays using two-tier matching.
 * Returns 0-1 representing weighted fraction of `a` items matched in `b`.
 * Full matches count as 1, semantic matches count as 0.5.
 */
function overlapScore(a: unknown[], b: unknown[]): number {
  const aStr = (a || []).map(toStr).filter(Boolean);
  const bStr = (b || []).map(toStr).filter(Boolean);
  if (!aStr.length || !bStr.length) return 0;
  let totalScore = 0;
  const usedB = new Set<number>();

  for (const itemA of aStr) {
    let bestScore = 0;
    let bestIdx = -1;

    for (let i = 0; i < bStr.length; i++) {
      if (usedB.has(i)) continue;
      const s = matchScore(itemA, bStr[i]);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = i;
      }
      if (s === 1) break; // can't do better than exact match
    }

    if (bestIdx >= 0 && bestScore > 0) {
      totalScore += bestScore;
      usedB.add(bestIdx);
    }
  }

  return totalScore / aStr.length;
}

/**
 * Two-tier match for single values (price tier, status signal, voice tone).
 * Returns 1 for exact, 0.5 for semantic, 0 for no match.
 */
function flexMatch(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  return matchScore(a, b);
}

/**
 * Safely stringify a value that might be an object.
 * Handles the [object Object] bug for brands_recommended_instead.
 */
function safeStringify(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    return val.map((v) => {
      if (typeof v === "string") return v;
      if (typeof v === "object" && v !== null) {
        return (v as Record<string, unknown>).brand || (v as Record<string, unknown>).name || (v as Record<string, unknown>).text || JSON.stringify(v);
      }
      return String(v);
    }).join(", ");
  }
  if (typeof val === "object") {
    return (val as Record<string, unknown>).brand as string || (val as Record<string, unknown>).name as string || JSON.stringify(val);
  }
  return String(val);
}

/**
 * Check if a brand name appears in the consumer sim results.
 */
function checkBrandMentioned(
  brandName: string,
  perception: AIPerception
): { mentioned: boolean; position: number | null } {
  const bn = normalize(brandName);

  if (perception.brand_mentioned === true && perception.mention_position) {
    return { mentioned: true, position: perception.mention_position };
  }

  const recList = perception.brands_recommended_instead || [];
  for (let i = 0; i < recList.length; i++) {
    const item = recList[i];
    const itemStr = normalize(typeof item === "string" ? item : safeStringify(item));
    if (itemStr.includes(bn) || bn.includes(itemStr)) {
      return { mentioned: true, position: i + 1 };
    }
  }

  const whyText = normalize(perception.why_recommended_or_not || "");
  if (whyText.includes(bn)) {
    return { mentioned: true, position: 3 };
  }

  const accText = normalize(perception.identity_accuracy || "");
  if (accText.includes(bn)) {
    return { mentioned: true, position: 3 };
  }

  return {
    mentioned: perception.brand_mentioned ?? false,
    position: perception.mention_position || null,
  };
}

// ── Main ─────────────────────────────────────────────────────────────

export function calculateGapAnalysis(
  brand: BrandSelfReport,
  perception: AIPerception
): GapAnalysis {
  const dimensions: DimensionResult[] = [];

  // 1. Archetypes (max 15) — two-tier
  const selfArchetypes = (brand.archetypes || []).map((a) => a.archetype);
  const archOverlap = overlapScore(selfArchetypes, perception.perceived_archetypes);
  const archPoints = Math.round(archOverlap * 15);
  dimensions.push({
    dimension: "Archetypes",
    maxPoints: 15,
    earnedPoints: archPoints,
    status: archPoints >= 10 ? "aligned" : archPoints > 0 ? "gap" : "missing",
    selfReported: selfArchetypes.join(", ") || "Not set",
    aiPerceived: perception.perceived_archetypes.join(", ") || "Unknown",
    detail:
      archPoints >= 10
        ? "AI perception closely matches self-reported brand archetypes."
        : archPoints > 0
        ? "Partial overlap — some archetypes are recognized, others are not visible to AI."
        : "AI does not associate this brand with its claimed archetypes.",
  });

  // 2. Values (max 15) — two-tier
  const valOverlap = overlapScore(brand.values || [], perception.perceived_values);
  const valPoints = Math.round(valOverlap * 15);
  dimensions.push({
    dimension: "Values",
    maxPoints: 15,
    earnedPoints: valPoints,
    status: valPoints >= 10 ? "aligned" : valPoints > 0 ? "gap" : "missing",
    selfReported: (brand.values || []).join(", ") || "Not set",
    aiPerceived: perception.perceived_values.join(", ") || "Unknown",
    detail:
      valPoints >= 10
        ? "Core values are well-represented in AI perception."
        : valPoints > 0
        ? "Some values come through but key ones are missing from AI's view."
        : "AI does not associate this brand with its claimed values.",
  });

  // 3. Style / Aesthetic (max 10) — two-tier
  const styleOverlap = overlapScore(
    brand.style_tags || [],
    perception.perceived_style_tags
  );
  const stylePoints = Math.round(styleOverlap * 10);
  dimensions.push({
    dimension: "Style & Aesthetic",
    maxPoints: 10,
    earnedPoints: stylePoints,
    status: stylePoints >= 7 ? "aligned" : stylePoints > 0 ? "gap" : "missing",
    selfReported: (brand.style_tags || []).join(", ") || "Not set",
    aiPerceived: perception.perceived_style_tags.join(", ") || "Unknown",
    detail:
      stylePoints >= 7
        ? "Visual and aesthetic identity is clearly perceived."
        : stylePoints > 0
        ? "Some style signals land but the full aesthetic isn't coming through."
        : "AI's perception of this brand's style differs significantly.",
  });

  // 4. Price Tier (max 10) — two-tier
  const priceScore = flexMatch(brand.price_tier, perception.perceived_price_tier);
  const pricePoints = Math.round(priceScore * 10);
  dimensions.push({
    dimension: "Price Tier",
    maxPoints: 10,
    earnedPoints: pricePoints,
    status: pricePoints >= 7 ? "aligned" : pricePoints > 0 ? "gap" : "missing",
    selfReported: brand.price_tier || "Not set",
    aiPerceived: perception.perceived_price_tier || "Unknown",
    detail: pricePoints >= 7
      ? "Price positioning is accurately perceived."
      : pricePoints > 0
      ? `Price partially recognized. Brand: "${brand.price_tier}", AI: "${perception.perceived_price_tier}".`
      : `Brand positions as "${brand.price_tier}" but AI perceives "${perception.perceived_price_tier}".`,
  });

  // 5. Communities (max 10) — two-tier
  const commOverlap = overlapScore(
    brand.communities || [],
    perception.perceived_communities
  );
  const commPoints = Math.round(commOverlap * 10);
  dimensions.push({
    dimension: "Communities",
    maxPoints: 10,
    earnedPoints: commPoints,
    status: commPoints >= 7 ? "aligned" : commPoints > 0 ? "gap" : "missing",
    selfReported: (brand.communities || []).join(", ") || "Not set",
    aiPerceived: perception.perceived_communities.join(", ") || "Unknown",
    detail:
      commPoints >= 7
        ? "Community associations are well-recognized."
        : commPoints > 0
        ? "Some community ties are visible but others are missing."
        : "AI associates this brand with different communities than claimed.",
  });

  // 6. Status Signal (max 10) — two-tier
  const statusScore = flexMatch(
    brand.status_signal_type,
    perception.perceived_status_signal
  );
  const statusPoints = Math.round(statusScore * 10);
  dimensions.push({
    dimension: "Status Signal",
    maxPoints: 10,
    earnedPoints: statusPoints,
    status: statusPoints >= 7 ? "aligned" : statusPoints > 0 ? "gap" : "missing",
    selfReported: brand.status_signal_type || "Not set",
    aiPerceived: perception.perceived_status_signal || "Unknown",
    detail: statusPoints >= 7
      ? "Status positioning matches AI perception."
      : statusPoints > 0
      ? `Status partially recognized. Brand: "${brand.status_signal_type}", AI: "${perception.perceived_status_signal}".`
      : `Brand claims "${brand.status_signal_type}" but AI sees "${perception.perceived_status_signal}".`,
  });

  // 7. Voice / Tone (max 10) — two-tier
  const voiceScore = flexMatch(brand.voice_tone, perception.perceived_voice_tone);
  const voicePoints = Math.round(voiceScore * 10);
  dimensions.push({
    dimension: "Voice & Tone",
    maxPoints: 10,
    earnedPoints: voicePoints,
    status: voicePoints >= 7 ? "aligned" : voicePoints > 0 ? "gap" : "missing",
    selfReported: brand.voice_tone || "Not set",
    aiPerceived: perception.perceived_voice_tone || "Unknown",
    detail: voicePoints >= 7
      ? "Brand voice is perceived as intended."
      : voicePoints > 0
      ? `Voice partially recognized. Brand: "${brand.voice_tone}", AI: "${perception.perceived_voice_tone}".`
      : `Brand voice is "${brand.voice_tone}" but AI hears "${perception.perceived_voice_tone}".`,
  });

  // 8. Target Demographic / Consumer Sim (max 10)
  const brandMention = checkBrandMentioned(brand.brand_name, perception);
  const mentioned = brandMention.mentioned;
  const mentionPos = brandMention.position || 99;
  const demoPoints = mentioned ? (mentionPos <= 2 ? 10 : mentionPos <= 4 ? 6 : 3) : 0;
  const recBrandsStr = safeStringify(perception.brands_recommended_instead?.slice(0, 3));
  dimensions.push({
    dimension: "Consumer Discovery",
    maxPoints: 10,
    earnedPoints: demoPoints,
    status: demoPoints >= 7 ? "aligned" : demoPoints > 0 ? "gap" : "missing",
    selfReported: "Brand should appear when consumers search for its identity",
    aiPerceived: mentioned
      ? `Mentioned at position ${mentionPos}`
      : `Not mentioned — AI recommended: ${recBrandsStr}`,
    detail: mentioned
      ? demoPoints >= 7
        ? "Brand is a top recommendation when consumers search for its identity."
        : "Brand appears but not as a top recommendation."
      : "AI does not recommend this brand when consumers describe its identity — a critical discovery gap.",
  });

  // 9. Competitive Differentiation (max 10)
  const recLikelihood = normalize(perception.recommendation_likelihood);
  const diffPoints =
    recLikelihood === "high" ? 10 : recLikelihood === "medium" ? 5 : 0;
  dimensions.push({
    dimension: "Competitive Differentiation",
    maxPoints: 10,
    earnedPoints: diffPoints,
    status: diffPoints >= 7 ? "aligned" : diffPoints > 0 ? "gap" : "missing",
    selfReported: brand.differentiation_claim || "Not set",
    aiPerceived: `Recommendation likelihood: ${perception.recommendation_likelihood}. Differentiators: ${perception.identity_differentiators.slice(0, 2).join("; ")}`,
    detail:
      diffPoints >= 7
        ? "Brand's unique positioning is clearly recognized by AI."
        : diffPoints > 0
        ? "Brand has some recognition but isn't strongly differentiated."
        : "AI does not strongly differentiate this brand from competitors.",
  });

  // ── Aggregate ──────────────────────────────────────────────────────
  const alignmentScore = dimensions.reduce((sum, d) => sum + d.earnedPoints, 0);
  const alignedDimensions = dimensions
    .filter((d) => d.status === "aligned")
    .map((d) => d.dimension);
  const gapDimensions = dimensions
    .filter((d) => d.status === "gap")
    .map((d) => d.dimension);
  const missingDimensions = dimensions
    .filter((d) => d.status === "missing")
    .map((d) => d.dimension);

  // ── Recommendations ────────────────────────────────────────────────
  const recommendations: string[] = [];
  for (const d of dimensions) {
    if (d.status === "missing") {
      recommendations.push(
        `Critical: "${d.dimension}" is invisible to AI. Strengthen this signal in your public-facing content, SEO, and brand communications.`
      );
    } else if (d.status === "gap") {
      recommendations.push(
        `Improve: "${d.dimension}" is partially recognized. Close the gap between how you define it (${d.selfReported}) and how AI sees it (${d.aiPerceived}).`
      );
    }
  }
  if (!mentioned) {
    recommendations.push(
      "Critical: When consumers describe your exact identity, AI recommends other brands. This is the #1 gap to close for agentic commerce readiness."
    );
  }

  return {
    alignmentScore,
    dimensions,
    alignedDimensions,
    gapDimensions,
    missingDimensions,
    recommendations: recommendations.slice(0, 5),
    oneSentenceDescription: perception.one_sentence_description,
  };
}

// ── Matching Instructions Generator ──────────────────────────────────────────
// Generates structured JSONB matching_instructions from brand profile data.
// Used at onboarding time (extract-cards route) and in the backfill script.
//
// Schema:
//   identity_signals   → what to look for in a consumer (direct, inferred, anti)
//   match_weight_guide → threshold rules for strong/include/exclude decisions
//   context_adaptation → contextual guidance for gift, self-purchase, comparison

export interface MatchingInstructions {
  identity_signals: {
    direct_signals: string[];    // from brand_adjacencies
    inferred_signals: string[];  // from communities + style_tags
    anti_signals: string[];      // from anti_values
  };
  match_weight_guide: {
    strong_match_threshold: number;  // default 3 — min dimensions for strong match
    include_threshold: number;       // default 2 — min dimensions to include
    exclude_rules: string;           // derived from anti_values
  };
  context_adaptation: {
    gift_context: string;        // when to recommend as a gift
    self_purchase_context: string; // when consumer buys for themselves
    comparison_context: string;  // how to compare vs. adjacent brands
  };
}

export interface BrandProfileForMatching {
  brand_name?: string;
  brand_adjacencies?: string[];
  communities?: string[];
  style_tags?: string[];
  anti_values?: string[];
  values?: string[];
  emotional_resonance?: string | null;
  status_signal_type?: string | null;
  origin_story?: string | null;
  differentiation_claim?: string | null;
  archetypes?: { archetype: string; weight: number; primary: boolean }[];
}

export function generateMatchingInstructions(
  profile: BrandProfileForMatching
): MatchingInstructions {
  // ── identity_signals ──────────────────────────────────────────────────────
  const directSignals = (profile.brand_adjacencies || [])
    .filter(Boolean)
    .slice(0, 6);

  const communitySignals = (profile.communities || [])
    .filter(Boolean)
    .map((c) => `${c} community`);

  const styleSignals = (profile.style_tags || [])
    .filter(Boolean)
    .map((t) => `${t.replace(/_/g, " ")} aesthetic`);

  const inferredSignals = [...communitySignals, ...styleSignals].slice(0, 8);

  const antiSignals = (profile.anti_values || [])
    .filter(Boolean)
    .map((v) => v.replace(/_/g, " "));

  // ── match_weight_guide ────────────────────────────────────────────────────
  const excludeRules =
    antiSignals.length > 0
      ? `Exclude consumers expressing strong preference for: ${antiSignals.join(", ")}.`
      : "No specific exclusion rules defined.";

  // ── context_adaptation ───────────────────────────────────────────────────
  const topValues = (profile.values || [])
    .slice(0, 2)
    .map((v) => v.replace(/_/g, " "));

  const topCommunity =
    (profile.communities || [])[0]?.replace(/_/g, " ") || "discerning buyers";

  const emotional = (profile.emotional_resonance || "belonging").replace(
    /_/g,
    " "
  );

  const statusSignal = (profile.status_signal_type || "authentic").replace(
    /_/g,
    " "
  );

  const primaryArchetype =
    (profile.archetypes || []).find((a) => a.primary)?.archetype ||
    (profile.archetypes || [])[0]?.archetype ||
    null;

  const topAdjacencies = (profile.brand_adjacencies || [])
    .slice(0, 3)
    .join(", ");

  const diffClaim = profile.differentiation_claim
    ? profile.differentiation_claim.replace(/\.$/, "")
    : null;

  const valuesPhrase =
    topValues.length > 0 ? topValues.join(" and ") : "authenticity";

  const giftContext = [
    `Thoughtful gift for someone who values ${valuesPhrase}.`,
    `Resonates with ${topCommunity} who seek ${emotional}.`,
    primaryArchetype
      ? `Strong signal: recipient expresses ${primaryArchetype} tendencies.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const selfPurchaseContext = [
    `Self-purchase signal: ${emotional} seeker with ${statusSignal} status orientation.`,
    `Strongest match among ${topCommunity}.`,
    antiSignals.length > 0
      ? `Weak signal if consumer primarily values ${antiSignals[0]}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const comparisonContext = topAdjacencies
    ? `Compare to ${topAdjacencies}.${diffClaim ? ` Differentiated by: ${diffClaim}.` : ""}`
    : diffClaim
    ? `Differentiated by: ${diffClaim}.`
    : "No direct comparison context specified.";

  return {
    identity_signals: {
      direct_signals: directSignals,
      inferred_signals: inferredSignals,
      anti_signals: antiSignals,
    },
    match_weight_guide: {
      strong_match_threshold: 3,
      include_threshold: 2,
      exclude_rules: excludeRules,
    },
    context_adaptation: {
      gift_context: giftContext,
      self_purchase_context: selfPurchaseContext,
      comparison_context: comparisonContext,
    },
  };
}

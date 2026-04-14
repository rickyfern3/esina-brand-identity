/**
 * identity-text.ts
 *
 * Converts a brand profile's structured fields into a natural language
 * identity text blob that gets embedded as a vector.
 */

export interface BrandProfileInput {
  brand_name: string;
  category: string;
  price_tier?: string | null;
  archetypes?: { archetype: string; weight: number; primary: boolean }[];
  values?: string[];
  anti_values?: string[];
  style_tags?: string[];
  voice_tone?: string | null;
  humor_level?: string | null;
  status_signal_type?: string | null;
  logo_visibility?: string | null;
  exclusivity_level?: string | null;
  communities?: string[];
  emotional_resonance?: string | null;
  sustainability_level?: string | null;
  brand_adjacencies?: string[];
  trend_alignment?: string[];
  design_language?: string | null;
  visual_tone?: string | null;
  identity_statements?: string[];
  origin_story?: string | null;
  founder_philosophy?: string | null;
  mission_statement?: string | null;
  differentiation_claim?: string | null;
  target_age_min?: number | null;
  target_age_max?: number | null;
  target_gender_affinity?: string | null;
}

export function generateIdentityText(profile: BrandProfileInput): string {
  const parts: string[] = [];

  // Opening
  const priceTier = profile.price_tier ? `${profile.price_tier}-tier` : "";
  parts.push(
    `${profile.brand_name} is a ${[priceTier, profile.category].filter(Boolean).join(" ")} brand.`
  );

  // Archetypes
  if (profile.archetypes?.length) {
    const archetypeNames = profile.archetypes
      .sort((a, b) => b.weight - a.weight)
      .map((a) => a.archetype);
    parts.push(`Brand archetypes: ${archetypeNames.join(", ")}.`);
  }

  // Values
  if (profile.values?.length) {
    parts.push(`Core values: ${profile.values.join(", ")}.`);
  }

  // Anti-values
  if (profile.anti_values?.length) {
    parts.push(`This brand is not: ${profile.anti_values.join(", ")}.`);
  }

  // Style
  if (profile.style_tags?.length) {
    parts.push(`Visual style: ${profile.style_tags.join(", ")}.`);
  }

  // Design language + visual tone
  const aesthetic = [profile.design_language, profile.visual_tone].filter(Boolean);
  if (aesthetic.length) {
    parts.push(`Aesthetic: ${aesthetic.join(", ")}.`);
  }

  // Voice
  if (profile.voice_tone) {
    const humor = profile.humor_level && profile.humor_level !== "none"
      ? ` with ${profile.humor_level} humor`
      : "";
    parts.push(`Brand voice: ${profile.voice_tone}${humor}.`);
  }

  // Status signal
  if (profile.status_signal_type) {
    const logoNote = profile.logo_visibility ? `, ${profile.logo_visibility} logo visibility` : "";
    parts.push(`Status signal: ${profile.status_signal_type}${logoNote}.`);
  }

  // Exclusivity
  if (profile.exclusivity_level) {
    parts.push(`Exclusivity: ${profile.exclusivity_level}.`);
  }

  // Emotional resonance
  if (profile.emotional_resonance) {
    parts.push(`Buying this brand evokes: ${profile.emotional_resonance}.`);
  }

  // Sustainability
  if (profile.sustainability_level && profile.sustainability_level !== "none") {
    parts.push(`Sustainability commitment: ${profile.sustainability_level}.`);
  }

  // Communities
  if (profile.communities?.length) {
    parts.push(`Communities: ${profile.communities.join(", ")}.`);
  }

  // Trend alignment
  if (profile.trend_alignment?.length) {
    parts.push(`Trend alignment: ${profile.trend_alignment.join(", ")}.`);
  }

  // Target demographic
  const ageRange =
    profile.target_age_min && profile.target_age_max
      ? `${profile.target_age_min}-${profile.target_age_max}`
      : null;
  const gender = profile.target_gender_affinity;
  if (ageRange || gender) {
    parts.push(
      `Target demographic: ${[gender, ageRange ? `age ${ageRange}` : null].filter(Boolean).join(", ")}.`
    );
  }

  // Adjacent brands
  if (profile.brand_adjacencies?.length) {
    parts.push(
      `Customers also buy: ${profile.brand_adjacencies.slice(0, 10).join(", ")}.`
    );
  }

  // Identity statements
  if (profile.identity_statements?.length) {
    profile.identity_statements.forEach((stmt) => {
      if (stmt?.trim()) parts.push(stmt.trim());
    });
  }

  // Free-text narrative
  if (profile.origin_story?.trim()) {
    parts.push(profile.origin_story.trim());
  }
  if (profile.founder_philosophy?.trim()) {
    parts.push(`Philosophy: ${profile.founder_philosophy.trim()}`);
  }
  if (profile.mission_statement?.trim()) {
    parts.push(`Mission: ${profile.mission_statement.trim()}`);
  }
  if (profile.differentiation_claim?.trim()) {
    parts.push(`Differentiation: ${profile.differentiation_claim.trim()}`);
  }

  return parts.join(" ");
}

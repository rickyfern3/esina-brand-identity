import { supabase } from "@/lib/supabase";

export interface ApprovedDimension {
  candidate_name: string;
  candidate_type: string;
  definition: string;
}

/**
 * Fetches all approved schema candidates from the database.
 * These extend the base controlled vocabulary used in GPT system prompts.
 */
export async function getApprovedVocabulary(): Promise<{
  archetypes: ApprovedDimension[];
  values: ApprovedDimension[];
  style_tags: ApprovedDimension[];
  communities: ApprovedDimension[];
}> {
  const { data, error } = await supabase
    .from("schema_candidates")
    .select("candidate_name, candidate_type, definition")
    .eq("status", "approved")
    .order("candidate_name");

  if (error || !data) {
    return { archetypes: [], values: [], style_tags: [], communities: [] };
  }

  const result = { archetypes: [] as ApprovedDimension[], values: [] as ApprovedDimension[], style_tags: [] as ApprovedDimension[], communities: [] as ApprovedDimension[] };

  for (const d of data) {
    const key = d.candidate_type === "style_tag" ? "style_tags" : `${d.candidate_type}s` as keyof typeof result;
    if (result[key]) {
      result[key].push(d);
    }
  }

  return result;
}

/**
 * Builds an addendum for GPT system prompts listing approved extended vocabulary.
 * Returns empty string if no approved candidates exist.
 */
export async function getVocabularyPromptExtension(): Promise<string> {
  const vocab = await getApprovedVocabulary();

  const sections: string[] = [];

  if (vocab.archetypes.length > 0) {
    sections.push(
      `Extended archetypes: ${vocab.archetypes.map((a) => `${a.candidate_name} (${a.definition})`).join(", ")}`
    );
  }
  if (vocab.values.length > 0) {
    sections.push(
      `Extended values: ${vocab.values.map((v) => `${v.candidate_name} (${v.definition})`).join(", ")}`
    );
  }
  if (vocab.style_tags.length > 0) {
    sections.push(
      `Extended style tags: ${vocab.style_tags.map((s) => `${s.candidate_name} (${s.definition})`).join(", ")}`
    );
  }
  if (vocab.communities.length > 0) {
    sections.push(
      `Extended communities: ${vocab.communities.map((c) => `${c.candidate_name} (${c.definition})`).join(", ")}`
    );
  }

  if (sections.length === 0) return "";

  return `\n\nAdditional approved vocabulary (use these alongside the base vocabulary when they fit the consumer/brand):\n${sections.join("\n")}`;
}

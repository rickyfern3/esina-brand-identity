#!/usr/bin/env node
/**
 * seed-mapping-ontology.mjs
 * Seeds V1 curated entries into the mapping_ontology table.
 * Run: OPENAI_API_KEY=sk-... SUPABASE_SERVICE_ROLE_KEY=eyJ... NEXT_PUBLIC_SUPABASE_URL=https://... node seed-mapping-ontology.mjs
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local automatically
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envFile = readFileSync(resolve(__dirname, ".env.local"), "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch (e) { /* .env.local not found, rely on existing env vars */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error("Missing env vars. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ── Seed data ──────────────────────────────────────────────────────────────────

const SONGS = [
  { type: "song", value: "Redbone - Childish Gambino" },
  { type: "song", value: "Flashing Lights - Kanye West" },
  { type: "song", value: "Pink + White - Frank Ocean" },
  { type: "song", value: "Dreams - Fleetwood Mac" },
  { type: "song", value: "Midnight City - M83" },
  { type: "song", value: "Royals - Lorde" },
  { type: "song", value: "Electric Feel - MGMT" },
  { type: "song", value: "Pursuit of Happiness - Kid Cudi" },
  { type: "song", value: "Ultralight Beam - Kanye West" },
  { type: "song", value: "Thinkin Bout You - Frank Ocean" },
  { type: "song", value: "Motion Picture Soundtrack - Radiohead" },
  { type: "song", value: "Runaway - Kanye West" },
  { type: "song", value: "Green Eyes - Erykah Badu" },
  { type: "song", value: "Slow Burn - Kacey Musgraves" },
  { type: "song", value: "Ribs - Lorde" },
  { type: "song", value: "Cherry Wine - Hozier" },
  { type: "song", value: "Golden - Harry Styles" },
  { type: "song", value: "Nights - Frank Ocean" },
  { type: "song", value: "505 - Arctic Monkeys" },
  { type: "song", value: "This Must Be the Place - Talking Heads" },
];

const NEIGHBORHOODS = [
  { type: "neighborhood", value: "Silver Lake, Los Angeles" },
  { type: "neighborhood", value: "Williamsburg, Brooklyn" },
  { type: "neighborhood", value: "Le Marais, Paris" },
  { type: "neighborhood", value: "Shoreditch, London" },
  { type: "neighborhood", value: "Kreuzberg, Berlin" },
  { type: "neighborhood", value: "Mission District, San Francisco" },
  { type: "neighborhood", value: "Wynwood, Miami" },
  { type: "neighborhood", value: "Nakameguro, Tokyo" },
  { type: "neighborhood", value: "Nolita, New York" },
  { type: "neighborhood", value: "Venice Beach, Los Angeles" },
  { type: "neighborhood", value: "Capitol Hill, Seattle" },
  { type: "neighborhood", value: "Brick Lane, London" },
  { type: "neighborhood", value: "Haight-Ashbury, San Francisco" },
  { type: "neighborhood", value: "Marrickville, Sydney" },
  { type: "neighborhood", value: "Quartier des Batignolles, Paris" },
];

const SCENTS = [
  { type: "scent", value: "cedarwood" },
  { type: "scent", value: "petrichor" },
  { type: "scent", value: "jasmine" },
  { type: "scent", value: "old books" },
  { type: "scent", value: "saltwater" },
  { type: "scent", value: "sandalwood" },
  { type: "scent", value: "fresh linen" },
  { type: "scent", value: "leather" },
  { type: "scent", value: "pine forest" },
  { type: "scent", value: "smoke" },
  { type: "scent", value: "bergamot" },
  { type: "scent", value: "vanilla" },
  { type: "scent", value: "motor oil" },
  { type: "scent", value: "eucalyptus" },
  { type: "scent", value: "rose" },
  { type: "scent", value: "wet concrete" },
  { type: "scent", value: "tobacco" },
  { type: "scent", value: "amber" },
];

const TEXTURES = [
  { type: "texture", value: "raw denim" },
  { type: "texture", value: "worn leather" },
  { type: "texture", value: "brushed cotton" },
  { type: "texture", value: "cold glass" },
  { type: "texture", value: "rough concrete" },
  { type: "texture", value: "silk" },
  { type: "texture", value: "unfinished wood" },
  { type: "texture", value: "washed linen" },
  { type: "texture", value: "ribbed knit" },
  { type: "texture", value: "matte rubber" },
];

const ENEMIES = [
  { type: "enemy", value: "fast fashion" },
  { type: "enemy", value: "corporate minimalism" },
  { type: "enemy", value: "loud logos" },
  { type: "enemy", value: "greenwashing" },
  { type: "enemy", value: "influencer culture" },
  { type: "enemy", value: "mass production" },
  { type: "enemy", value: "trend chasing" },
  { type: "enemy", value: "performative luxury" },
  { type: "enemy", value: "beige everything" },
  { type: "enemy", value: "algorithm-brained content" },
];

const ALL_SIGNALS = [...SONGS, ...NEIGHBORHOODS, ...SCENTS, ...TEXTURES, ...ENEMIES];

// ── GPT mapping ────────────────────────────────────────────────────────────────

function normalize(str) {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

const TYPE_CONTEXT = {
  song: "This song is being used as a brand identity signal by a founder describing their brand's vibe.",
  neighborhood: "This neighborhood is being used as a brand identity signal — the place that best represents the brand's cultural positioning.",
  scent: "This scent is being used as a brand identity signal — the smell that best captures the brand's sensory world.",
  texture: "This texture is being used as a brand identity signal — the material feeling that best represents the brand.",
  enemy: "This 'brand enemy' is something the brand explicitly rejects — it defines the brand by opposition.",
};

async function mapSignals(batch) {
  const prompt = batch.map((s, i) =>
    `${i + 1}. Signal type: "${s.type}", value: "${s.value}"\nContext: ${TYPE_CONTEXT[s.type]}`
  ).join("\n\n");

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You map oblique cultural signals to brand identity dimensions. For each signal, return a JSON object with these fields:
- archetype_weights: object with keys from [creator, rebel, explorer, sage, lover, jester, hero, caregiver, ruler, innocent, everyperson, magician] — values 0.0-1.0, only include those with weight > 0.1
- value_associations: array of 2-4 brand values (e.g. "authenticity", "craft", "freedom")
- aesthetic_associations: array of 2-4 aesthetic descriptors (e.g. "raw", "minimal", "warm")
- community_associations: array of 1-3 communities (e.g. "streetwear", "wellness", "art")
- status_signal: one of [conspicuous, quiet_luxury, counterculture, accessible_premium, anti_status]
- emotional_resonance: one short phrase (e.g. "nostalgic warmth", "quiet confidence")

Return a JSON array with one object per signal, in the same order as the input. No extra text.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = res.choices[0]?.message?.content || "[]";
  const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

// ── Upsert to Supabase ─────────────────────────────────────────────────────────

async function upsertSignal(signal, mapping) {
  const { error } = await supabase.from("mapping_ontology").upsert(
    {
      signal_type: signal.type,
      signal_value: signal.value,
      signal_value_normalized: normalize(signal.value),
      archetype_weights: mapping.archetype_weights || {},
      value_associations: mapping.value_associations || [],
      aesthetic_associations: mapping.aesthetic_associations || [],
      community_associations: mapping.community_associations || [],
      status_signal: mapping.status_signal || null,
      emotional_resonance: mapping.emotional_resonance || null,
      confidence: 0.5,
      usage_count: 0,
      version: 1,
    },
    { onConflict: "signal_type,signal_value_normalized" }
  );

  if (error) {
    console.log(`  ✗ ${signal.value}: ${error.message}`);
  } else {
    console.log(`  ✓ ${signal.value}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${ALL_SIGNALS.length} signals into mapping_ontology...\n`);

  const BATCH_SIZE = 5;
  for (let i = 0; i < ALL_SIGNALS.length; i += BATCH_SIZE) {
    const batch = ALL_SIGNALS.slice(i, i + BATCH_SIZE);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ALL_SIGNALS.length / BATCH_SIZE)}: mapping...`);

    try {
      const mappings = await mapSignals(batch);
      for (let j = 0; j < batch.length; j++) {
        await upsertSignal(batch[j], mappings[j] || {});
      }
    } catch (err) {
      console.error(`  Batch error: ${err.message}`);
    }

    // Rate limit buffer between batches
    if (i + BATCH_SIZE < ALL_SIGNALS.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log("\nDone. mapping_ontology seeded with V1 curated data.");
}

main().catch(err => { console.error(err); process.exit(1); });

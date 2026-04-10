"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────

interface Archetype {
  id: string;
  label: string;
  description: string;
}

interface FormData {
  // Screen 1 — Basics
  brand_name: string;
  website_url: string;
  contact_email: string;
  contact_name: string;
  category: string;
  platforms: string[];
  price_tier: string;
  // Screen 2 — Identity
  identity_statements: string[];
  archetypes: { archetype: string; weight: number; primary: boolean }[];
  // Screen 3 — Values
  values: string[];
  anti_values: string[];
  sustainability_level: string;
  emotional_resonance: string;
  // Screen 4 — Aesthetic
  style_tags: string[];
  design_language: string;
  visual_tone: string;
  voice_tone: string;
  humor_level: string;
  // Screen 5 — Status & Community
  status_signal_type: string;
  logo_visibility: string;
  communities: string[];
  trend_alignment: string[];
  brand_adjacencies: string[];
  // Screen 6 — Story
  origin_story: string;
  founder_philosophy: string;
  mission_statement: string;
  differentiation_claim: string;
}

const EMPTY_FORM: FormData = {
  brand_name: "", website_url: "", contact_email: "", contact_name: "",
  category: "", platforms: [], price_tier: "",
  identity_statements: ["", "", ""], archetypes: [],
  values: [], anti_values: [], sustainability_level: "", emotional_resonance: "",
  style_tags: [], design_language: "", visual_tone: "", voice_tone: "", humor_level: "",
  status_signal_type: "", logo_visibility: "", communities: [], trend_alignment: [], brand_adjacencies: [],
  origin_story: "", founder_philosophy: "", mission_statement: "", differentiation_claim: "",
};

// ── Controlled vocabulary ────────────────────────────────────────────

const CATEGORIES = [
  "Fashion & Apparel",
  "Food & Beverage",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Lifestyle",
  "Hospitality & Travel",
  "Tech & Accessories",
  "Sports & Outdoor",
  "Entertainment & Media",
  "Automotive",
  "Pets",
  "Baby & Kids",
  "Financial Services",
  "Education",
  "Other",
];
const PLATFORMS = ["Shopify", "Depop", "Etsy", "Amazon", "Squarespace", "Standalone website", "Instagram shop", "Other"];
const PRICE_TIERS = [
  { id: "budget", label: "Budget", desc: "Accessible pricing for everyone" },
  { id: "value", label: "Value", desc: "Quality at a fair price" },
  { id: "mid", label: "Mid-range", desc: "A step above the basics" },
  { id: "premium", label: "Premium", desc: "Investment-worthy pieces" },
  { id: "luxury", label: "Luxury", desc: "Uncompromising quality" },
];
const ARCHETYPES: Archetype[] = [
  { id: "rebel", label: "Rebel", description: "Breaks rules, challenges the status quo" },
  { id: "creator", label: "Creator", description: "Imagination, artistic expression" },
  { id: "explorer", label: "Explorer", description: "Freedom, discovery, adventure" },
  { id: "sage", label: "Sage", description: "Knowledge, wisdom, truth" },
  { id: "hero", label: "Hero", description: "Courage, mastery, achievement" },
  { id: "magician", label: "Magician", description: "Transformation, making dreams real" },
  { id: "everyperson", label: "Everyperson", description: "Belonging, authenticity, down-to-earth" },
  { id: "lover", label: "Lover", description: "Passion, beauty, intimacy" },
  { id: "caregiver", label: "Caregiver", description: "Nurturing, protection, service" },
  { id: "ruler", label: "Ruler", description: "Control, leadership, premium quality" },
  { id: "jester", label: "Jester", description: "Joy, humor, living in the moment" },
  { id: "innocent", label: "Innocent", description: "Optimism, simplicity, purity" },
];
const VALUES = ["sustainability", "transparency", "craftsmanship", "community", "innovation", "inclusivity", "heritage", "irreverence", "minimalism", "wellness", "independence", "authenticity", "luxury", "affordability", "boldness", "rebellion", "simplicity", "creativity", "performance", "tradition"];
const ANTI_VALUES = ["corporate", "mass_market", "disposable", "pretentious", "basic", "generic", "exclusive", "cheap", "boring", "conformist", "wasteful", "elitist"];
const SUSTAINABILITY_LEVELS = [
  { id: "none", label: "None", desc: "Not currently a focus" },
  { id: "basic", label: "Basic", desc: "Some eco-friendly practices" },
  { id: "committed", label: "Committed", desc: "Sustainability is a core value" },
  { id: "leader", label: "Leader", desc: "Industry-leading sustainability" },
  { id: "regenerative", label: "Regenerative", desc: "Net positive impact" },
];
const EMOTIONAL_RESONANCE = ["Serenity", "Empowerment", "Belonging", "Excitement", "Rebellion", "Nostalgia", "Joy", "Confidence", "Comfort"];
const STYLE_TAGS = ["minimalist", "maximalist", "brutalist", "cottagecore", "gorpcore", "streetwear", "vintage", "futuristic", "bohemian", "preppy", "industrial", "organic", "techwear", "avant_garde", "classic", "heritage", "artisanal", "raw", "elevated_basics", "athleisure"];
const DESIGN_LANGUAGES = [
  { id: "clean", label: "Clean", desc: "Minimal, purposeful, no clutter" },
  { id: "ornate", label: "Ornate", desc: "Rich detail, layered, decorative" },
  { id: "raw", label: "Raw", desc: "Unfinished, honest, stripped back" },
  { id: "polished", label: "Polished", desc: "Refined, high-production, premium feel" },
  { id: "eclectic", label: "Eclectic", desc: "Mixed references, unexpected combinations" },
  { id: "industrial", label: "Industrial", desc: "Utilitarian, functional, material-forward" },
];
const VISUAL_TONES = ["Serious", "Playful", "Ironic", "Aspirational", "Authentic", "Provocative"];
const VOICE_TONES = [
  { id: "formal", label: "Formal", desc: "Professional, polished, measured" },
  { id: "casual", label: "Casual", desc: "Relaxed, conversational, approachable" },
  { id: "irreverent", label: "Irreverent", desc: "Doesn't take itself seriously" },
  { id: "authoritative", label: "Authoritative", desc: "Expert, confident, definitive" },
  { id: "warm", label: "Warm", desc: "Caring, welcoming, human" },
  { id: "edgy", label: "Edgy", desc: "Bold, provocative, daring" },
];
const HUMOR_LEVELS = [
  { id: "none", label: "None", desc: "Serious throughout" },
  { id: "subtle", label: "Subtle", desc: "Occasional wit" },
  { id: "moderate", label: "Moderate", desc: "Humor is part of the voice" },
  { id: "central_to_brand", label: "Central", desc: "Humor is the brand" },
];
const STATUS_SIGNALS = [
  { id: "conspicuous", label: "Conspicuous", desc: "Visible branding, recognizable logos, meant to be seen" },
  { id: "quiet_luxury", label: "Quiet Luxury", desc: "Understated quality — those who know, know" },
  { id: "counterculture", label: "Counterculture", desc: "Anti-mainstream, alternative, a badge of difference" },
  { id: "accessible_premium", label: "Accessible Premium", desc: "Quality without the pretension" },
  { id: "anti_status", label: "Anti-Status", desc: "Deliberately rejects status signaling altogether" },
];
const LOGO_VISIBILITY = [
  { id: "prominent", label: "Prominent", desc: "The logo is the point" },
  { id: "subtle", label: "Subtle", desc: "There, but not shouting" },
  { id: "hidden", label: "Hidden", desc: "Those who know, know" },
  { id: "ironic", label: "Ironic", desc: "Logo as commentary on itself" },
];
const COMMUNITIES = ["Skate", "Yoga / Wellness", "Tech", "Streetwear", "Outdoor / Adventure", "Fitness", "Art", "Music", "Gaming", "Fashion", "Food / Cooking", "Coffee Culture", "Travel", "Sustainability", "Parenting", "Pets", "Luxury", "Startup / Entrepreneur", "Creative", "Sports", "Film & Cinema", "Home Cooking", "Mindfulness", "Education"];
const TREND_ALIGNMENT = ["quiet_luxury", "anti_corporate", "functional_fashion", "clean_beauty", "regenerative", "slow_fashion", "gender_neutral", "founder_led", "community_commerce", "ai_native", "heritage_revival", "dopamine_dressing", "craft_first", "wellness_culture", "local_first", "experience_economy", "radical_transparency", "accessible_premium"];

const TOTAL_STEPS = 7;

// ── Reusable UI components ───────────────────────────────────────────

function OptionCard({ selected, onClick, children, className = "" }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={selected ? { background: "rgba(255,255,255,0.15)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.6)" } : { background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)" }}
      className="px-4 py-3 text-left transition-all"
    >
      {children}
    </button>
  );
}

function MultiSelect({ options, selected, onChange, max, renderOption }: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  max: number;
  renderOption?: (o: string) => React.ReactNode;
}) {
  const toggle = (o: string) => {
    if (selected.includes(o)) onChange(selected.filter((x) => x !== o));
    else if (selected.length < max) onChange([...selected, o]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          style={selected.includes(o) ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "2px", color: "white" } : { background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.55)" }}
          className="px-3 py-1.5 text-sm transition-all"
        >
          {renderOption ? renderOption(o) : o}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-tag">{children}</p>;
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p style={{ color: "white" }} className="text-sm font-medium mb-1">{label}</p>
      {hint && <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs mb-3">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, maxLength, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "white" }}
      className="w-full px-4 py-3 text-sm focus:outline-none"
    />
  );
}

function TextArea({ value: initialValue, onChange, placeholder, maxLength, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; rows?: number;
}) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "white" }}
        className="w-full px-4 py-3 text-sm resize-none focus:outline-none"
      />
      {maxLength && (
        <p className="text-right text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

// ── Step components ──────────────────────────────────────────────────

function StepBasics({ data, update }: { data: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionLabel>Step 1 of 7 — The Basics</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">Let's start with the essentials.</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-8">Basic info to set up your brand profile.</p>

      <FieldGroup label="Brand Name *">
        <TextInput value={data.brand_name} onChange={(v) => update("brand_name", v)} placeholder="e.g. Liquid Death" />
      </FieldGroup>

      <FieldGroup label="Website" hint="Optional">
        <TextInput value={data.website_url} onChange={(v) => update("website_url", v)} placeholder="https://" />
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FieldGroup label="Your Name">
          <TextInput value={data.contact_name} onChange={(v) => update("contact_name", v)} placeholder="First name" />
        </FieldGroup>
        <FieldGroup label="Contact Email *">
          <TextInput value={data.contact_email} onChange={(v) => update("contact_email", v)} placeholder="you@brand.com" />
        </FieldGroup>
      </div>

      <FieldGroup label="Category *" hint="Pick the one that fits best.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <OptionCard key={c} selected={data.category === c} onClick={() => update("category", c)}>
              <span className="text-sm">{c}</span>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Where do you sell?" hint="Select all that apply.">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                const curr = data.platforms as string[];
                update("platforms", curr.includes(p) ? curr.filter((x) => x !== p) : [...curr, p]);
              }}
              style={(data.platforms as string[]).includes(p) ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "2px", color: "white" } : { background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.55)" }} className="px-3 py-1.5 text-sm transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Price Tier *" hint="Where do you sit in the market?">
        <div className="grid grid-cols-1 gap-2">
          {PRICE_TIERS.map((t) => (
            <OptionCard key={t.id} selected={data.price_tier === t.id} onClick={() => update("price_tier", t.id)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.label}</span>
                <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">{t.desc}</span>
              </div>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function StepIdentity({ data, update }: { data: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  const selectedArchetypes = data.archetypes as { archetype: string; weight: number; primary: boolean }[];
  const WEIGHTS = [0.5, 0.3, 0.2];

  const toggleArchetype = (id: string) => {
    const existing = selectedArchetypes.find((a) => a.archetype === id);
    if (existing) {
      const updated = selectedArchetypes.filter((a) => a.archetype !== id).map((a, i) => ({
        ...a, weight: WEIGHTS[i] ?? 0.2, primary: i === 0,
      }));
      update("archetypes", updated);
    } else if (selectedArchetypes.length < 3) {
      const idx = selectedArchetypes.length;
      const updated = [...selectedArchetypes, { archetype: id, weight: WEIGHTS[idx], primary: idx === 0 }];
      update("archetypes", updated);
    }
  };

  const rankLabel = (id: string) => {
    const idx = selectedArchetypes.findIndex((a) => a.archetype === id);
    if (idx === 0) return "Primary";
    if (idx === 1) return "Secondary";
    if (idx === 2) return "Tertiary";
    return null;
  };

  return (
    <div>
      <SectionLabel>Step 2 of 7 — Identity</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">Who are you?</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-8">Define the core of your brand identity.</p>

      <FieldGroup
        label="What does choosing your brand say about the person who buys it?"
        hint="Up to 3 statements. These feed directly into your identity profile."
      >
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {i + 1}
              </span>
              <TextInput
                value={(data.identity_statements as string[])[i] || ""}
                onChange={(v) => {
                  const updated = [...(data.identity_statements as string[])];
                  updated[i] = v;
                  update("identity_statements", updated);
                }}
                placeholder={
                  i === 0 ? "e.g. I'm someone who doesn't follow trends" :
                  i === 1 ? "e.g. I care about what I put in my body" :
                  "Optional third statement"
                }
                maxLength={150}
              />
            </div>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup
        label="Brand Archetypes"
        hint={`Click to select up to 3 in order of importance. First = primary archetype. ${selectedArchetypes.length}/3 selected.`}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ARCHETYPES.map((a) => {
            const rank = rankLabel(a.id);
            const isSelected = !!rank;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleArchetype(a.id)}
                disabled={!isSelected && selectedArchetypes.length >= 3}
                style={isSelected ? { background: "rgba(255,255,255,0.15)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.6)", position: "relative" } : selectedArchetypes.length >= 3 ? { background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)", opacity: 0.3, cursor: "not-allowed", position: "relative" } : { background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}
                className="p-3 text-left"
              >
                {rank && (
                  <span style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "2px", fontSize: "10px", padding: "2px 6px" }}>
                    {rank}
                  </span>
                )}
                <p className="text-sm font-semibold text-white mb-1">{a.label}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{a.description}</p>
              </button>
            );
          })}
        </div>
      </FieldGroup>
    </div>
  );
}

function StepValues({ data, update }: { data: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionLabel>Step 3 of 7 — Values & Impact</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">What do you stand for?</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-8">Your values define what your brand attracts and what it repels.</p>

      <FieldGroup label="Core Values" hint={`Select up to 5 in priority order. First selected = most important. ${(data.values as string[]).length}/5 selected.`}>
        <MultiSelect options={VALUES} selected={data.values as string[]} onChange={(v) => update("values", v)} max={5}
          renderOption={(o) => o.replace(/_/g, " ")}
        />
      </FieldGroup>

      <FieldGroup label="What your brand is NOT" hint={`The things your brand actively avoids. Select up to 3. ${(data.anti_values as string[]).length}/3 selected.`}>
        <MultiSelect options={ANTI_VALUES} selected={data.anti_values as string[]} onChange={(v) => update("anti_values", v)} max={3}
          renderOption={(o) => o.replace(/_/g, " ")}
        />
      </FieldGroup>

      <FieldGroup label="Sustainability Commitment" hint="Be honest — AI will fact-check this.">
        <div className="grid grid-cols-1 gap-2">
          {SUSTAINABILITY_LEVELS.map((s) => (
            <OptionCard key={s.id} selected={data.sustainability_level === s.id} onClick={() => update("sustainability_level", s.id)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.label}</span>
                <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">{s.desc}</span>
              </div>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Emotional Resonance" hint="When someone buys your product, what do they feel?">
        <div className="grid grid-cols-3 gap-2">
          {EMOTIONAL_RESONANCE.map((e) => (
            <OptionCard key={e} selected={data.emotional_resonance === e.toLowerCase()} onClick={() => update("emotional_resonance", e.toLowerCase())}>
              <span className="text-sm">{e}</span>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function StepAesthetic({ data, update }: { data: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionLabel>Step 4 of 7 — Aesthetic</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">How do you look and sound?</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-8">Your visual and verbal identity signals.</p>

      <FieldGroup label="Style Tags" hint={`Pick up to 5 that describe your aesthetic. ${(data.style_tags as string[]).length}/5 selected.`}>
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const curr = data.style_tags as string[];
                update("style_tags", curr.includes(tag) ? curr.filter((x) => x !== tag) : curr.length < 5 ? [...curr, tag] : curr);
              }}
              style={(data.style_tags as string[]).includes(tag) ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "2px", color: "white" } : { background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.55)" }} className="px-3 py-2 text-sm transition-all"
            >
              {tag.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Design Language" hint="How would you describe the overall design system?">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {DESIGN_LANGUAGES.map((d) => (
            <OptionCard key={d.id} selected={data.design_language === d.id} onClick={() => update("design_language", d.id)}>
              <p className="text-sm font-medium">{d.label}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {d.desc}
              </p>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Visual Tone" hint="The feeling your imagery and content creates.">
        <div className="grid grid-cols-3 gap-2">
          {VISUAL_TONES.map((v) => (
            <OptionCard key={v} selected={data.visual_tone === v.toLowerCase()} onClick={() => update("visual_tone", v.toLowerCase())}>
              <span className="text-sm">{v}</span>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Brand Voice">
        <div className="grid grid-cols-1 gap-2">
          {VOICE_TONES.map((v) => (
            <OptionCard key={v.id} selected={data.voice_tone === v.id} onClick={() => update("voice_tone", v.id)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{v.label}</span>
                <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">{v.desc}</span>
              </div>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Humor Level">
        <div className="grid grid-cols-2 gap-2">
          {HUMOR_LEVELS.map((h) => (
            <OptionCard key={h.id} selected={data.humor_level === h.id} onClick={() => update("humor_level", h.id)}>
              <p className="text-sm font-medium">{h.label}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {h.desc}
              </p>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function StepStatusCommunity({ data, update }: { data: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  const [adjacencyInput, setAdjacencyInput] = useState("");

  const addAdjacency = () => {
    const v = adjacencyInput.trim();
    const curr = data.brand_adjacencies as string[];
    if (v && !curr.includes(v) && curr.length < 10) {
      update("brand_adjacencies", [...curr, v]);
      setAdjacencyInput("");
    }
  };

  return (
    <div>
      <SectionLabel>Step 5 of 7 — Status & Community</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">Where do you fit in culture?</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-8">How your brand signals status and which tribes it belongs to.</p>

      <FieldGroup label="Status Signal" hint="How does your brand communicate its value in culture?">
        <div className="grid grid-cols-1 gap-2">
          {STATUS_SIGNALS.map((s) => (
            <OptionCard key={s.id} selected={data.status_signal_type === s.id} onClick={() => update("status_signal_type", s.id)}>
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {s.desc}
              </p>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Logo Visibility">
        <div className="grid grid-cols-2 gap-2">
          {LOGO_VISIBILITY.map((l) => (
            <OptionCard key={l.id} selected={data.logo_visibility === l.id} onClick={() => update("logo_visibility", l.id)}>
              <p className="text-sm font-medium">{l.label}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {l.desc}
              </p>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Communities" hint={`Which communities does your customer belong to? Pick up to 5. ${(data.communities as string[]).length}/5 selected.`}>
        <div className="flex flex-wrap gap-2">
          {COMMUNITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                const curr = data.communities as string[];
                const id = c.toLowerCase().replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
                update("communities", curr.includes(id) ? curr.filter((x) => x !== id) : curr.length < 5 ? [...curr, id] : curr);
              }}
              style={(data.communities as string[]).includes(c.toLowerCase().replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_")) ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "2px", color: "white" } : { background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.55)" }}
              className="px-3 py-1.5 text-sm transition-all"
            >
              {c}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Trend Alignment" hint="Which cultural trends does your brand align with?">
        <div className="flex flex-wrap gap-2">
          {TREND_ALIGNMENT.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                const curr = data.trend_alignment as string[];
                update("trend_alignment", curr.includes(t) ? curr.filter((x) => x !== t) : [...curr, t]);
              }}
              style={(data.trend_alignment as string[]).includes(t) ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "2px", color: "white" } : { background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.55)" }} className="px-3 py-1.5 text-sm transition-all"
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Brand Adjacencies" hint="Name up to 10 brands your customers also buy. Press Enter or comma to add.">
        <div className="flex gap-2 mb-3">
          <TextInput
            value={adjacencyInput}
            onChange={setAdjacencyInput}
            placeholder="e.g. Patagonia"
            className="flex-1"
          />
          <button
            type="button"
            onClick={addAdjacency}
            className="btn-primary px-4 py-2 text-sm flex-shrink-0"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.brand_adjacencies as string[]).map((b) => (
            <span key={b} style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.45)" }} className="flex items-center gap-1.5 text-sm px-3 py-1">
              {b}
              <button
                type="button"
                onClick={() => update("brand_adjacencies", (data.brand_adjacencies as string[]).filter((x) => x !== b))}
                style={{ color: "rgba(255,255,255,0.35)" }}
                className="hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function StepStory({ data, update }: { data: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionLabel>Step 6 of 7 — Your Story</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">Why do you exist?</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-8">The narrative that makes your brand human. This goes directly into your identity profile.</p>

      <FieldGroup label="Origin Story" hint="How did this brand start? What problem were you trying to solve?">
        <TextArea value={data.origin_story} onChange={(v) => update("origin_story", v)} placeholder="e.g. We started Liquid Death because we were sick of plastic water bottles at music festivals..." maxLength={500} rows={4} />
      </FieldGroup>

      <FieldGroup label="Founder Philosophy" hint="What belief or conviction drives this brand?">
        <TextArea value={data.founder_philosophy} onChange={(v) => update("founder_philosophy", v)} placeholder="e.g. Health doesn't have to be boring or corporate." maxLength={300} rows={3} />
      </FieldGroup>

      <FieldGroup label="Mission Statement">
        <TextArea value={data.mission_statement} onChange={(v) => update("mission_statement", v)} placeholder="e.g. To murder your thirst and help save the planet." maxLength={200} rows={2} />
      </FieldGroup>

      <FieldGroup label="What makes you different from competitors?">
        <TextArea value={data.differentiation_claim} onChange={(v) => update("differentiation_claim", v)} placeholder="e.g. We're the only water brand that treats hydration like an energy drink through branding alone." maxLength={200} rows={3} />
      </FieldGroup>
    </div>
  );
}

function StepReview({ data, onEdit }: { data: FormData; onEdit: (step: number) => void }) {
  const selectedArchetypes = (data.archetypes as { archetype: string; weight: number }[]);

  const completedFields = [
    data.brand_name, data.contact_email, data.category, data.price_tier,
    selectedArchetypes.length > 0,
    (data.values as string[]).length > 0,
    (data.style_tags as string[]).length > 0,
    data.voice_tone, data.status_signal_type,
    (data.communities as string[]).length > 0,
    data.origin_story, data.differentiation_claim,
  ].filter(Boolean).length;
  const completeness = Math.round((completedFields / 12) * 100);

  const Section = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }} className="p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <button type="button" onClick={() => onEdit(step)} className="text-xs nav-link">Edit</button>
      </div>
      {children}
    </div>
  );

  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(255,255,255,0.45)" }} className="inline-block text-xs px-2 py-1 mr-1.5 mb-1.5">{children}</span>
  );

  const Field = ({ label, value }: { label: string; value?: string | null }) => value ? (
    <div className="mb-2">
      <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">{label}: </span>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{value}</span>
    </div>
  ) : null;

  return (
    <div>
      <SectionLabel>Step 7 of 7 — Review & Submit</SectionLabel>
      <h2 className="font-goldman text-2xl text-white mb-1">Almost there.</h2>
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-2">Review your brand profile before we run your AI Perception Audit.</p>

      <div style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }} className="p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Profile Completeness</p>
          <p className="text-2xl font-goldman text-white">{completeness}%</p>
        </div>
        <div className="w-32 h-1" style={{ background: "rgba(0,0,0,0.15)", borderRadius: "2px", overflow: "hidden" }}>
          <div className="h-full" style={{ background: "rgba(255,255,255,0.8)", width: `${completeness}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      <Section title="Basics" step={1}>
        <Field label="Brand" value={data.brand_name} />
        <Field label="Category" value={data.category} />
        <Field label="Price" value={data.price_tier} />
        <Field label="Email" value={data.contact_email} />
        {(data.platforms as string[]).length > 0 && <div><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Platforms: </span>{(data.platforms as string[]).map((p) => <Tag key={p}>{p}</Tag>)}</div>}
      </Section>

      <Section title="Identity" step={2}>
        {selectedArchetypes.length > 0 && (
          <div className="mb-2"><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Archetypes: </span>{selectedArchetypes.map((a) => <Tag key={a.archetype}>{a.archetype}</Tag>)}</div>
        )}
        {(data.identity_statements as string[]).filter(Boolean).map((s, i) => (
          <p key={i} style={{ color: "rgba(255,255,255,0.45)" }} className="text-xs italic mb-1">"{s}"</p>
        ))}
      </Section>

      <Section title="Values & Impact" step={3}>
        {(data.values as string[]).length > 0 && <div className="mb-2"><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Values: </span>{(data.values as string[]).map((v) => <Tag key={v}>{v.replace(/_/g, " ")}</Tag>)}</div>}
        {(data.anti_values as string[]).length > 0 && <div className="mb-2"><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Not: </span>{(data.anti_values as string[]).map((v) => <Tag key={v}>{v.replace(/_/g, " ")}</Tag>)}</div>}
        <Field label="Sustainability" value={data.sustainability_level} />
        <Field label="Emotional resonance" value={data.emotional_resonance} />
      </Section>

      <Section title="Aesthetic" step={4}>
        {(data.style_tags as string[]).length > 0 && <div className="mb-2"><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Style: </span>{(data.style_tags as string[]).map((t) => <Tag key={t}>{t.replace(/_/g, " ")}</Tag>)}</div>}
        <Field label="Voice" value={data.voice_tone} />
        <Field label="Visual tone" value={data.visual_tone} />
        <Field label="Design" value={data.design_language} />
      </Section>

      <Section title="Status & Community" step={5}>
        <Field label="Status signal" value={data.status_signal_type?.replace(/_/g, " ")} />
        {(data.communities as string[]).length > 0 && <div className="mb-2"><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Communities: </span>{(data.communities as string[]).map((c) => <Tag key={c}>{c.replace(/_/g, " ")}</Tag>)}</div>}
        {(data.brand_adjacencies as string[]).length > 0 && <div><span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Adjacent brands: </span>{(data.brand_adjacencies as string[]).map((b) => <Tag key={b}>{b}</Tag>)}</div>}
      </Section>

      <Section title="Your Story" step={6}>
        {data.origin_story && <p style={{ color: "rgba(255,255,255,0.45)" }} className="text-xs line-clamp-2 mb-1">{data.origin_story}</p>}
        {data.differentiation_claim && <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>"{data.differentiation_claim}"</p>}
      </Section>

      <div style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", padding: "20px", marginTop: "24px" }}>
        <p className="text-sm font-semibold text-white mb-1">What happens when you submit?</p>
        <ol className="space-y-1">
          {["Your profile is saved to ESINA's database", "We generate your brand's identity embedding", "We run an AI Perception Audit using GPT-4o-mini", "You're redirected to your Alignment Report"].map((step, i) => (
            <li key={i} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", flexShrink: 0 }}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>This takes about 15-20 seconds.</p>
      </div>
    </div>
  );
}

// ── Install Step ────────────────────────────────────────────────────

function StepInstall({ brandId, brandName }: { brandId: string; brandName: string }) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<script src="https://esina-brand-identity.vercel.app/esina.js?brand=${brandId}"></script>`;
  const brandMdUrl = `https://esina-brand-identity.vercel.app/api/brand/${brandId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <div className="text-center mb-10">
        <div style={{ width: "64px", height: "64px", borderRadius: "2px", background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)" }} className="flex items-center justify-center mx-auto mb-4">
          <svg style={{ width: "32px", height: "32px", color: "rgba(255,255,255,0.8)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-goldman text-2xl text-white mb-2">
          {brandName} is live on ESINA.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)" }}>
          Your brand identity profile and AI perception audit are ready.
          Now install the attribution pixel to close the loop.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div style={{ width: "24px", height: "24px", borderRadius: "2px", background: "rgba(0,0,0,0.15)" }} className="flex items-center justify-center">
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(255,255,255,0.7)" }}>1</span>
          </div>
          <p className="text-sm font-semibold text-white">Add this line to your website</p>
        </div>
        <div style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }} className="p-4 flex items-start gap-3">
          <code className="text-sm" style={{ color: "rgba(255,255,255,0.7)", flex: 1, overflowWrap: "break-word", fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
            {embedCode}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-all btn-primary"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)" }} className="p-5 mb-6">
        <p className="section-tag">What this does</p>
        <div className="space-y-3">
          {[
            {
              icon: "🔍",
              title: "AI agent discovery",
              desc: "Adds a machine-readable link tag so AI agents crawling your site can find your full brand identity profile automatically.",
            },
            {
              icon: "🍪",
              title: "Session token capture",
              desc: "When ESINA sends a consumer to your site, we include an esina_token in the URL. The script captures and stores it in a first-party cookie.",
            },
            {
              icon: "📊",
              title: "Conversion attribution",
              desc: "When a customer completes a purchase on your Shopify store, the script fires a conversion event back to ESINA automatically — no extra setup needed.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p style={{ color: "rgba(255,255,255,0.45)" }} className="text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div style={{ width: "24px", height: "24px", borderRadius: "2px", background: "rgba(0,0,0,0.15)" }} className="flex items-center justify-center">
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(255,255,255,0.7)" }}>2</span>
          </div>
          <p className="text-sm font-semibold text-white">Your brand.md is live</p>
        </div>
        <div style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }} className="p-4 flex items-center justify-between gap-3">
          <code style={{ color: "rgba(255,255,255,0.45)" }} className="text-sm truncate font-mono">{brandMdUrl}</code>
          <a
            href={brandMdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium btn-secondary transition-all"
          >
            Preview →
          </a>
        </div>
      </div>

      <div style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px" }} className="p-4 mb-6 text-center">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>You only pay when you make money.</span> Attribution is free. ESINA takes a small revenue share only on verified conversions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`/audit/${brandId}`}
          className="btn-primary flex-1 text-center px-6 py-2.5 text-sm transition-colors"
        >
          View AI Perception Audit →
        </a>
        <a
          href="/brands"
          className="btn-secondary flex-1 text-center px-6 py-2.5 text-sm transition-colors"
        >
          Browse Brand Directory
        </a>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState("");
  const [error, setError] = useState("");
  const [completedBrandId, setCompletedBrandId] = useState<string | null>(null);

  const update = useCallback((key: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = (): boolean => {
    if (step === 1) return !!(form.brand_name.trim() && form.contact_email.trim() && form.category && form.price_tier);
    if (step === 2) return (form.archetypes as []).length > 0;
    if (step === 3) return (form.values as []).length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      setSubmitStage("Saving your brand profile...");
      await new Promise((r) => setTimeout(r, 500));
      setSubmitStage("Generating identity embedding...");

      const res = await fetch("/api/submit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setSubmitStage("Running AI Perception Audit...");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSubmitStage("Setting up your attribution pixel...");
      const { brandId } = await res.json();
      await new Promise((r) => setTimeout(r, 600));
      setCompletedBrandId(brandId);
      setSubmitting(false);
      setSubmitStage("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setSubmitting(false);
      setSubmitStage("");
    }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  if (completedBrandId) {
    return (
      <div className="min-h-screen">
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-goldman text-white tracking-[3px] text-base uppercase">
              ESINA
            </Link>
            <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Install Tracking</span>
          </div>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.8)", width: "100%" }} />
        </header>
        <main className="max-w-2xl mx-auto px-6 py-10">
          <StepInstall brandId={completedBrandId} brandName={form.brand_name} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-goldman text-white tracking-[3px] text-base uppercase">
            ESINA
          </Link>
          <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Brand Identity Questionnaire</span>
        </div>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.12)" }}>
          <div
            style={{ height: "100%", background: "rgba(255,255,255,0.9)", width: `${progress}%` }}
            className="transition-all duration-500"
          />
        </div>
      </header>

      {submitting && (
        <div style={{ position: "fixed", inset: "0", background: "rgba(100,100,96,0.92)", backdropFilter: "blur(12px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="text-center">
            <div style={{ width: "48px", height: "48px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "rgba(255,255,255,0.9)", borderRadius: "2px", animation: "spin 1s linear infinite" }} className="mx-auto mb-4" />
            <p className="text-white font-goldman mb-1">{submitStage || "Processing..."}</p>
            <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm">This takes about 15-20 seconds</p>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-6 py-10">
        {step === 1 && (
          <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "16px 20px" }}>
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Prefer to just talk about your brand?</p>
              <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">Try our conversational onboarding — it takes 3 minutes.</p>
            </div>
            <Link
              href="/onboard"
              className="flex-shrink-0 text-xs px-4 py-2 btn-secondary whitespace-nowrap"
            >
              Try it →
            </Link>
          </div>
        )}

        {step === 1 && <StepBasics data={form} update={update} />}
        {step === 2 && <StepIdentity data={form} update={update} />}
        {step === 3 && <StepValues data={form} update={update} />}
        {step === 4 && <StepAesthetic data={form} update={update} />}
        {step === 5 && <StepStatusCommunity data={form} update={update} />}
        {step === 6 && <StepStory data={form} update={update} />}
        {step === 7 && <StepReview data={form} onEdit={(s) => setStep(s)} />}

        {error && (
          <div className="mt-4 p-4" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "2px",
                  borderRadius: "2px",
                  background: i + 1 === step ? "rgba(255,255,255,0.9)" : i + 1 < step ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  width: i + 1 === step ? "16px" : i + 1 < step ? "8px" : "4px",
                }}
                className="transition-all"
              />
            ))}
          </div>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Run My Audit →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

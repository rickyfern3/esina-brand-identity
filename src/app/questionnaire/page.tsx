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

const CATEGORIES = ["Fashion", "Food & Beverage", "Beauty & Personal Care", "Health & Wellness", "Home & Lifestyle", "Tech & Accessories", "Other"];
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
const COMMUNITIES = ["Skate", "Yoga / Wellness", "Tech", "Streetwear", "Outdoor / Adventure", "Fitness", "Art", "Music", "Gaming", "Fashion", "Food / Cooking", "Travel", "Sustainability", "Parenting", "Luxury", "Startup / Entrepreneur", "Creative"];
const TREND_ALIGNMENT = ["quiet_luxury", "anti_corporate", "functional_fashion", "clean_beauty", "regenerative", "slow_fashion", "gender_neutral", "founder_led", "community_commerce", "ai_native", "heritage_revival", "dopamine_dressing"];

const TOTAL_STEPS = 7;

// ── Reusable UI components ───────────────────────────────────────────

function OptionCard({ selected, onClick, children, className = "" }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-xl px-4 py-3 text-left transition-all ${
        selected
          ? "border-violet-500 bg-violet-950/40 text-white"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600 hover:text-white"
      } ${className}`}
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
          className={`rounded-full px-3 py-1.5 text-sm border transition-all ${
            selected.includes(o)
              ? "border-violet-500 bg-violet-950/40 text-violet-200"
              : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          }`}
        >
          {renderOption ? renderOption(o) : o}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">{children}</p>;
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {hint && <p className="text-xs text-zinc-500 mb-3">{hint}</p>}
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
      className={`w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-sm ${className}`}
    />
  );
}

function TextArea({ value, onChange, placeholder, maxLength, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; rows?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-sm resize-none"
      />
      {maxLength && (
        <p className="text-right text-xs text-zinc-600 mt-1">
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
      <h2 className="text-2xl font-bold text-white mb-1">Let's start with the essentials.</h2>
      <p className="text-zinc-400 mb-8">Basic info to set up your brand profile.</p>

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
              className={`rounded-full px-3 py-1.5 text-sm border transition-all ${
                (data.platforms as string[]).includes(p)
                  ? "border-violet-500 bg-violet-950/40 text-violet-200"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
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
                <span className="text-xs text-zinc-500">{t.desc}</span>
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
      // Remove it
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
      <h2 className="text-2xl font-bold text-white mb-1">Who are you?</h2>
      <p className="text-zinc-400 mb-8">Define the core of your brand identity.</p>

      <FieldGroup
        label="What does choosing your brand say about the person who buys it?"
        hint="Up to 3 statements. These feed directly into your identity profile."
      >
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
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
                className={`border rounded-xl p-4 text-left transition-all relative ${
                  isSelected
                    ? "border-violet-500 bg-violet-950/40"
                    : selectedArchetypes.length >= 3
                    ? "border-zinc-800 bg-zinc-900/20 opacity-40 cursor-not-allowed"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
                }`}
              >
                {rank && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-violet-300 bg-violet-900/60 px-1.5 py-0.5 rounded-full">
                    {rank}
                  </span>
                )}
                <p className="text-sm font-semibold text-white mb-1">{a.label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{a.description}</p>
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
      <h2 className="text-2xl font-bold text-white mb-1">What do you stand for?</h2>
      <p className="text-zinc-400 mb-8">Your values define what your brand attracts and what it repels.</p>

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
                <span className="text-xs text-zinc-500">{s.desc}</span>
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
      <h2 className="text-2xl font-bold text-white mb-1">How do you look and sound?</h2>
      <p className="text-zinc-400 mb-8">Your visual and verbal identity signals.</p>

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
              className={`rounded-lg px-3 py-2 text-sm border transition-all ${
                (data.style_tags as string[]).includes(tag)
                  ? "border-violet-500 bg-violet-950/40 text-violet-200"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
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
              <p className="text-xs text-zinc-500 mt-0.5">{d.desc}</p>
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
                <span className="text-xs text-zinc-500">{v.desc}</span>
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
              <p className="text-xs text-zinc-500 mt-0.5">{h.desc}</p>
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
      <h2 className="text-2xl font-bold text-white mb-1">Where do you fit in culture?</h2>
      <p className="text-zinc-400 mb-8">How your brand signals status and which tribes it belongs to.</p>

      <FieldGroup label="Status Signal" hint="How does your brand communicate its value in culture?">
        <div className="grid grid-cols-1 gap-2">
          {STATUS_SIGNALS.map((s) => (
            <OptionCard key={s.id} selected={data.status_signal_type === s.id} onClick={() => update("status_signal_type", s.id)}>
              <p className="text-sm font-medium text-white">{s.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
            </OptionCard>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Logo Visibility">
        <div className="grid grid-cols-2 gap-2">
          {LOGO_VISIBILITY.map((l) => (
            <OptionCard key={l.id} selected={data.logo_visibility === l.id} onClick={() => update("logo_visibility", l.id)}>
              <p className="text-sm font-medium">{l.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{l.desc}</p>
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
              className={`rounded-full px-3 py-1.5 text-sm border transition-all ${
                (data.communities as string[]).includes(c.toLowerCase().replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_"))
                  ? "border-violet-500 bg-violet-950/40 text-violet-200"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
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
              className={`rounded-full px-3 py-1.5 text-sm border transition-all ${
                (data.trend_alignment as string[]).includes(t)
                  ? "border-violet-500 bg-violet-950/40 text-violet-200"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
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
            className="px-4 py-2 bg-violet-800 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.brand_adjacencies as string[]).map((b) => (
            <span key={b} className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 text-sm px-3 py-1 rounded-full">
              {b}
              <button
                type="button"
                onClick={() => update("brand_adjacencies", (data.brand_adjacencies as string[]).filter((x) => x !== b))}
                className="text-zinc-500 hover:text-white"
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
      <h2 className="text-2xl font-bold text-white mb-1">Why do you exist?</h2>
      <p className="text-zinc-400 mb-8">The narrative that makes your brand human. This goes directly into your identity profile.</p>

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
    <div className="border border-zinc-800 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <button type="button" onClick={() => onEdit(step)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Edit</button>
      </div>
      {children}
    </div>
  );

  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md mr-1.5 mb-1.5">{children}</span>
  );

  const Field = ({ label, value }: { label: string; value?: string | null }) => value ? (
    <div className="mb-2">
      <span className="text-xs text-zinc-500">{label}: </span>
      <span className="text-xs text-zinc-300">{value}</span>
    </div>
  ) : null;

  return (
    <div>
      <SectionLabel>Step 7 of 7 — Review & Submit</SectionLabel>
      <h2 className="text-2xl font-bold text-white mb-1">Almost there.</h2>
      <p className="text-zinc-400 mb-2">Review your brand profile before we run your AI Perception Audit.</p>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">Profile Completeness</p>
          <p className="text-2xl font-bold text-white">{completeness}%</p>
        </div>
        <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all" style={{ width: `${completeness}%` }} />
        </div>
      </div>

      <Section title="Basics" step={1}>
        <Field label="Brand" value={data.brand_name} />
        <Field label="Category" value={data.category} />
        <Field label="Price" value={data.price_tier} />
        <Field label="Email" value={data.contact_email} />
        {(data.platforms as string[]).length > 0 && <div><span className="text-xs text-zinc-500">Platforms: </span>{(data.platforms as string[]).map((p) => <Tag key={p}>{p}</Tag>)}</div>}
      </Section>

      <Section title="Identity" step={2}>
        {selectedArchetypes.length > 0 && (
          <div className="mb-2"><span className="text-xs text-zinc-500">Archetypes: </span>{selectedArchetypes.map((a) => <Tag key={a.archetype}>{a.archetype}</Tag>)}</div>
        )}
        {(data.identity_statements as string[]).filter(Boolean).map((s, i) => (
          <p key={i} className="text-xs text-zinc-300 italic mb-1">"{s}"</p>
        ))}
      </Section>

      <Section title="Values & Impact" step={3}>
        {(data.values as string[]).length > 0 && <div className="mb-2"><span className="text-xs text-zinc-500">Values: </span>{(data.values as string[]).map((v) => <Tag key={v}>{v.replace(/_/g, " ")}</Tag>)}</div>}
        {(data.anti_values as string[]).length > 0 && <div className="mb-2"><span className="text-xs text-zinc-500">Not: </span>{(data.anti_values as string[]).map((v) => <Tag key={v}>{v.replace(/_/g, " ")}</Tag>)}</div>}
        <Field label="Sustainability" value={data.sustainability_level} />
        <Field label="Emotional resonance" value={data.emotional_resonance} />
      </Section>

      <Section title="Aesthetic" step={4}>
        {(data.style_tags as string[]).length > 0 && <div className="mb-2"><span className="text-xs text-zinc-500">Style: </span>{(data.style_tags as string[]).map((t) => <Tag key={t}>{t.replace(/_/g, " ")}</Tag>)}</div>}
        <Field label="Voice" value={data.voice_tone} />
        <Field label="Visual tone" value={data.visual_tone} />
        <Field label="Design" value={data.design_language} />
      </Section>

      <Section title="Status & Community" step={5}>
        <Field label="Status signal" value={data.status_signal_type?.replace(/_/g, " ")} />
        {(data.communities as string[]).length > 0 && <div className="mb-2"><span className="text-xs text-zinc-500">Communities: </span>{(data.communities as string[]).map((c) => <Tag key={c}>{c.replace(/_/g, " ")}</Tag>)}</div>}
        {(data.brand_adjacencies as string[]).length > 0 && <div><span className="text-xs text-zinc-500">Adjacent brands: </span>{(data.brand_adjacencies as string[]).map((b) => <Tag key={b}>{b}</Tag>)}</div>}
      </Section>

      <Section title="Your Story" step={6}>
        {data.origin_story && <p className="text-xs text-zinc-300 line-clamp-2 mb-1">{data.origin_story}</p>}
        {data.differentiation_claim && <p className="text-xs text-zinc-400 italic">"{data.differentiation_claim}"</p>}
      </Section>

      <div className="bg-violet-950/30 border border-violet-800/30 rounded-xl p-5 mt-6">
        <p className="text-sm font-semibold text-white mb-1">What happens when you submit?</p>
        <ol className="space-y-1">
          {["Your profile is saved to ESINA's database", "We generate your brand's identity embedding", "We run an AI Perception Audit using GPT-4o-mini", "You're redirected to your Alignment Report"].map((step, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs text-zinc-500 mt-3">This takes about 15-20 seconds.</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState("");
  const [error, setError] = useState("");

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

      setSubmitStage("Building your report...");
      const { brandId } = await res.json();
      await new Promise((r) => setTimeout(r, 500));
      router.push(`/audit/${brandId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setSubmitting(false);
      setSubmitStage("");
    }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/60 sticky top-0 z-10 bg-[#09090b]/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/match" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">ESINA</span>
          </Link>
          <span className="text-xs text-zinc-500">Brand Identity Questionnaire</span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-900">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Loading overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium mb-1">{submitStage || "Processing..."}</p>
            <p className="text-zinc-500 text-sm">This takes about 15-20 seconds</p>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {step === 1 && <StepBasics data={form} update={update} />}
        {step === 2 && <StepIdentity data={form} update={update} />}
        {step === 3 && <StepValues data={form} update={update} />}
        {step === 4 && <StepAesthetic data={form} update={update} />}
        {step === 5 && <StepStatusCommunity data={form} update={update} />}
        {step === 6 && <StepStory data={form} update={update} />}
        {step === 7 && <StepReview data={form} onEdit={(s) => setStep(s)} />}

        {error && (
          <div className="mt-4 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i + 1 === step ? "w-4 h-2 bg-violet-500" :
                  i + 1 < step ? "w-2 h-2 bg-violet-700" :
                  "w-2 h-2 bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Run My Audit →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

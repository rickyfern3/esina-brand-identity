"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import LivePreview, { AccumulatedProfile, mergeMapping } from "./LivePreview";
import { InstallGuide } from "./InstallGuide";
import {
  SONGS, NEIGHBORHOODS, DINNER_GUESTS, SCENT_PILLS, TEXTURE_PILLS, ENEMY_PILLS,
  searchSongs, searchNeighborhoods, searchGuests,
  type Song, type Neighborhood,
} from "./card-data";

// ── Types ──────────────────────────────────────────────────────────────

interface CardState {
  // Card 1
  brandName: string;
  foundingYear: string;
  productDescription: string;
  // Card 2
  selectedSong: Song | null;
  customSong: string;
  songSlider: number;
  // Card 3
  selectedScents: string[];
  customScent: string;
  scentSlider: number;
  // Card 4
  selectedNeighborhood: Neighborhood | null;
  customNeighborhood: string;
  neighborhoodSlider: number;
  // Card 5
  guest1: string;
  guest2: string;
  guest3: string;
  respectedOrLoved: "respected" | "loved" | null;
  // Card 6
  selectedEnemies: string[];
  customEnemy: string;
  enemySlider: number;
  // Card 7
  selectedTextures: string[];
  textureSlider: number;
  // Card 8
  moodboardImages: string[];
  moodboardDescription: string;
  famousOrMysterious: "famous" | "mysterious" | null;
  // Card 9
  randomMoment: string;
  firstOrBest: "first" | "best" | null;
  loudOrQuiet: "loud" | "quiet" | null;
  // Meta
  contactEmail: string;
}

interface RevealData {
  brandId: string;
  brandName: string;
  auditScore: number | null;
  profile: {
    archetypes: Array<{ archetype: string; weight: number; primary: boolean }>;
    values: string[];
    anti_values: string[];
    style_tags: string[];
    communities: string[];
    status_signal_type: string;
    emotional_resonance: string;
    identity_text: string;
    identity_statements: string[];
    one_sentence_description: string;
    recommendations: string[];
  };
}

const INITIAL_STATE: CardState = {
  brandName: "", foundingYear: "", productDescription: "",
  selectedSong: null, customSong: "", songSlider: 4,
  selectedScents: [], customScent: "", scentSlider: 4,
  selectedNeighborhood: null, customNeighborhood: "", neighborhoodSlider: 4,
  guest1: "", guest2: "", guest3: "", respectedOrLoved: null,
  selectedEnemies: [], customEnemy: "", enemySlider: 4,
  selectedTextures: [], textureSlider: 4,
  moodboardImages: [], moodboardDescription: "", famousOrMysterious: null,
  randomMoment: "", firstOrBest: null, loudOrQuiet: null,
  contactEmail: "",
};

const INITIAL_PROFILE: AccumulatedProfile = {
  brandName: "", archetypeWeights: {}, styleItems: [], valueItems: [],
  communityItems: [], statusSignal: "", emotionalResonance: "", cardsCompleted: 0, isLoading: false,
};

// ── Shared UI components ───────────────────────────────────────────────

function CardHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="font-goldman text-2xl md:text-3xl text-white mb-6 leading-tight">{children}</h2>;
}

function Slider({ value, onChange, leftLabel, rightLabel }: {
  value: number; onChange: (v: number) => void; leftLabel: string; rightLabel: string;
}) {
  return (
    <div>
      <input
        type="range" min={1} max={7} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none cursor-pointer rounded-full"
        style={{ background: `linear-gradient(to right, rgba(255,255,255,0.6) ${((value-1)/6)*100}%, rgba(255,255,255,0.12) ${((value-1)/6)*100}%)` }}
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{leftLabel}</span>
        <span className="text-xs font-goldman" style={{ color: "rgba(255,255,255,0.5)" }}>{value}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{rightLabel}</span>
      </div>
    </div>
  );
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm mr-2 mb-2 transition-all duration-150"
      style={{
        background: selected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
        border: selected ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "2px",
        color: selected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
      }}
    >
      {label}
    </button>
  );
}

function TradeOff({ options, value, onChange }: {
  options: [{ label: string; value: string }, { label: string; value: string }];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-3 text-sm transition-all duration-150"
          style={{
            background: value === opt.value ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
            border: value === opt.value ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "2px",
            color: value === opt.value ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
            fontFamily: "'General Sans', sans-serif",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline = false }: {
  value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  const style = {
    background: "rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "2px",
    color: "white",
    width: "100%",
    padding: "12px 14px",
    fontSize: "0.875rem",
    fontFamily: "'General Sans', sans-serif",
    outline: "none",
    resize: "none" as const,
  };
  if (multiline) {
    return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={style} className="placeholder-white/25" />;
  }
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} className="placeholder-white/25" />;
}

function SearchList<T extends { id: string; name?: string; title?: string; artist?: string }>({
  items, onSelect, selected, renderItem, placeholder,
}: {
  items: T[]; onSelect: (item: T) => void; selected: T | null;
  renderItem: (item: T) => string; placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = query.length > 0 ? items.filter(i => renderItem(i).toLowerCase().includes(query.toLowerCase())).slice(0, 8) : items.slice(0, 8);

  return (
    <div className="relative">
      <input
        type="text"
        value={selected ? renderItem(selected) : query}
        onChange={e => { setQuery(e.target.value); setOpen(true); if (selected) onSelect(null as unknown as T); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "white", width: "100%", padding: "12px 14px", fontSize: "0.875rem", fontFamily: "'General Sans', sans-serif", outline: "none" }}
        className="placeholder-white/25"
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto"
          style={{ background: "rgba(40,40,38,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px" }}
        >
          {filtered.map(item => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'General Sans', sans-serif" }}
              onMouseDown={() => { onSelect(item); setOpen(false); setQuery(""); }}
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GuestAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const suggestions = value.length > 1 ? searchGuests(value).slice(0, 6) : [];
  return (
    <div className="relative">
      <input
        type="text" value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "white", width: "100%", padding: "12px 14px", fontSize: "0.875rem", fontFamily: "'General Sans', sans-serif", outline: "none" }}
        className="placeholder-white/25"
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto"
          style={{ background: "rgba(40,40,38,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px" }}
        >
          {suggestions.map(g => (
            <button key={g.id} className="w-full text-left px-4 py-2.5 text-sm" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'General Sans', sans-serif" }}
              onMouseDown={() => { onChange(g.name); setOpen(false); }}>
              {g.name} <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>— {g.domain}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MicButton({ onTranscript, disabled }: { onTranscript: (text: string) => void; disabled?: boolean }) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const toggle = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (recording) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any)?.stop();
      setRecording(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = new SR() as any;
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (e as any).results[0][0].transcript;
      onTranscript(text);
    };
    r.onend = () => setRecording(false);
    recognitionRef.current = r;
    r.start();
    setRecording(true);
  }, [recording, onTranscript]);

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      title={recording ? "stop" : "speak"}
      className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${recording ? "mic-recording" : ""}`}
      style={{
        background: recording ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.08)",
        border: recording ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "2px",
        color: recording ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.45)",
      }}
    >
      {recording ? (
        <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
      ) : (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0014 0" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  );
}

// ── Individual Card components ─────────────────────────────────────────

function Card1({ state, onChange }: { state: CardState; onChange: (u: Partial<CardState>) => void }) {
  const canProceed = state.brandName.trim().length > 0 && state.productDescription.trim().length > 0;
  return (
    <div>
      <CardHeader>let's start with the basics.</CardHeader>
      <div className="space-y-4">
        <div>
          <label className="section-tag block mb-2">what's your brand name?</label>
          <TextInput value={state.brandName} onChange={v => onChange({ brandName: v })} placeholder="Brand Name" />
        </div>
        <div>
          <label className="section-tag block mb-2">when did you start it?</label>
          <TextInput value={state.foundingYear} onChange={v => onChange({ foundingYear: v })} placeholder="e.g. 2019" />
        </div>
        <div>
          <label className="section-tag block mb-2">in one breath, what do you sell?</label>
          <TextInput value={state.productDescription} onChange={v => onChange({ productDescription: v })} placeholder="e.g. hand-dyed linen clothing for people who hate fast fashion" />
        </div>
      </div>
      <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>fill in name + product description to continue</div>
      {!canProceed && <div style={{ height: "1px" }} />}
    </div>
  );
}

function Card2({ state, onChange, onLookup }: { state: CardState; onChange: (u: Partial<CardState>) => void; onLookup: (type: string, value: string) => void }) {
  const [songQuery, setSongQuery] = useState("");
  const songResults = songQuery.length > 0 ? searchSongs(songQuery).slice(0, 8) : SONGS.slice(0, 8);

  const handleSelectSong = (song: Song | null) => {
    onChange({ selectedSong: song, customSong: "" });
    if (song) onLookup("song", `${song.title} by ${song.artist}`);
  };
  const handleCustomSong = (v: string) => {
    onChange({ customSong: v, selectedSong: null });
  };

  return (
    <div>
      <CardHeader>a song comes on and you instantly think — that's us. which one?</CardHeader>
      <div className="space-y-4">
        {/* Song search */}
        <div className="relative">
          <input
            type="text"
            value={state.selectedSong ? `${state.selectedSong.title} — ${state.selectedSong.artist}` : songQuery}
            onChange={e => { setSongQuery(e.target.value); if (state.selectedSong) onChange({ selectedSong: null }); }}
            placeholder="search songs…"
            style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "white", width: "100%", padding: "12px 14px", fontSize: "0.875rem", fontFamily: "'General Sans', sans-serif", outline: "none" }}
            className="placeholder-white/25"
          />
          {!state.selectedSong && (
            <div className="mt-1 max-h-44 overflow-y-auto" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", background: "rgba(30,30,28,0.95)" }}>
              {songResults.map(s => (
                <button key={s.id} className="w-full text-left px-4 py-2.5" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'General Sans', sans-serif", fontSize: "0.875rem" }}
                  onClick={() => { handleSelectSong(s); setSongQuery(""); }}>
                  {s.title} <span style={{ color: "rgba(255,255,255,0.35)" }}>— {s.artist}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom song */}
        <div>
          <label className="section-tag block mb-2">not on the list? type it</label>
          <div className="flex gap-2">
            <TextInput value={state.customSong} onChange={handleCustomSong} placeholder="Song title — Artist name" />
            <MicButton onTranscript={v => handleCustomSong(v)} />
          </div>
        </div>

        <div>
          <label className="section-tag block mb-2">this song feels more…</label>
          <Slider value={state.songSlider} onChange={v => onChange({ songSlider: v })} leftLabel="raw & rebellious" rightLabel="polished & serene" />
        </div>
      </div>
    </div>
  );
}

function Card3({ state, onChange, onLookup }: { state: CardState; onChange: (u: Partial<CardState>) => void; onLookup: (type: string, value: string) => void }) {
  const toggleScent = (s: string) => {
    const isSelected = state.selectedScents.includes(s);
    if (isSelected) {
      onChange({ selectedScents: state.selectedScents.filter(x => x !== s) });
    } else if (state.selectedScents.length < 4) {
      onChange({ selectedScents: [...state.selectedScents, s] });
      onLookup("scent", s);
    }
  };
  return (
    <div>
      <CardHeader>what does your brand smell like? not a perfume — the actual scent.</CardHeader>
      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>pick 2–4</p>
      <div className="mb-4 flex flex-wrap">
        {SCENT_PILLS.map(s => <Pill key={s} label={s} selected={state.selectedScents.includes(s)} onClick={() => toggleScent(s)} />)}
      </div>
      <div className="mb-4">
        <label className="section-tag block mb-2">or describe it yourself</label>
        <div className="flex gap-2">
          <TextInput value={state.customScent} onChange={v => onChange({ customScent: v })} placeholder="e.g. dusty library, old vinyl records…" />
          <MicButton onTranscript={v => onChange({ customScent: v })} />
        </div>
      </div>
      <Slider value={state.scentSlider} onChange={v => onChange({ scentSlider: v })} leftLabel="nostalgic & warm" rightLabel="fresh & modern" />
    </div>
  );
}

function Card4({ state, onChange, onLookup }: { state: CardState; onChange: (u: Partial<CardState>) => void; onLookup: (type: string, value: string) => void }) {
  const handleSelect = (n: Neighborhood | null) => {
    onChange({ selectedNeighborhood: n, customNeighborhood: "" });
    if (n) onLookup("neighborhood", n.name);
  };
  return (
    <div>
      <CardHeader>where would your brand live? not where it's located — where it belongs.</CardHeader>
      <div className="space-y-4">
        <SearchList<Neighborhood>
          items={NEIGHBORHOODS}
          onSelect={handleSelect}
          selected={state.selectedNeighborhood}
          renderItem={n => `${n.name}${n.city ? `, ${n.city}` : ""}${n.era ? ` (${n.era})` : ""}`}
          placeholder="search neighborhoods…"
        />
        <div>
          <label className="section-tag block mb-2">or type your own</label>
          <div className="flex gap-2">
            <TextInput value={state.customNeighborhood} onChange={v => { onChange({ customNeighborhood: v, selectedNeighborhood: null }); }} placeholder="e.g. Oaxaca city center, early 2000s Portland…" />
            <MicButton onTranscript={v => onChange({ customNeighborhood: v })} />
          </div>
        </div>
        <Slider value={state.neighborhoodSlider} onChange={v => onChange({ neighborhoodSlider: v })} leftLabel="underground & raw" rightLabel="established & refined" />
      </div>
    </div>
  );
}

function Card5({ state, onChange }: { state: CardState; onChange: (u: Partial<CardState>) => void }) {
  return (
    <div>
      <CardHeader>dinner party for 3. alive, dead, fictional, real. who's at the table?</CardHeader>
      <div className="space-y-3 mb-6">
        {[
          { key: "guest1" as const, placeholder: "first guest — type a name" },
          { key: "guest2" as const, placeholder: "second guest" },
          { key: "guest3" as const, placeholder: "third guest" },
        ].map(({ key, placeholder }) => (
          <GuestAutocomplete key={key} value={state[key]} onChange={v => onChange({ [key]: v })} placeholder={placeholder} />
        ))}
      </div>
      <div>
        <label className="section-tag block mb-3">your brand is deeply…</label>
        <TradeOff
          options={[{ label: "deeply respected", value: "respected" }, { label: "deeply loved", value: "loved" }]}
          value={state.respectedOrLoved}
          onChange={v => onChange({ respectedOrLoved: v as "respected" | "loved" })}
        />
      </div>
    </div>
  );
}

function Card6({ state, onChange, onLookup }: { state: CardState; onChange: (u: Partial<CardState>) => void; onLookup: (type: string, value: string) => void }) {
  const toggleEnemy = (e: string) => {
    if (state.selectedEnemies.includes(e)) {
      onChange({ selectedEnemies: state.selectedEnemies.filter(x => x !== e) });
    } else {
      onChange({ selectedEnemies: [...state.selectedEnemies, e] });
      onLookup("enemy", e);
    }
  };
  return (
    <div>
      <CardHeader>what popular thing does your brand exist to fight against?</CardHeader>
      <div className="mb-4 flex flex-wrap">
        {ENEMY_PILLS.map(e => <Pill key={e} label={e} selected={state.selectedEnemies.includes(e)} onClick={() => toggleEnemy(e)} />)}
      </div>
      <div className="mb-4">
        <label className="section-tag block mb-2">or name your own enemy</label>
        <div className="flex gap-2">
          <TextInput value={state.customEnemy} onChange={v => onChange({ customEnemy: v })} placeholder="e.g. vanilla-safe DTC startups…" />
          <MicButton onTranscript={v => onChange({ customEnemy: v })} />
        </div>
      </div>
      <div>
        <label className="section-tag block mb-2">how loud is your brand about this?</label>
        <Slider value={state.enemySlider} onChange={v => onChange({ enemySlider: v })} leftLabel="quiet resistance" rightLabel="loud rebellion" />
      </div>
    </div>
  );
}

function Card7({ state, onChange, onLookup }: { state: CardState; onChange: (u: Partial<CardState>) => void; onLookup: (type: string, value: string) => void }) {
  const toggleTexture = (t: string) => {
    if (state.selectedTextures.includes(t)) {
      onChange({ selectedTextures: state.selectedTextures.filter(x => x !== t) });
    } else if (state.selectedTextures.length < 3) {
      onChange({ selectedTextures: [...state.selectedTextures, t] });
      onLookup("texture", t);
    }
  };
  return (
    <div>
      <CardHeader>if your brand was a texture you could touch, what would it feel like?</CardHeader>
      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>pick 2–3</p>
      <div className="mb-4 flex flex-wrap">
        {TEXTURE_PILLS.map(t => <Pill key={t} label={t} selected={state.selectedTextures.includes(t)} onClick={() => toggleTexture(t)} />)}
      </div>
      <div>
        <label className="section-tag block mb-2">this texture feels more…</label>
        <Slider value={state.textureSlider} onChange={v => onChange({ textureSlider: v })} leftLabel="handmade & imperfect" rightLabel="precise & engineered" />
      </div>
    </div>
  );
}

function Card8({ state, onChange }: { state: CardState; onChange: (u: Partial<CardState>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 5 - state.moodboardImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ moodboardImages: [...state.moodboardImages, reader.result as string].slice(0, 5) });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <CardHeader>show us your brand. upload 1–5 images that ARE you.</CardHeader>
      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>photos, textures, places, objects, screenshots — anything visual that feels like your brand.</p>

      {/* Upload zone */}
      <div
        className="mb-4 flex flex-col items-center justify-center cursor-pointer"
        style={{ border: "2px dashed rgba(255,255,255,0.18)", borderRadius: "4px", padding: "32px", minHeight: "100px" }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        {state.moodboardImages.length === 0 ? (
          <>
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>drag & drop or tap to upload</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>jpg, png, webp · max 5 images</p>
          </>
        ) : (
          <div className="flex flex-wrap gap-2 w-full justify-center">
            {state.moodboardImages.map((img, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-16 w-16 object-cover" style={{ borderRadius: "2px" }} />
                <button
                  onClick={e => { e.stopPropagation(); onChange({ moodboardImages: state.moodboardImages.filter((_, j) => j !== i) }); }}
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs"
                  style={{ background: "rgba(0,0,0,0.7)", borderRadius: "50%", color: "white" }}
                >×</button>
              </div>
            ))}
            {state.moodboardImages.length < 5 && (
              <div className="h-16 w-16 flex items-center justify-center" style={{ border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "2px", color: "rgba(255,255,255,0.3)", fontSize: "1.5rem" }}>+</div>
            )}
          </div>
        )}
      </div>

      {/* Fallback description */}
      <div className="mb-4">
        <label className="section-tag block mb-2">or describe what you'd show us</label>
        <div className="flex gap-2">
          <TextInput value={state.moodboardDescription} onChange={v => onChange({ moodboardDescription: v })} placeholder="colors, textures, scenes, vibes — paint the picture" multiline />
          <MicButton onTranscript={v => onChange({ moodboardDescription: v })} />
        </div>
      </div>

      <div>
        <label className="section-tag block mb-3">your brand is…</label>
        <TradeOff
          options={[{ label: "famous", value: "famous" }, { label: "mysterious", value: "mysterious" }]}
          value={state.famousOrMysterious}
          onChange={v => onChange({ famousOrMysterious: v as "famous" | "mysterious" })}
        />
      </div>
    </div>
  );
}

function Card9({ state, onChange }: { state: CardState; onChange: (u: Partial<CardState>) => void }) {
  return (
    <div>
      <CardHeader>almost done. two last things.</CardHeader>
      <div className="space-y-6">
        <div>
          <label className="section-tag block mb-2">describe a random moment that feels like your brand. not a product — a scene.</label>
          <div className="flex gap-2">
            <TextInput value={state.randomMoment} onChange={v => onChange({ randomMoment: v })} placeholder="e.g. 6am light through a warehouse window, a half-finished cup of coffee, the sound of a vinyl crackle…" multiline />
            <MicButton onTranscript={v => onChange({ randomMoment: v })} />
          </div>
        </div>

        <div>
          <label className="section-tag block mb-3">your brand would rather be…</label>
          <div className="space-y-3">
            <TradeOff
              options={[{ label: "first", value: "first" }, { label: "best", value: "best" }]}
              value={state.firstOrBest}
              onChange={v => onChange({ firstOrBest: v as "first" | "best" })}
            />
            <TradeOff
              options={[{ label: "loud", value: "loud" }, { label: "quiet", value: "quiet" }]}
              value={state.loudOrQuiet}
              onChange={v => onChange({ loudOrQuiet: v as "loud" | "quiet" })}
            />
          </div>
        </div>

        <div>
          <label className="section-tag block mb-2">where should we send your brand audit?</label>
          <TextInput value={state.contactEmail} onChange={v => onChange({ contactEmail: v })} placeholder="you@brand.com" />
        </div>
      </div>
    </div>
  );
}

// ── Reveal page ────────────────────────────────────────────────────────

function RevealPage({ data, onInstall, onBack }: { data: RevealData; onInstall: () => void; onBack: () => void }) {
  const archetypes = (data.profile.archetypes || []).sort((a, b) => b.weight - a.weight);
  const scoreColor = data.auditScore !== null
    ? data.auditScore >= 65 ? "#4ade80" : data.auditScore >= 40 ? "#fbbf24" : "#f87171"
    : "rgba(255,255,255,0.4)";
  const scoreNote = data.auditScore !== null
    ? data.auditScore >= 65 ? "AI recognizes your brand clearly" : data.auditScore >= 40 ? "some identity gaps detected" : "significant gaps — great time to close them"
    : "";

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto fade-up-1">
      <p className="section-tag text-center mb-8">your brand identity profile</p>

      <h1 className="font-goldman text-4xl text-white text-center mb-10">{data.brandName}</h1>

      {/* Audit score */}
      {data.auditScore !== null && (
        <div
          className="mb-8 px-6 py-5 text-center"
          style={{ background: "rgba(0,0,0,0.15)", borderRadius: "2px", border: `1px solid ${scoreColor}40` }}
        >
          <p className="section-tag mb-2">ai perception score</p>
          <p className="font-goldman text-4xl mb-1" style={{ color: scoreColor }}>{data.auditScore}<span className="text-xl">/100</span></p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{scoreNote}</p>
        </div>
      )}

      {/* One-sentence description */}
      {data.profile.one_sentence_description && (
        <div className="mb-8 px-4 py-4" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>"{data.profile.one_sentence_description}"</p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>— AI's perception of {data.brandName}</p>
        </div>
      )}

      {/* Archetypes */}
      {archetypes.length > 0 && (
        <div className="mb-8">
          <p className="section-tag mb-4">archetypes</p>
          {archetypes.slice(0, 4).map(a => (
            <div key={a.archetype} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm capitalize" style={{ color: "rgba(255,255,255,0.75)" }}>{a.archetype}</span>
                <span className="text-sm font-goldman" style={{ color: "rgba(255,255,255,0.5)" }}>{Math.round(a.weight * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.round(a.weight * 100)}%`, background: "rgba(255,255,255,0.6)", transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Values + Anti-values */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="section-tag mb-3">values</p>
          <div className="flex flex-wrap">
            {(data.profile.values || []).map(v => (
              <span key={v} className="text-xs px-2 py-1 mr-1.5 mb-1.5" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "rgba(255,255,255,0.7)" }}>{v.replace(/_/g," ")}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="section-tag mb-3">not this</p>
          <div className="flex flex-wrap">
            {(data.profile.anti_values || []).map(v => (
              <span key={v} className="text-xs px-2 py-1 mr-1.5 mb-1.5" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "2px", color: "rgba(252,165,165,0.7)" }}>{v.replace(/_/g," ")}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Style tags */}
      {(data.profile.style_tags || []).length > 0 && (
        <div className="mb-8">
          <p className="section-tag mb-3">aesthetic</p>
          <div className="flex flex-wrap">
            {data.profile.style_tags.map(s => (
              <span key={s} className="text-xs px-2 py-1 mr-1.5 mb-1.5" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "2px", color: "rgba(255,255,255,0.7)" }}>{s.replace(/_/g," ")}</span>
            ))}
          </div>
        </div>
      )}

      {/* Identity statements */}
      {(data.profile.identity_statements || []).length > 0 && (
        <div className="mb-10">
          <p className="section-tag mb-3">choosing {data.brandName} says</p>
          {data.profile.identity_statements.map((s, i) => (
            <p key={i} className="text-sm mb-2 pl-3" style={{ color: "rgba(255,255,255,0.65)", borderLeft: "1px solid rgba(255,255,255,0.15)" }}>"{s}"</p>
          ))}
        </div>
      )}

      <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} className="mb-8" />

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <a href={`/audit/${data.brandId}`} className="btn-primary w-full py-4 text-sm text-center block">see your full brand.md</a>
        <button onClick={onInstall} className="btn-secondary w-full py-4 text-sm">install on your website</button>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 text-xs text-center"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        something feel off? go back and adjust →
      </button>
    </div>
  );
}

// ── Can proceed logic ──────────────────────────────────────────────────

function canProceed(card: number, state: CardState): boolean {
  switch (card) {
    case 0: return state.brandName.trim().length > 0 && state.productDescription.trim().length > 0;
    case 1: return !!(state.selectedSong || state.customSong.trim().length > 0);
    case 2: return state.selectedScents.length >= 1 || state.customScent.trim().length > 0;
    case 3: return !!(state.selectedNeighborhood || state.customNeighborhood.trim().length > 0);
    case 4: return state.guest1.trim().length > 0 || state.guest2.trim().length > 0;
    case 5: return state.selectedEnemies.length > 0 || state.customEnemy.trim().length > 0;
    case 6: return state.selectedTextures.length >= 1;
    case 7: return state.moodboardImages.length > 0 || state.moodboardDescription.trim().length > 0;
    case 8: return state.randomMoment.trim().length > 0 && !!(state.firstOrBest) && !!(state.loudOrQuiet);
    default: return true;
  }
}

// ── Main CardFlow ──────────────────────────────────────────────────────

interface CardFlowProps {
  onSwitchToChat: () => void;
  onComplete?: (brandId: string, brandName: string) => void;
}

export default function CardFlow({ onSwitchToChat, onComplete }: CardFlowProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [state, setState] = useState<CardState>(INITIAL_STATE);
  const [liveProfile, setLiveProfile] = useState<AccumulatedProfile>(INITIAL_PROFILE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const TOTAL_CARDS = 9;

  const updateState = useCallback((updates: Partial<CardState>) => {
    setState(prev => ({ ...prev, ...updates }));
    // Update brand name in live preview
    if (updates.brandName !== undefined) {
      setLiveProfile(prev => ({ ...prev, brandName: updates.brandName! }));
    }
  }, []);

  // Fetch ontology mapping and merge into live preview
  const handleLookup = useCallback(async (signalType: string, signalValue: string) => {
    setLiveProfile(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`/api/ontology/lookup?type=${encodeURIComponent(signalType)}&value=${encodeURIComponent(signalValue)}`);
      const data = await res.json();
      if (data.found && data.mapping) {
        setLiveProfile(prev => ({ ...prev, ...mergeMapping(prev, data.mapping), isLoading: false }));
      } else {
        // Not in ontology — map custom
        const mapRes = await fetch("/api/ontology/map-custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signal_type: signalType, signal_value: signalValue }),
        });
        const mapData = await mapRes.json();
        if (mapData.mapping) {
          setLiveProfile(prev => ({ ...prev, ...mergeMapping(prev, mapData.mapping), isLoading: false }));
        } else {
          setLiveProfile(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch {
      setLiveProfile(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const goNext = useCallback(() => {
    if (currentCard < TOTAL_CARDS - 1) {
      setAnimDir("forward");
      setAnimKey(k => k + 1);
      setCurrentCard(c => c + 1);
      setLiveProfile(prev => ({ ...prev, cardsCompleted: Math.max(prev.cardsCompleted, currentCard + 1) }));
    }
  }, [currentCard]);

  const goBack = useCallback(() => {
    if (currentCard > 0) {
      setAnimDir("back");
      setAnimKey(k => k + 1);
      setCurrentCard(c => c - 1);
    }
  }, [currentCard]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        brandName: state.brandName,
        foundingYear: state.foundingYear,
        productDescription: state.productDescription,
        song: { selected: state.selectedSong, custom: state.customSong, slider: state.songSlider },
        scent: { selected: state.selectedScents, custom: state.customScent, slider: state.scentSlider },
        neighborhood: { selected: state.selectedNeighborhood, custom: state.customNeighborhood, slider: state.neighborhoodSlider },
        dinnerParty: { guest1: state.guest1, guest2: state.guest2, guest3: state.guest3, respectedOrLoved: state.respectedOrLoved },
        enemies: { selected: state.selectedEnemies, custom: state.customEnemy, slider: state.enemySlider },
        textures: { selected: state.selectedTextures, slider: state.textureSlider },
        moodboard: { images: state.moodboardImages, description: state.moodboardDescription, famousOrMysterious: state.famousOrMysterious },
        final: { randomMoment: state.randomMoment, firstOrBest: state.firstOrBest, loudOrQuiet: state.loudOrQuiet },
        contactEmail: state.contactEmail,
      };
      const res = await fetch("/api/onboard/extract-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setRevealData(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setIsSubmitting(false);
    }
  };

  // ── Render: install guide
  if (showInstall && revealData) {
    return <InstallGuide brandId={revealData.brandId} brandName={revealData.brandName} />;
  }

  // ── Render: reveal
  if (revealData) {
    return (
      <RevealPage
        data={revealData}
        onInstall={() => {
          setShowInstall(true);
          onComplete?.(revealData.brandId, revealData.brandName);
        }}
        onBack={() => setRevealData(null)}
      />
    );
  }

  // ── Render: submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-up-1">
          <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-6" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "rgba(255,255,255,0.8)" }} />
          <p className="font-goldman text-white mb-2">building your brand profile</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>extracting identity · generating embedding · running ai audit</p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>~20–30 seconds</p>
        </div>
      </div>
    );
  }

  const cards = [Card1, Card2, Card3, Card4, Card5, Card6, Card7, Card8, Card9];
  const CurrentCard = cards[currentCard];
  const cardProps = { state, onChange: updateState, onLookup: handleLookup };
  const ok = canProceed(currentCard, state);
  const isLast = currentCard === TOTAL_CARDS - 1;

  return (
    <div className="min-h-screen flex flex-col">

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: "2px", background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full"
          style={{ width: `${((currentCard + 1) / TOTAL_CARDS) * 100}%`, background: "rgba(255,255,255,0.55)", transition: "width 0.4s ease" }}
        />
      </div>

      {/* Progress label */}
      <div className="fixed top-3 right-4 z-50">
        <span className="section-tag text-xs">{currentCard + 1} / {TOTAL_CARDS}</span>
      </div>

      <div className="flex flex-1 min-h-screen">
        {/* Card area (60%) */}
        <div className="flex-1 md:w-[60%] px-6 md:px-10 py-16 flex flex-col">
          <div className="flex-1 max-w-lg">
            {/* Card content with slide animation */}
            <div
              key={animKey}
              style={{
                animation: `slideIn${animDir === "forward" ? "Right" : "Left"} 0.3s ease`,
              }}
            >
              <CurrentCard {...(cardProps as Parameters<typeof CurrentCard>[0])} />
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3 max-w-lg">
            {currentCard > 0 && (
              <button
                onClick={goBack}
                className="px-4 py-3 text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2px", color: "rgba(255,255,255,0.5)" }}
              >
                ← back
              </button>
            )}

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={!ok}
                className="flex-1 py-3 text-sm btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                generate my brand.md
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!ok}
                className="flex-1 py-3 text-sm btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                next →
              </button>
            )}

            <button
              onClick={onSwitchToChat}
              className="px-3 py-3 text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
              title="Switch to conversation mode"
            >
              chat ↗
            </button>
          </div>

          {submitError && (
            <div className="mt-4 px-4 py-3 text-sm max-w-lg" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}>
              {submitError}
            </div>
          )}
        </div>

        {/* Live preview (40%) — desktop only */}
        <div
          className="hidden md:flex w-[40%] flex-col px-8 py-16"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
        >
          <LivePreview profile={liveProfile} />
        </div>
      </div>

      {/* Mobile live preview floating indicator */}
      <div className="md:hidden">
        <LivePreview profile={liveProfile} mobile />
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        input[type=range] { -webkit-appearance: none; appearance: none; }
      `}</style>
    </div>
  );
}

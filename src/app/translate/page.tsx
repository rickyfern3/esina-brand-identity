"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TranslatedConsumerProfile, BrandMatch, IdentityBlend } from "@/app/api/translate-identity/route";

// ── Seed examples ──────────────────────────────────────────────────────

const SEED_SIGNALS = {
  purchase_history: [
    "Alighieri jewelry",
    "Aesop skincare",
    "Margaret Howell linen trousers",
    "Hay furniture",
    "Muji notebooks",
    "Le Labo Santal 33",
  ],
  search_queries: [
    "quiet luxury brands under £200",
    "minimalist jewelry no logo",
    "slow fashion womenswear UK",
    "artisanal ceramics London",
    "independent fashion labels",
  ],
  interests: [
    "architecture",
    "contemporary art",
    "slow living",
    "independent bookshops",
    "ceramics",
    "Apartamento magazine",
  ],
  free_text:
    "I care deeply about craft and who made something. I buy things to last, not to signal status. I'm drawn to brands that feel considered — that have a point of view, not just a product range.",
  music: [
    "Arca",
    "Floating Points",
    "Japanese city pop",
    "ECM Records artists",
    "Harold Budd",
  ],
  films_tv: [
    "Wes Anderson films",
    "Chantal Akerman",
    "The Favourite",
    "A24 productions",
    "Slow cinema",
  ],
  art_design: [
    "Bauhaus",
    "Agnes Martin",
    "Dieter Rams",
    "Yayoi Kusama",
    "wabi-sabi ceramics",
  ],
  social_follows: [
    "@apartamentomagazine",
    "@ssense",
    "@thisisgroundwork",
    "Kinfolk",
    "The School of Life",
  ],
  saved_content: [
    "Essay on slow fashion supply chains",
    "Profile of Lemaire creative director",
    "Guide to natural dye techniques",
    "Interview with Naoto Fukasawa on designing nothing",
  ],
};

// ── Helper components ─────────────────────────────────────────────────

function Tag({ children, color = "zinc" }: { children: string; color?: "esina" | "zinc" | "amber" | "red" | "violet" }) {
  const styles = {
    esina: "bg-esina-950/50 border-esina-800/40 text-esina-300",
    zinc: "bg-zinc-800/60 border-zinc-700/40 text-zinc-300",
    amber: "bg-amber-950/40 border-amber-800/40 text-amber-300",
    red: "bg-red-950/30 border-red-800/40 text-red-400",
    violet: "bg-violet-950/40 border-violet-800/40 text-violet-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${styles[color]}`}>
      {children}
    </span>
  );
}

function ArchetypeBar({ archetype, weight, primary }: { archetype: string; weight: number; primary: boolean }) {
  const pct = Math.round(weight * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm text-zinc-400 capitalize flex-shrink-0 flex items-center gap-1.5">
        {primary && <span className="w-1.5 h-1.5 rounded-full bg-esina-400 flex-shrink-0" />}
        {archetype}
      </div>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full score-bar-animate"
          style={{
            width: `${pct}%`,
            background: primary
              ? "linear-gradient(90deg, #1b87f5, #59c4ff)"
              : "linear-gradient(90deg, #3f3f46, #71717a)",
          }}
        />
      </div>
      <span className="text-xs text-zinc-500 font-mono w-8 text-right">{pct}%</span>
    </div>
  );
}

function BlendCard({ blend }: { blend: IdentityBlend }) {
  const strengthPct = Math.round(blend.blend_strength * 100);
  return (
    <div className="bg-zinc-800/30 border border-violet-900/40 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-sm font-semibold text-violet-300">{blend.blend_name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-16 h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${strengthPct}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 font-mono">{strengthPct}%</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {blend.blend_dimensions.map((d) => (
          <Tag key={d} color="violet">{d}</Tag>
        ))}
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{blend.blend_description}</p>
    </div>
  );
}

// ── Section divider for inputs ────────────────────────────────────────

function InputSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-2">
        {label}{" "}
        {hint && <span className="text-zinc-600 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ── Collapsible panel for multimodal signals ──────────────────────────

function CollapsiblePanel({
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">{title}</span>
          {badge && (
            <span className="text-[10px] text-violet-400 bg-violet-950/40 border border-violet-800/40 rounded-full px-1.5 py-0.5">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4 space-y-4 bg-zinc-900/20">{children}</div>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export default function TranslatePage() {
  // Core signals
  const [purchaseHistory, setPurchaseHistory] = useState(SEED_SIGNALS.purchase_history.join("\n"));
  const [searchQueries, setSearchQueries] = useState(SEED_SIGNALS.search_queries.join("\n"));
  const [interests, setInterests] = useState(SEED_SIGNALS.interests.join("\n"));
  const [freeText, setFreeText] = useState(SEED_SIGNALS.free_text);
  // Multimodal signals
  const [music, setMusic] = useState("");
  const [filmsTv, setFilmsTv] = useState("");
  const [artDesign, setArtDesign] = useState("");
  const [socialFollows, setSocialFollows] = useState("");
  const [savedContent, setSavedContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<TranslatedConsumerProfile | null>(null);
  const [brandMatches, setBrandMatches] = useState<BrandMatch[]>([]);

  function parseLines(text: string): string[] {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  async function handleTranslate() {
    setLoading(true);
    setError(null);
    setProfile(null);
    setBrandMatches([]);

    try {
      const payload = {
        purchase_history: parseLines(purchaseHistory),
        search_queries: parseLines(searchQueries),
        interests: parseLines(interests),
        free_text: freeText.trim() || undefined,
        music: parseLines(music).length > 0 ? parseLines(music) : undefined,
        films_tv: parseLines(filmsTv).length > 0 ? parseLines(filmsTv) : undefined,
        art_design: parseLines(artDesign).length > 0 ? parseLines(artDesign) : undefined,
        social_follows: parseLines(socialFollows).length > 0 ? parseLines(socialFollows) : undefined,
        saved_content: parseLines(savedContent).length > 0 ? parseLines(savedContent) : undefined,
      };

      const res = await fetch("/api/translate-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-esina-internal": "1" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProfile(data.translatedProfile);
      setBrandMatches(data.brandMatches || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleLoadSeed() {
    setPurchaseHistory(SEED_SIGNALS.purchase_history.join("\n"));
    setSearchQueries(SEED_SIGNALS.search_queries.join("\n"));
    setInterests(SEED_SIGNALS.interests.join("\n"));
    setFreeText(SEED_SIGNALS.free_text);
    setMusic(SEED_SIGNALS.music.join("\n"));
    setFilmsTv(SEED_SIGNALS.films_tv.join("\n"));
    setArtDesign(SEED_SIGNALS.art_design.join("\n"));
    setSocialFollows(SEED_SIGNALS.social_follows.join("\n"));
    setSavedContent(SEED_SIGNALS.saved_content.join("\n"));
  }

  const hasResults = profile !== null;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* ── Header ── */}
      <header className="border-b border-zinc-800/60 sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center shadow-lg shadow-esina-900/40">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">ESINA</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/match" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Brand Match
            </Link>
            <Link href="/audits" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Audits
            </Link>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Identity Translator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Page header ── */}
        <div className="mb-10 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Consumer Identity Translator</h1>
            <p className="text-zinc-400 max-w-2xl leading-relaxed">
              Paste in raw behavioral signals — purchases, searches, music, film, art, follows. Esina translates them into a structured identity profile with blend signatures and matches against the brand database.
            </p>
          </div>
          <button
            onClick={handleLoadSeed}
            className="flex-shrink-0 text-xs px-3 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 rounded-lg transition-colors"
          >
            Load example signals
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Input panel ── */}
          <div className="space-y-4">

            {/* Core signals */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">
                Core Signals
              </h2>

              <InputSection label="Purchase history" hint="— one brand or item per line">
                <TextareaField
                  value={purchaseHistory}
                  onChange={setPurchaseHistory}
                  placeholder={"Alighieri jewelry\nAesop skincare\nMargaret Howell trousers"}
                  rows={5}
                />
              </InputSection>

              <InputSection label="Recent searches" hint="— one per line">
                <TextareaField
                  value={searchQueries}
                  onChange={setSearchQueries}
                  placeholder={"quiet luxury brands\nminimalist jewelry no logo\nslow fashion womenswear"}
                  rows={4}
                />
              </InputSection>

              <InputSection label="Interests / accounts followed / communities" hint="— one per line">
                <TextareaField
                  value={interests}
                  onChange={setInterests}
                  placeholder={"architecture\ncontemporary art\nindependent bookshops"}
                  rows={4}
                />
              </InputSection>

              <InputSection label="Free text description" hint="— any natural language">
                <TextareaField
                  value={freeText}
                  onChange={setFreeText}
                  placeholder="Describe this consumer in your own words..."
                  rows={3}
                />
              </InputSection>
            </div>

            {/* Multimodal signals — collapsible */}
            <CollapsiblePanel title="Cultural Signals" badge="new · stronger identity markers">
              <InputSection label="Music" hint="— artists, genres, playlists (one per line)">
                <TextareaField
                  value={music}
                  onChange={setMusic}
                  placeholder={"Floating Points\nJapanese city pop\nECM Records artists"}
                  rows={3}
                />
              </InputSection>

              <InputSection label="Films & TV" hint="— movies, shows, directors (one per line)">
                <TextareaField
                  value={filmsTv}
                  onChange={setFilmsTv}
                  placeholder={"Wes Anderson films\nChantal Akerman\nA24 productions"}
                  rows={3}
                />
              </InputSection>

              <InputSection label="Art & design" hint="— artists, movements, aesthetics (one per line)">
                <TextareaField
                  value={artDesign}
                  onChange={setArtDesign}
                  placeholder={"Bauhaus\nAgnes Martin\nDieter Rams"}
                  rows={3}
                />
              </InputSection>

              <InputSection label="Social follows" hint="— accounts or creators (one per line)">
                <TextareaField
                  value={socialFollows}
                  onChange={setSocialFollows}
                  placeholder={"@apartamentomagazine\n@ssense\nKinfolk"}
                  rows={3}
                />
              </InputSection>

              <InputSection label="Saved content" hint="— descriptions of bookmarked/saved items (one per line)">
                <TextareaField
                  value={savedContent}
                  onChange={setSavedContent}
                  placeholder={"Essay on slow fashion supply chains\nInterview with Naoto Fukasawa"}
                  rows={3}
                />
              </InputSection>
            </CollapsiblePanel>

            <button
              onClick={handleTranslate}
              disabled={loading}
              className="btn-glow w-full py-3.5 bg-esina-600 hover:bg-esina-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Translating identity…
                </span>
              ) : (
                "Translate Identity → Match Brands"
              )}
            </button>

            {error && (
              <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* ── Output panel ── */}
          <div className="space-y-6">
            {!hasResults && !loading && (
              <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-esina-950/40 border border-esina-800/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-esina-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                  Paste behavioral signals on the left and click Translate to see the consumer&apos;s identity profile, blend signatures, and matching brands.
                </p>
              </div>
            )}

            {hasResults && profile && (
              <>
                {/* Identity Profile Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-esina-500 to-esina-700 flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">E</span>
                      </div>
                      <span className="text-sm font-semibold text-white">Translated Identity Profile</span>
                    </div>
                    <Tag color="esina">AI-structured</Tag>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Summary */}
                    <div>
                      <p className="text-sm text-zinc-300 leading-relaxed italic">
                        &ldquo;{profile.identity_summary}&rdquo;
                      </p>
                    </div>

                    {/* Archetypes */}
                    <div>
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Archetypes</h3>
                      <div className="space-y-2">
                        {(profile.archetypes || []).map((a) => (
                          <ArchetypeBar key={a.archetype} {...a} />
                        ))}
                      </div>
                    </div>

                    {/* Values */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Values</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.values || []).map((v) => (
                            <Tag key={v} color="esina">{v}</Tag>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Avoids</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.anti_preferences || []).map((v) => (
                            <Tag key={v} color="red">{v}</Tag>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Style tags */}
                    <div>
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Aesthetic Style</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(profile.style_tags || []).map((s) => (
                          <Tag key={s} color="zinc">{s}</Tag>
                        ))}
                      </div>
                    </div>

                    {/* Communities */}
                    <div>
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Communities</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(profile.communities || []).map((c) => (
                          <Tag key={c} color="zinc">{c}</Tag>
                        ))}
                      </div>
                    </div>

                    {/* Signal row */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {[
                        { label: "Status Signal", value: profile.status_signal },
                        { label: "Emotional Resonance", value: profile.emotional_resonance },
                        { label: "Price Sensitivity", value: profile.price_sensitivity },
                        { label: "Sustainability", value: profile.sustainability_orientation },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-zinc-800/40 rounded-lg px-3 py-2">
                          <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{label}</div>
                          <div className="text-sm text-zinc-300 font-medium capitalize">{(value || "—").replace(/_/g, " ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Identity Blend Signatures */}
                {profile.blends && profile.blends.length > 0 && (
                  <div className="bg-zinc-900/40 border border-violet-900/40 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-violet-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Identity Blend Signatures</span>
                        <span className="text-[10px] text-violet-400 bg-violet-950/40 border border-violet-800/40 rounded-full px-1.5 py-0.5">
                          cross-dimensional
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">{profile.blends.length} patterns detected</span>
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                        Blend signatures capture cross-dimensional patterns that are more specific and predictive than any single identity dimension alone.
                      </p>
                      {profile.blends.map((blend, i) => (
                        <BlendCard key={i} blend={blend} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Matches */}
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Matched Brands</span>
                    <span className="text-xs text-zinc-500">{brandMatches.length} results · identity-ranked</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {brandMatches.length === 0 && (
                      <p className="text-zinc-500 text-sm text-center py-4">No matches found above threshold.</p>
                    )}
                    {brandMatches.map((match, i) => (
                      <div
                        key={match.brandId}
                        className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/40 hover:border-zinc-700 transition-colors"
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${i === 0 ? "bg-esina-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <a
                                href={`/audit/${match.brandId}`}
                                className="text-sm font-medium text-white hover:text-esina-400 transition-colors"
                              >
                                {match.brandName}
                              </a>
                              <span className="text-[10px] text-zinc-600">{match.category}</span>
                            </div>
                            <span className="text-sm font-semibold text-esina-400 font-mono tabular-nums">
                              {match.score}%
                            </span>
                          </div>
                          <div className="mb-1.5">
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full score-bar-animate"
                                style={{
                                  width: `${match.score}%`,
                                  background:
                                    match.score >= 60
                                      ? "linear-gradient(90deg, #1b87f5, #33a6ff)"
                                      : match.score >= 45
                                      ? "linear-gradient(90deg, #1b87f5, #59c4ff)"
                                      : "linear-gradient(90deg, #3f3f46, #52525b)",
                                }}
                              />
                            </div>
                          </div>
                          {match.snippet && (
                            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{match.snippet}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Controlled textarea with local state ──────────────────────────────

function TextareaField({
  value: externalValue,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [value, setValue] = useState(externalValue);

  // Sync local state when parent resets (e.g. "Load example signals")
  useEffect(() => {
    setValue(externalValue);
  }, [externalValue]);

  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-esina-600 focus:ring-1 focus:ring-esina-600/30 transition-colors resize-none text-sm leading-relaxed"
    />
  );
}

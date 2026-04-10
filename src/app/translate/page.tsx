"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TranslatedConsumerProfile, BrandMatch, IdentityBlend } from "@/app/api/translate-identity/route";

const SEED_SIGNALS = {
  purchase_history: ["Alighieri jewelry", "Aesop skincare", "Margaret Howell linen trousers", "Hay furniture", "Muji notebooks", "Le Labo Santal 33"],
  search_queries: ["quiet luxury brands under £200", "minimalist jewelry no logo", "slow fashion womenswear UK", "artisanal ceramics London", "independent fashion labels"],
  interests: ["architecture", "contemporary art", "slow living", "independent bookshops", "ceramics", "Apartamento magazine"],
  free_text: "I care deeply about craft and who made something. I buy things to last, not to signal status. I'm drawn to brands that feel considered — that have a point of view, not just a product range.",
  music: ["Arca", "Floating Points", "Japanese city pop", "ECM Records artists", "Harold Budd"],
  films_tv: ["Wes Anderson films", "Chantal Akerman", "The Favourite", "A24 productions", "Slow cinema"],
  art_design: ["Bauhaus", "Agnes Martin", "Dieter Rams", "Yayoi Kusama", "wabi-sabi ceramics"],
  social_follows: ["@apartamentomagazine", "@ssense", "@thisisgroundwork", "Kinfolk", "The School of Life"],
  saved_content: ["Essay on slow fashion supply chains", "Profile of Lemaire creative director", "Guide to natural dye techniques", "Interview with Naoto Fukasawa on designing nothing"],
};

const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: "2px",
  color: "rgba(0,0,0,0.6)",
  padding: "10px 14px",
  width: "100%",
  resize: "none" as const,
  fontSize: "13px",
  lineHeight: "1.6",
  outline: "none",
};

function Tag({ children }: { children: string }) {
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-0.5"
      style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px", color: "rgba(0,0,0,0.5)" }}
    >
      {children}
    </span>
  );
}

function AntiTag({ children }: { children: string }) {
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-0.5"
      style={{ background: "rgba(220,38,38,0.08)", borderRadius: "2px", color: "rgba(185,28,28,0.5)" }}
    >
      {children}
    </span>
  );
}

function BlendCard({ blend }: { blend: IdentityBlend }) {
  const strengthPct = Math.round(blend.blend_strength * 100);
  return (
    <div className="p-4 card-light" style={{ borderRadius: "2px" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-sm" style={{ color: "rgba(0,0,0,0.7)" }}>{blend.blend_name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-14 h-px overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
            <div style={{ width: `${strengthPct}%`, height: "1px", background: "rgba(0,0,0,0.4)" }} />
          </div>
          <span className="font-goldman text-xs font-bold" style={{ color: "rgba(0,0,0,0.7)" }}>{strengthPct}%</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {blend.blend_dimensions.map((d) => <Tag key={d}>{d}</Tag>)}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.35)" }}>{blend.blend_description}</p>
    </div>
  );
}

function InputSection({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-2 lowercase" style={{ color: "rgba(0,0,0,0.6)" }}>
        {label}{hint && <span style={{ color: "rgba(0,0,0,0.35)", marginLeft: "4px" }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function CollapsiblePanel({ title, badge, children, defaultOpen = false }: { title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "2px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left lowercase"
        style={{ background: "rgba(255,255,255,0.15)", transition: "background 0.15s" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: "rgba(0,0,0,0.6)", letterSpacing: "0.08em" }}>{title}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ background: "rgba(0,0,0,0.06)", borderRadius: "2px", color: "rgba(0,0,0,0.35)" }}>
              {badge}
            </span>
          )}
        </div>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="rgba(0,0,0,0.4)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4 space-y-4" style={{ background: "rgba(0,0,0,0.04)" }}>{children}</div>}
    </div>
  );
}

function TextareaField({ value: externalValue, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const [value, setValue] = useState(externalValue);
  useEffect(() => { setValue(externalValue); }, [externalValue]);
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => { setValue(e.target.value); onChange(e.target.value); }}
      placeholder={placeholder}
      style={{ ...INPUT_STYLE, fontFamily: "inherit" }}
    />
  );
}

export default function TranslatePage() {
  const [purchaseHistory, setPurchaseHistory] = useState(SEED_SIGNALS.purchase_history.join("\n"));
  const [searchQueries, setSearchQueries] = useState(SEED_SIGNALS.search_queries.join("\n"));
  const [interests, setInterests] = useState(SEED_SIGNALS.interests.join("\n"));
  const [freeText, setFreeText] = useState(SEED_SIGNALS.free_text);
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
    return text.split("\n").map((l) => l.trim()).filter(Boolean);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-goldman text-white tracking-[3px] text-[28px] font-bold uppercase">ESINA</Link>
          <div className="flex items-center gap-5">
            <Link href="/match" className="nav-link">match</Link>
            <Link href="/audits" className="nav-link">audits</Link>
            <span className="section-tag hidden sm:block">identity translator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10 flex items-start justify-between gap-6 flex-wrap fade-up-1">
          <div>
            <p className="section-tag mb-5">identity translator</p>
            <h1 className="font-goldman text-4xl font-bold text-white mb-3">translate identity signals</h1>
            <p className="text-base max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              paste in raw behavioral signals — purchases, searches, music, film, art, follows. esina translates them into a structured identity profile with blend signatures and matches against the brand database.
            </p>
          </div>
          <button
            onClick={handleLoadSeed}
            className="btn-cta-dark flex-shrink-0 text-xs px-4 py-2 lowercase"
          >
            load example signals
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="space-y-3 fade-up-2">
            <div className="p-6 space-y-5 card-mid" style={{ borderRadius: "2px" }}>
              <p className="section-tag-mid lowercase" style={{ color: "rgba(0,0,0,0.6)", fontWeight: "bold" }}>core signals</p>
              <InputSection label="purchase history" hint="— one brand or item per line">
                <TextareaField value={purchaseHistory} onChange={setPurchaseHistory} placeholder={"Alighieri jewelry\nAesop skincare\nMargaret Howell trousers"} rows={5} />
              </InputSection>
              <InputSection label="recent searches" hint="— one per line">
                <TextareaField value={searchQueries} onChange={setSearchQueries} placeholder={"quiet luxury brands\nminimalist jewelry no logo"} rows={4} />
              </InputSection>
              <InputSection label="interests / communities" hint="— one per line">
                <TextareaField value={interests} onChange={setInterests} placeholder={"architecture\ncontemporary art\nindependent bookshops"} rows={4} />
              </InputSection>
              <InputSection label="free text" hint="— any natural language">
                <TextareaField value={freeText} onChange={setFreeText} placeholder="Describe this consumer in your own words..." rows={3} />
              </InputSection>
            </div>

            <CollapsiblePanel title="cultural signals" badge="stronger identity markers">
              <InputSection label="music" hint="— artists, genres (one per line)">
                <TextareaField value={music} onChange={setMusic} placeholder={"Floating Points\nJapanese city pop\nECM Records artists"} rows={3} />
              </InputSection>
              <InputSection label="films & tv" hint="— movies, shows, directors">
                <TextareaField value={filmsTv} onChange={setFilmsTv} placeholder={"Wes Anderson films\nChantal Akerman\nA24 productions"} rows={3} />
              </InputSection>
              <InputSection label="art & design" hint="— artists, movements, aesthetics">
                <TextareaField value={artDesign} onChange={setArtDesign} placeholder={"Bauhaus\nAgnes Martin\nDieter Rams"} rows={3} />
              </InputSection>
              <InputSection label="social follows" hint="— accounts or creators">
                <TextareaField value={socialFollows} onChange={setSocialFollows} placeholder={"@apartamentomagazine\n@ssense\nKinfolk"} rows={3} />
              </InputSection>
              <InputSection label="saved content" hint="— bookmarked/saved items (one per line)">
                <TextareaField value={savedContent} onChange={setSavedContent} placeholder={"Essay on slow fashion supply chains\nInterview with Naoto Fukasawa"} rows={3} />
              </InputSection>
            </CollapsiblePanel>

            <button
              onClick={handleTranslate}
              disabled={loading}
              className="btn-cta-dark w-full py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed lowercase"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border border-[#4A4A46]/20 border-t-[#4A4A46] animate-spin" style={{ borderRadius: "50%" }} />
                  translating identity…
                </span>
              ) : "translate identity → match brands"}
            </button>

            {error && (
              <div className="p-4 text-sm" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}>
                {error}
              </div>
            )}
          </div>

          {/* Output panel */}
          <div className="space-y-4 fade-up-3">
            {!profile && !loading && (
              <div className="p-12 text-center card-light" style={{ borderRadius: "2px" }}>
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="rgba(0,0,0,0.4)" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "rgba(0,0,0,0.35)" }}>
                  paste behavioral signals on the left and click translate to see the identity profile, blend signatures, and matching brands.
                </p>
              </div>
            )}

            {profile && (
              <>
                {/* Identity profile */}
                <div className="card-light" style={{ borderRadius: "2px" }}>
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <p className="section-tag-light lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>translated identity profile</p>
                  </div>
                  <div className="p-5 space-y-5">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.7)", fontStyle: "italic" }}>
                      &ldquo;{profile.identity_summary}&rdquo;
                    </p>

                    {/* Archetypes */}
                    <div>
                      <p className="section-tag-light mb-3 lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>archetypes</p>
                      <div className="space-y-2">
                        {(profile.archetypes || []).map((a) => (
                          <div key={a.archetype} className="flex items-center gap-3">
                            <div className="w-24 text-xs capitalize flex-shrink-0 flex items-center gap-1.5" style={{ color: "rgba(0,0,0,0.5)" }}>
                              {a.primary && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)", flexShrink: 0 }} />}
                              {a.archetype}
                            </div>
                            <div className="flex-1 h-px overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                              <div className="h-full score-bar-animate" style={{ width: `${Math.round(a.weight * 100)}%`, background: a.primary ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.25)" }} />
                            </div>
                            <span className="font-goldman text-xs font-bold w-8 text-right" style={{ color: "rgba(0,0,0,0.7)" }}>{Math.round(a.weight * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Values / Anti */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="section-tag-light mb-2 lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>values</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.values || []).map((v) => <Tag key={v}>{v}</Tag>)}
                        </div>
                      </div>
                      <div>
                        <p className="section-tag-light mb-2 lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>avoids</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.anti_preferences || []).map((v) => <AntiTag key={v}>{v}</AntiTag>)}
                        </div>
                      </div>
                    </div>

                    {/* Style + Communities */}
                    <div>
                      <p className="section-tag-light mb-2 lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>aesthetic style</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(profile.style_tags || []).map((s) => <Tag key={s}>{s}</Tag>)}
                      </div>
                    </div>
                    <div>
                      <p className="section-tag-light mb-2 lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>communities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(profile.communities || []).map((c) => <Tag key={c}>{c}</Tag>)}
                      </div>
                    </div>

                    {/* Signal row */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "status signal", value: profile.status_signal },
                        { label: "emotional resonance", value: profile.emotional_resonance },
                        { label: "price sensitivity", value: profile.price_sensitivity },
                        { label: "sustainability", value: profile.sustainability_orientation },
                      ].map(({ label, value }) => (
                        <div key={label} className="px-3 py-2" style={{ background: "rgba(0,0,0,0.06)", borderRadius: "2px" }}>
                          <div className="text-[10px] mb-0.5 lowercase" style={{ color: "rgba(0,0,0,0.35)", letterSpacing: "0.08em" }}>{label}</div>
                          <div className="text-sm font-bold capitalize" style={{ color: "rgba(0,0,0,0.7)" }}>{(value || "—").replace(/_/g, " ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Blend signatures */}
                {profile.blends && profile.blends.length > 0 && (
                  <div className="card-light" style={{ borderRadius: "2px" }}>
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                      <p className="section-tag-light lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>identity blend signatures</p>
                      <span className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>{profile.blends.length} patterns</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {profile.blends.map((blend, i) => <BlendCard key={i} blend={blend} />)}
                    </div>
                  </div>
                )}

                {/* Brand matches */}
                <div className="card-light" style={{ borderRadius: "2px" }}>
                  <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <p className="section-tag-light lowercase" style={{ color: "rgba(0,0,0,0.75)", fontWeight: "bold" }}>matched brands</p>
                    <span className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>{brandMatches.length} results · identity-ranked</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {brandMatches.length === 0 && (
                      <p className="text-sm text-center py-4" style={{ color: "rgba(0,0,0,0.35)" }}>no matches found above threshold.</p>
                    )}
                    {brandMatches.map((match, i) => (
                      <div key={match.brandId} className="flex items-start gap-3 p-3" style={{ background: "rgba(0,0,0,0.08)", borderRadius: "2px" }}>
                        <span className="font-goldman text-xs font-bold w-5 text-right mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <a href={`/audit/${match.brandId}`} className="text-sm" style={{ color: "rgba(0,0,0,0.65)" }}>{match.brandName}</a>
                            <span className="font-goldman text-sm font-bold tabular-nums" style={{ color: "rgba(0,0,0,0.75)" }}>{match.score}%</span>
                          </div>
                          <div className="h-px mb-1.5 overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
                            <div className="h-full score-bar-animate" style={{ width: `${match.score}%`, background: "rgba(0,0,0,0.25)" }} />
                          </div>
                          {match.snippet && (
                            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(0,0,0,0.25)" }}>{match.snippet}</p>
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

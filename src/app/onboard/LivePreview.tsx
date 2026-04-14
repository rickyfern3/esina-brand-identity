"use client";

import { useEffect, useRef } from "react";

export interface AccumulatedProfile {
  brandName: string;
  archetypeWeights: Record<string, number>;
  styleItems: string[];
  valueItems: string[];
  communityItems: string[];
  statusSignal: string;
  emotionalResonance: string;
  cardsCompleted: number;
  isLoading: boolean;
}

interface LivePreviewProps {
  profile: AccumulatedProfile;
  mobile?: boolean;
}

const ARCHETYPE_ORDER = ["creator","rebel","explorer","sage","lover","caregiver","hero","jester","magician","everyperson","ruler","innocent"];

function ArchetypeBar({ name, weight, animated }: { name: string; weight: number; animated: boolean }) {
  const pct = Math.round(weight * 100);
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.65)" }}>{name}</span>
        <span className="text-xs font-goldman" style={{ color: "rgba(255,255,255,0.45)" }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: animated ? `${pct}%` : "0%",
            background: "rgba(255,255,255,0.55)",
            transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs mr-1.5 mb-1.5"
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "2px",
        color: "rgba(255,255,255,0.65)",
      }}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

function ShimmerBar({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-2 rounded mb-2"
      style={{ width, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }}
    />
  );
}

function generateOneLiner(profile: AccumulatedProfile): string {
  if (!profile.brandName || profile.cardsCompleted < 2) return "";
  const topArchetype = Object.entries(profile.archetypeWeights).sort((a, b) => b[1] - a[1])[0];
  const archName = topArchetype ? topArchetype[0] : "independent";
  const topValue = profile.valueItems[0] || "authenticity";
  const topStyle = profile.styleItems[0] || "";
  const statusMap: Record<string, string> = {
    quiet_luxury: "quiet",
    counterculture: "counterculture",
    accessible_premium: "accessible-premium",
    anti_status: "anti-status",
    conspicuous: "conspicuous",
  };
  const statusWord = statusMap[profile.statusSignal] || "";
  const parts = [
    `${profile.brandName} is a ${archName} brand`,
    topStyle ? `with ${topStyle.replace(/_/g, " ")} energy` : "",
    `built on ${topValue.replace(/_/g, " ")}`,
    statusWord ? `— ${statusWord} positioning` : "",
  ].filter(Boolean);
  return parts.join(" ") + ".";
}

export default function LivePreview({ profile, mobile = false }: LivePreviewProps) {
  const prevProfileRef = useRef<AccumulatedProfile | null>(null);
  const hasData = profile.cardsCompleted > 0;

  // Get top archetypes (weight > 0.05)
  const archetypes = ARCHETYPE_ORDER
    .filter(a => (profile.archetypeWeights[a] || 0) > 0.05)
    .map(a => ({ name: a, weight: profile.archetypeWeights[a] || 0 }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const oneLiner = generateOneLiner(profile);

  useEffect(() => {
    prevProfileRef.current = profile;
  });

  if (mobile) {
    // Compact mobile floating bar
    const topArchetype = archetypes[0];
    return (
      <div
        className="fixed bottom-20 left-4 right-4 z-40 px-4 py-3"
        style={{
          background: "rgba(30,30,28,0.9)",
          backdropFilter: "blur(12px)",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {hasData && topArchetype ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-goldman text-white truncate">{profile.brandName || "your brand"}</p>
              <p className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{topArchetype.name} · {Math.round(topArchetype.weight * 100)}%</p>
            </div>
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round(topArchetype.weight * 100)}%`, background: "rgba(255,255,255,0.55)", transition: "width 0.6s ease" }} />
            </div>
          </div>
        ) : (
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>identity building as you go…</p>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ paddingTop: "8px" }}>
      {/* Header */}
      <div className="mb-6">
        <p className="section-tag mb-1">live preview</p>
        {profile.brandName ? (
          <h3 className="font-goldman text-xl text-white">{profile.brandName}</h3>
        ) : (
          <div style={{ height: "28px" }}>
            <ShimmerBar width="60%" />
          </div>
        )}
      </div>

      {/* One-liner identity */}
      {oneLiner ? (
        <div
          className="mb-5 px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.06)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs leading-relaxed italic" style={{ color: "rgba(255,255,255,0.7)" }}>{oneLiner}</p>
        </div>
      ) : (
        <div className="mb-5">
          <ShimmerBar />
          <ShimmerBar width="80%" />
        </div>
      )}

      {/* Loading overlay */}
      {profile.isLoading && (
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(255,255,255,0.4)", animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(255,255,255,0.4)", animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(255,255,255,0.4)", animationDelay: "300ms" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>mapping…</span>
        </div>
      )}

      {/* Archetypes */}
      <div className="mb-5">
        <p className="section-tag mb-3">archetypes</p>
        {archetypes.length > 0 ? (
          archetypes.map(a => (
            <ArchetypeBar key={a.name} name={a.name} weight={a.weight} animated={true} />
          ))
        ) : (
          <div>
            <ShimmerBar width="70%" />
            <ShimmerBar width="50%" />
            <ShimmerBar width="35%" />
          </div>
        )}
      </div>

      <div className="flex-1" style={{ minHeight: 0 }}>
        {/* Style tags */}
        {profile.styleItems.length > 0 && (
          <div className="mb-4">
            <p className="section-tag mb-2">aesthetic</p>
            <div>
              {profile.styleItems.slice(0, 6).map(s => <Tag key={s} label={s} />)}
            </div>
          </div>
        )}

        {/* Values */}
        {profile.valueItems.length > 0 && (
          <div className="mb-4">
            <p className="section-tag mb-2">values</p>
            <div>
              {profile.valueItems.slice(0, 4).map(v => <Tag key={v} label={v} />)}
            </div>
          </div>
        )}

        {/* Communities */}
        {profile.communityItems.length > 0 && (
          <div className="mb-4">
            <p className="section-tag mb-2">communities</p>
            <div>
              {profile.communityItems.slice(0, 4).map(c => <Tag key={c} label={c} />)}
            </div>
          </div>
        )}

        {/* Status signal */}
        {profile.statusSignal && (
          <div className="mb-4">
            <p className="section-tag mb-1">status signal</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{profile.statusSignal.replace(/_/g, " ")}</p>
          </div>
        )}
      </div>

      {/* Cards completed indicator */}
      <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{profile.cardsCompleted} of 9 cards</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i < profile.cardsCompleted ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Merge a new ontology mapping into the accumulated profile
export function mergeMapping(
  prev: AccumulatedProfile,
  mapping: {
    archetype_weights?: Record<string, number>;
    value_associations?: string[];
    aesthetic_associations?: string[];
    community_associations?: string[];
    status_signal?: string;
    emotional_resonance?: string;
    confidence?: number;
  } | null
): Partial<AccumulatedProfile> {
  if (!mapping) return {};

  const confidence = mapping.confidence ?? 0.3;
  const weight = confidence; // higher confidence = more influence

  // Merge archetype weights
  const newArchetypes = { ...prev.archetypeWeights };
  if (mapping.archetype_weights) {
    for (const [arch, w] of Object.entries(mapping.archetype_weights)) {
      newArchetypes[arch] = ((newArchetypes[arch] || 0) + w * weight) / 1.5; // moving average
    }
    // Normalize
    const total = Object.values(newArchetypes).reduce((s, v) => s + v, 0);
    if (total > 0) {
      for (const k of Object.keys(newArchetypes)) {
        newArchetypes[k] = newArchetypes[k] / total;
      }
    }
  }

  // Union style/value/community items (deduplicated)
  const newStyle = Array.from(new Set([...prev.styleItems, ...(mapping.aesthetic_associations || [])]));
  const newValues = Array.from(new Set([...prev.valueItems, ...(mapping.value_associations || [])]));
  const newCommunities = Array.from(new Set([...prev.communityItems, ...(mapping.community_associations || [])]));

  return {
    archetypeWeights: newArchetypes,
    styleItems: newStyle,
    valueItems: newValues,
    communityItems: newCommunities,
    statusSignal: mapping.status_signal || prev.statusSignal,
    emotionalResonance: mapping.emotional_resonance || prev.emotionalResonance,
  };
}

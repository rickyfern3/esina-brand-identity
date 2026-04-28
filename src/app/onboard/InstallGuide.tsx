"use client";

import { useState } from "react";
import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform =
  | "shopify"
  | "squarespace"
  | "wix"
  | "wordpress"
  | "framer"
  | "webflow"
  | "other";

interface InstallGuideProps {
  brandId: string;
  brandName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function embedCode(brandId: string) {
  return `<script async src="https://esina.app/api/esina.js?brand=${brandId}"></script>`;
}

// ── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = [
    { left: "5%",  delay: 0,    color: "#22c55e", shape: "circle"  },
    { left: "15%", delay: 0.1,  color: "#86efac", shape: "square"  },
    { left: "25%", delay: 0.05, color: "#4ade80", shape: "circle"  },
    { left: "35%", delay: 0.2,  color: "#bbf7d0", shape: "square"  },
    { left: "45%", delay: 0,    color: "#22c55e", shape: "circle"  },
    { left: "55%", delay: 0.15, color: "#86efac", shape: "circle"  },
    { left: "65%", delay: 0.08, color: "#4ade80", shape: "square"  },
    { left: "75%", delay: 0.12, color: "#bbf7d0", shape: "circle"  },
    { left: "85%", delay: 0.22, color: "#22c55e", shape: "square"  },
    { left: "92%", delay: 0.07, color: "#86efac", shape: "circle"  },
    { left: "10%", delay: 0.3,  color: "#4ade80", shape: "square"  },
    { left: "30%", delay: 0.25, color: "#22c55e", shape: "circle"  },
    { left: "50%", delay: 0.18, color: "#bbf7d0", shape: "square"  },
    { left: "70%", delay: 0.33, color: "#4ade80", shape: "circle"  },
    { left: "88%", delay: 0.14, color: "#86efac", shape: "square"  },
  ];
  return (
    <>
      <style>{`
        @keyframes confettiRise {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 1; }
          100% { transform: translateY(-110px) rotate(200deg); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 0,
          pointerEvents: "none",
          overflow: "visible",
          zIndex: 10,
        }}
      >
        {pieces.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.left,
              top: 0,
              width: i % 3 === 0 ? 9 : 6,
              height: i % 3 === 0 ? 9 : 6,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
              animation: "confettiRise 1.6s ease-out forwards",
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ── CopyCodeBlock ─────────────────────────────────────────────────────────────

function CopyCodeBlock({ brandId }: { brandId: string }) {
  const [copied, setCopied] = useState(false);
  const code = embedCode(brandId);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* code display */}
      <div
        style={{
          padding: "16px 18px",
          fontFamily: "'SF Mono','Fira Code',monospace",
          fontSize: 13,
          color: "rgba(255,255,255,0.8)",
          lineHeight: 1.6,
          wordBreak: "break-all",
          background: "rgba(0,0,0,0.45)",
          userSelect: "all",
        }}
      >
        {code}
      </div>

      {/* big copy button */}
      <button
        onClick={copy}
        style={{
          width: "100%",
          padding: "18px",
          background: copied ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.1)",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontSize: 16,
          fontWeight: 700,
          color: copied ? "rgba(134,239,172,0.95)" : "white",
          transition: "background 0.2s, color 0.2s",
          fontFamily: "'General Sans', system-ui, sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {copied ? (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy Code
          </>
        )}
      </button>
    </div>
  );
}

// ── Step visual helpers ───────────────────────────────────────────────────────

/** Navigation path breadcrumb — shows exactly where to go in the platform */
function NavPath({
  path,
  color = "#f97316",
}: {
  path: string[];
  color?: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "9px 14px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        fontSize: 12,
        fontFamily: "'General Sans', system-ui, sans-serif",
        flexWrap: "wrap",
      }}
    >
      {path.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span style={{ color: "rgba(255,255,255,0.2)", padding: "0 1px" }}>
              ›
            </span>
          )}
          <span
            style={{
              color: i === path.length - 1 ? "white" : "rgba(255,255,255,0.4)",
              fontWeight: i === path.length - 1 ? 600 : 400,
              ...(i === path.length - 1
                ? {
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }
                : {}),
            }}
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Header paste field indicator */
function PasteField({ label }: { label: string }) {
  return (
    <div style={{ maxWidth: 360 }}>
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          marginBottom: 5,
          fontFamily: "'General Sans', system-ui, sans-serif",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          padding: "11px 14px",
          border: "2px dashed rgba(249,115,22,0.55)",
          borderRadius: 6,
          background: "rgba(249,115,22,0.06)",
          fontSize: 12,
          color: "rgba(249,115,22,0.75)",
          fontFamily: "'General Sans', system-ui, sans-serif",
        }}
      >
        ← paste your line here
      </div>
    </div>
  );
}

/** Save / apply button visual */
function SaveBtn({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "rgba(249,115,22,0.1)",
        border: "2px solid rgba(249,115,22,0.45)",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        color: "rgba(249,115,22,0.9)",
        fontFamily: "'General Sans', system-ui, sans-serif",
      }}
    >
      {label}
    </div>
  );
}

// ── Step row ─────────────────────────────────────────────────────────────────

function Step({
  num,
  instruction,
  visual,
}: {
  num: number;
  instruction: React.ReactNode;
  visual?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
      {/* big bold number */}
      <div
        style={{
          flexShrink: 0,
          width: 48,
          height: 48,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="font-goldman"
          style={{ fontSize: 22, color: "white", fontWeight: 700, lineHeight: 1 }}
        >
          {num}
        </span>
      </div>

      <div style={{ flex: 1, paddingTop: 3 }}>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.55,
            fontFamily: "'General Sans', system-ui, sans-serif",
            fontWeight: 500,
            marginBottom: visual ? 12 : 0,
          }}
        >
          {instruction}
        </p>
        {visual}
      </div>
    </div>
  );
}

// ── Platform instructions (exactly 3 steps each) ──────────────────────────────

function ShopifyInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Log into your Shopify admin and go to Settings → Custom Code."
        visual={<NavPath path={["Settings", "Custom Code"]} color="#96bf48" />}
      />
      <Step
        num={2}
        instruction="Paste the line you copied into the Header field."
        visual={<PasteField label="Header" />}
      />
      <Step
        num={3}
        instruction="Click Save."
        visual={<SaveBtn label="Save" />}
      />
    </>
  );
}

function SquarespaceInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Go to Settings → Advanced → Code Injection."
        visual={
          <NavPath
            path={["Settings", "Advanced", "Code Injection"]}
            color="#888"
          />
        }
      />
      <Step
        num={2}
        instruction="Paste the line you copied into the Header field."
        visual={<PasteField label="Header" />}
      />
      <Step
        num={3}
        instruction="Click Save."
        visual={<SaveBtn label="Save" />}
      />
    </>
  );
}

function WixInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Go to Settings → Custom Code → Add Code."
        visual={
          <NavPath
            path={["Settings", "Custom Code", "Add Code"]}
            color="#0057e7"
          />
        }
      />
      <Step
        num={2}
        instruction={
          <>
            Paste the line you copied and select{" "}
            <strong style={{ color: "white" }}>'Head'</strong> as the placement.
          </>
        }
        visual={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PasteField label="Paste code here" />
            <div
              style={{
                padding: "11px 14px",
                border: "2px solid rgba(0,87,231,0.4)",
                borderRadius: 6,
                background: "rgba(0,87,231,0.08)",
                fontSize: 12,
                color: "rgba(100,150,255,0.85)",
                fontFamily: "'General Sans', system-ui, sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Place code in
              </span>
              <strong>Head ✓</strong>
            </div>
          </div>
        }
      />
      <Step
        num={3}
        instruction="Click Apply."
        visual={<SaveBtn label="Apply" />}
      />
    </>
  );
}

function WordPressInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Go to Appearance → Theme → Custom Code, or install the Insert Headers plugin."
        visual={
          <NavPath
            path={["Appearance", "Theme", "Custom Code"]}
            color="#21759b"
          />
        }
      />
      <Step
        num={2}
        instruction="Paste the line you copied into the Header field."
        visual={<PasteField label="Header" />}
      />
      <Step
        num={3}
        instruction="Click Save."
        visual={<SaveBtn label="Save" />}
      />
    </>
  );
}

function FramerInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Go to Site Settings → Custom Code."
        visual={
          <NavPath path={["Site Settings", "Custom Code"]} color="#0099ff" />
        }
      />
      <Step
        num={2}
        instruction="Paste the line you copied into the Header field."
        visual={<PasteField label="Header" />}
      />
      <Step
        num={3}
        instruction="Click Save."
        visual={<SaveBtn label="Save" />}
      />
    </>
  );
}

function WebflowInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Go to Project Settings → Custom Code."
        visual={
          <NavPath
            path={["Project Settings", "Custom Code"]}
            color="#4353ff"
          />
        }
      />
      <Step
        num={2}
        instruction="Paste the line you copied into the Head Code field."
        visual={<PasteField label="Head Code" />}
      />
      <Step
        num={3}
        instruction="Click Save and publish."
        visual={<SaveBtn label="Save and publish" />}
      />
    </>
  );
}

function OtherInstructions() {
  return (
    <>
      <Step
        num={1}
        instruction="Find the 'Add custom code to header' option in your website platform's settings."
        visual={<NavPath path={["Settings", "Custom code / header"]} />}
      />
      <Step
        num={2}
        instruction="Paste the line you copied."
        visual={<PasteField label="Header / head section" />}
      />
      <Step
        num={3}
        instruction="Save your changes."
        visual={<SaveBtn label="Save" />}
      />
    </>
  );
}

// ── Verify block ──────────────────────────────────────────────────────────────

function VerifyBlock({ brandId }: { brandId: string }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "success" | "fail"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const verify = async () => {
    if (!url.trim()) return;
    setStatus("checking");
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/verify-install?url=${encodeURIComponent(url.trim())}&brandId=${brandId}`
      );
      const data = await res.json();
      if (data.verified) {
        setStatus("success");
      } else {
        setStatus("fail");
        setErrorMsg(data.error || "");
      }
    } catch {
      setStatus("fail");
      setErrorMsg("Something went wrong connecting to our servers.");
    }
  };

  return (
    <div>
      {status !== "success" && (
        <div style={{ marginBottom: 10 }}>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 8,
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            Your website address:
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            placeholder="https://yourbrand.com"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6,
              color: "white",
              fontSize: 14,
              fontFamily: "'General Sans', system-ui, sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {status === "idle" && (
        <button
          onClick={verify}
          disabled={!url.trim()}
          style={{
            width: "100%",
            padding: "16px",
            background: url.trim()
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 6,
            color: url.trim() ? "white" : "rgba(255,255,255,0.3)",
            fontSize: 15,
            fontWeight: 600,
            cursor: url.trim() ? "pointer" : "not-allowed",
            fontFamily: "'General Sans', system-ui, sans-serif",
            transition: "all 0.15s",
          }}
        >
          Verify Installation →
        </button>
      )}

      {status === "checking" && (
        <div
          style={{
            padding: 16,
            textAlign: "center",
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'General Sans', system-ui, sans-serif",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,0.15)",
              borderTop: "2px solid rgba(255,255,255,0.7)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginRight: 10,
              verticalAlign: "middle",
            }}
          />
          Checking your website…
        </div>
      )}

      {status === "success" && (
        <div style={{ position: "relative" }}>
          <Confetti />
          <div
            style={{
              padding: "22px 24px",
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.35)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(134,239,172,0.95)"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(134,239,172,0.95)",
                  fontFamily: "'General Sans', system-ui, sans-serif",
                  marginBottom: 5,
                }}
              >
                You&apos;re live. AI agents can now find your brand.
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(134,239,172,0.5)",
                  fontFamily: "'General Sans', system-ui, sans-serif",
                }}
              >
                Visits from AI agents will appear in your analytics shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "fail" && (
        <div>
          <div
            style={{
              padding: "16px 18px",
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: 6,
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(220,38,38,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(252,165,165,0.9)"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(252,165,165,0.9)",
                  fontFamily: "'General Sans', system-ui, sans-serif",
                  marginBottom: errorMsg ? 5 : 0,
                }}
              >
                Script not detected — make sure you saved after pasting.
              </p>
              {errorMsg && (
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(252,165,165,0.5)",
                    fontFamily: "'General Sans', system-ui, sans-serif",
                  }}
                >
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setStatus("idle");
              setErrorMsg("");
            }}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            ← Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Platform tab data ─────────────────────────────────────────────────────────

const PLATFORMS: { id: Platform; label: string; emoji: string }[] = [
  { id: "shopify",      label: "Shopify",      emoji: "🛍️" },
  { id: "squarespace",  label: "Squarespace",  emoji: "⬛" },
  { id: "wix",          label: "Wix",          emoji: "✦"  },
  { id: "wordpress",    label: "WordPress",    emoji: "⊞"  },
  { id: "framer",       label: "Framer",       emoji: "◈"  },
  { id: "webflow",      label: "Webflow",      emoji: "◉"  },
  { id: "other",        label: "Other",        emoji: "⚡" },
];

// ── Main export ───────────────────────────────────────────────────────────────

export function InstallGuide({ brandId, brandName }: InstallGuideProps) {
  const [platform, setPlatform] = useState<Platform>("shopify");

  const auditPath = `/audit/${brandId}`;

  return (
    <div className="min-h-screen" style={{ paddingTop: 88 }}>
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-10 fade-up-1">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.18)",
                border: "1px solid rgba(34,197,94,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(134,239,172,0.9)"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(134,239,172,0.75)",
                fontFamily: "'General Sans', system-ui, sans-serif",
              }}
            >
              brand profile created
            </p>
          </div>

          <h1
            className="font-goldman text-3xl text-white mb-2"
            style={{ fontWeight: 700 }}
          >
            {brandName} is ready.
          </h1>
          <p
            className="text-sm mb-6"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            One last step — add your brand to AI recommendations.
          </p>
          <a
            href={auditPath}
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'General Sans', system-ui, sans-serif",
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              paddingBottom: 1,
            }}
          >
            View your AI audit report →
          </a>
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            marginBottom: 36,
          }}
        />

        {/* ── Copy block ─────────────────────────────────────────────── */}
        <div className="mb-8 fade-up-2">
          <p className="section-tag mb-3">one-time setup</p>
          <h2
            className="font-goldman text-2xl text-white mb-2"
            style={{ fontWeight: 700 }}
          >
            Paste this one line into your website settings.
          </h2>
          <p
            className="text-sm mb-6"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            That&apos;s it. AI agents will start finding your brand immediately.
          </p>
          <CopyCodeBlock brandId={brandId} />
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            marginBottom: 36,
          }}
        />

        {/* ── Platform tabs + steps ───────────────────────────────────── */}
        <div className="fade-up-3">
          <p className="section-tag mb-4">where to paste it</p>

          {/* Scrollable tab row */}
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 4,
              marginBottom: 28,
              scrollbarWidth: "none",
            }}
          >
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                style={{
                  flexShrink: 0,
                  padding: "8px 14px",
                  background:
                    platform === p.id
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    platform === p.id
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.07)"
                  }`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: platform === p.id ? 600 : 400,
                  color:
                    platform === p.id
                      ? "white"
                      : "rgba(255,255,255,0.45)",
                  fontFamily: "'General Sans', system-ui, sans-serif",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* Step instructions */}
          <div>
            {platform === "shopify"     && <ShopifyInstructions />}
            {platform === "squarespace" && <SquarespaceInstructions />}
            {platform === "wix"         && <WixInstructions />}
            {platform === "wordpress"   && <WordPressInstructions />}
            {platform === "framer"      && <FramerInstructions />}
            {platform === "webflow"     && <WebflowInstructions />}
            {platform === "other"       && <OtherInstructions />}
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            marginBottom: 36,
          }}
        />

        {/* ── Verify ─────────────────────────────────────────────────── */}
        <div className="fade-up-4">
          <p className="section-tag mb-3">verify</p>
          <h2
            className="font-goldman text-xl text-white mb-1"
            style={{ fontWeight: 700 }}
          >
            Verify Installation
          </h2>
          <p
            className="text-sm mb-6"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            After pasting and saving, enter your website URL to confirm
            everything is working.
          </p>
          <VerifyBlock brandId={brandId} />
        </div>

        {/* ── Need help ──────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 24,
            padding: "18px 20px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            Need help? We&apos;ll do it for you.
          </p>
          <a
            href="mailto:install@esina.app?subject=Help me install ESINA on my website"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              fontFamily: "'General Sans', system-ui, sans-serif",
              textDecoration: "none",
              padding: "9px 16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Book a quick call →
          </a>
        </div>

        {/* ── Bottom audit link ───────────────────────────────────────── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 36,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <a
            href={auditPath}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'General Sans', system-ui, sans-serif",
              textDecoration: "none",
            }}
          >
            Skip to your AI audit report →
          </a>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

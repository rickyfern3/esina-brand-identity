"use client";

import { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "shopify" | "squarespace" | "wix" | "wordpress" | "other";

interface InstallGuideProps {
  brandId: string;
  brandName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function embedCode(brandId: string) {
  return `<script src="https://esina.app/esina.js?brand=${brandId}"></script>`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** A fake browser chrome wrapper so screenshots look consistent */
function BrowserFrame({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "6px",
        overflow: "hidden",
        background: "#f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* chrome bar */}
      <div
        style={{
          background: "#e4e4e4",
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: "5px" }}>
          {["#ff5f57", "#ffbd2e", "#27c93f"].map((c) => (
            <div
              key={c}
              style={{ width: 10, height: 10, borderRadius: "50%", background: c }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: "4px",
            padding: "3px 10px",
            fontSize: 11,
            color: "#888",
            fontFamily: "monospace",
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ background: "white" }}>{children}</div>
    </div>
  );
}

/** Orange highlight box with arrow — the key visual on each screenshot */
function Highlight({ label, x = "50%", y = "50%", width = "auto" }: { label: string; x?: string; y?: string; width?: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(249,115,22,0.12)",
        border: "2.5px solid #f97316",
        borderRadius: "4px",
        padding: "6px 12px",
        fontSize: 12,
        fontFamily: "'General Sans', system-ui, sans-serif",
        color: "#9a3d00",
        fontWeight: 600,
        width,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316">
        <path d="M7 10l5 5 5-5H7z" />
      </svg>
      {label}
    </div>
  );
}

/** The copy-code block — massive and obvious */
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
        background: "rgba(0,0,0,0.5)",
        borderRadius: "6px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* code */}
      <div
        style={{
          padding: "16px 18px",
          fontFamily: "'SF Mono','Fira Code',monospace",
          fontSize: 12,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.6,
          wordBreak: "break-all",
          letterSpacing: "0.01em",
        }}
      >
        {code}
      </div>
      {/* big copy button */}
      <button
        onClick={copy}
        style={{
          width: "100%",
          padding: "16px",
          background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.12)",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "'General Sans', system-ui, sans-serif",
          color: copied ? "rgba(134,239,172,0.9)" : "white",
          transition: "background 0.2s, color 0.2s",
          letterSpacing: "0.02em",
        }}
      >
        {copied ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy your code
          </>
        )}
      </button>
    </div>
  );
}

/** Verify button + result */
function VerifyBlock({ brandId }: { brandId: string }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "fail">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const verify = useCallback(async () => {
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
        setErrorMsg(data.error || "We couldn't detect the code yet.");
      }
    } catch {
      setStatus("fail");
      setErrorMsg("Something went wrong connecting to our servers.");
    }
  }, [url, brandId]);

  return (
    <div style={{ marginTop: 8 }}>
      {status !== "success" && (
        <div style={{ marginBottom: 10 }}>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 6,
              fontFamily: "'General Sans', system-ui, sans-serif",
            }}
          >
            What's your website address?
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            placeholder="https://yourbrand.com"
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "4px",
              color: "white",
              fontSize: 13,
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
            padding: "14px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "4px",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: url.trim() ? "pointer" : "not-allowed",
            opacity: url.trim() ? 1 : 0.4,
            fontFamily: "'General Sans', system-ui, sans-serif",
            transition: "background 0.15s",
          }}
        >
          Verify my installation →
        </button>
      )}

      {status === "checking" && (
        <div
          style={{
            padding: "14px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'General Sans', system-ui, sans-serif",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.15)",
              borderTop: "2px solid rgba(255,255,255,0.7)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          Checking your website…
        </div>
      )}

      {status === "success" && (
        <div
          style={{
            padding: "16px 18px",
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(134,239,172,0.9)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(134,239,172,0.9)",
                fontFamily: "'General Sans', system-ui, sans-serif",
                marginBottom: 2,
              }}
            >
              You&apos;re all set — AI can now discover your brand identity
            </p>
            <p style={{ fontSize: 12, color: "rgba(134,239,172,0.55)", fontFamily: "'General Sans', system-ui, sans-serif" }}>
              {brandId && `Brand ID: ${brandId}`}
            </p>
          </div>
        </div>
      )}

      {status === "fail" && (
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.25)",
            borderRadius: "4px",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "rgba(252,165,165,0.85)",
              fontFamily: "'General Sans', system-ui, sans-serif",
              marginBottom: 8,
            }}
          >
            {errorMsg || "We couldn't detect the code yet — it can take a few minutes."}
          </p>
          <button
            onClick={() => setStatus("idle")}
            style={{
              fontSize: 12,
              color: "rgba(252,165,165,0.6)",
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

/** "Need help?" bar — shown on every step */
function HelpBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "4px",
        marginTop: 12,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'General Sans', system-ui, sans-serif",
        }}
      >
        Not sure where to paste? We&apos;ll do it for you.
      </p>
      <a
        href="mailto:install@esina.app?subject=Help me install ESINA"
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: "'General Sans', system-ui, sans-serif",
          padding: "6px 12px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "4px",
          transition: "background 0.15s",
          whiteSpace: "nowrap",
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        We&apos;ll install it →
      </a>
    </div>
  );
}

/** Single numbered step row */
function Step({
  num,
  instruction,
  visual,
  extra,
}: {
  num: number;
  instruction: React.ReactNode;
  visual?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: visual ? 12 : 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "4px",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            className="font-goldman"
            style={{ fontSize: 14, color: "white", fontWeight: 700, lineHeight: 1 }}
          >
            {num}
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.6,
            fontFamily: "'General Sans', system-ui, sans-serif",
            paddingTop: 6,
          }}
        >
          {instruction}
        </div>
      </div>
      {visual && <div style={{ marginLeft: 46 }}>{visual}</div>}
      {extra && <div style={{ marginLeft: 46 }}>{extra}</div>}
    </div>
  );
}

// ── Platform instruction sets ─────────────────────────────────────────────────

function ShopifyInstructions({ brandId }: { brandId: string }) {
  return (
    <>
      <Step num={1} instruction="Log into your Shopify store at admin.shopify.com." visual={
        <BrowserFrame url="admin.shopify.com/store/login">
          <div style={{ padding: "32px 24px", background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 20 }}>Log in to Shopify</div>
            <div style={{ maxWidth: 300, margin: "0 auto" }}>
              <div style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 4, marginBottom: 10, textAlign: "left", color: "#aaa", fontSize: 13 }}>Email address</div>
              <div style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 4, marginBottom: 16, textAlign: "left", color: "#aaa", fontSize: 13 }}>Password</div>
              <div style={{ padding: "10px", background: "#008060", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600 }}>Log in</div>
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={2} instruction={<>In the left menu, click <strong>Online Store</strong>.</>} visual={
        <BrowserFrame url="admin.shopify.com">
          <div style={{ display: "flex", minHeight: 120 }}>
            <div style={{ width: 200, background: "#1a1a1a", padding: "12px 0" }}>
              {["Home", "Orders", "Products", "Customers"].map(item => (
                <div key={item} style={{ padding: "8px 16px", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{item}</div>
              ))}
              <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <Highlight label="Online Store" />
              </div>
            </div>
            <div style={{ flex: 1, padding: 24, color: "#888", fontSize: 13 }}>← click here</div>
          </div>
        </BrowserFrame>
      } />

      <Step num={3} instruction={<>Next to your theme name, click the <strong>⋯ three-dot button</strong>, then click <strong>Edit code</strong>.</>} visual={
        <BrowserFrame url="admin.shopify.com/themes">
          <div style={{ padding: 20 }}>
            <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>Dawn (current theme)</div>
                <div style={{ fontSize: 11, color: "#888" }}>Last saved 2 days ago</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: 4, fontSize: 12 }}>Customize</div>
                <div style={{ padding: "6px 10px", border: "2.5px solid #f97316", borderRadius: 4, fontSize: 12, color: "#9a3d00", fontWeight: 600, background: "rgba(249,115,22,0.08)" }}>⋯ &lt;— click here</div>
              </div>
            </div>
            <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(249,115,22,0.08)", border: "2px solid #f97316", borderRadius: 4, width: 130, fontSize: 13, fontWeight: 600, color: "#9a3d00" }}>
              ▶ Edit code &lt;— then this
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={4} instruction={<>In the left sidebar, click the file called <strong>theme.liquid</strong>.</>} visual={
        <BrowserFrame url="admin.shopify.com/themes/code">
          <div style={{ display: "flex", minHeight: 130 }}>
            <div style={{ width: 180, background: "#f6f6f7", padding: "12px 0", borderRight: "1px solid #e0e0e0" }}>
              <div style={{ padding: "6px 12px", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Layout</div>
              {["password.liquid", "gift_card.liquid"].map(f => (
                <div key={f} style={{ padding: "6px 16px", fontSize: 12, color: "#555" }}>{f}</div>
              ))}
              <div style={{ padding: "6px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <Highlight label="theme.liquid" />
              </div>
            </div>
            <div style={{ flex: 1, padding: 16, fontFamily: "monospace", fontSize: 11, color: "#888" }}>
              Click theme.liquid to open it →
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={5} instruction={<>Scroll to find the <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 2, fontSize: 12 }}>&lt;/head&gt;</code> tag near the top, then paste your code <strong>on the line just above it</strong>.</>} visual={
        <BrowserFrame url="admin.shopify.com/themes/code">
          <div style={{ padding: "16px", fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 12, background: "#1e1e1e", color: "#d4d4d4", lineHeight: 1.7 }}>
            <div style={{ color: "#808080" }}>  ...</div>
            <div style={{ color: "#808080" }}>  &lt;meta name="viewport" content="..."&gt;</div>
            <div style={{ background: "rgba(249,115,22,0.25)", border: "1.5px solid #f97316", borderRadius: 2, padding: "1px 4px", margin: "2px 0", color: "#fbd38d" }}>
              👆 PASTE YOUR CODE HERE (the line above &lt;/head&gt;)
            </div>
            <div style={{ color: "#569cd6" }}>&lt;/head&gt;</div>
          </div>
        </BrowserFrame>
      } extra={<div style={{ marginTop: 12 }}><CopyCodeBlock brandId={brandId} /></div>} />

      <Step num={6} instruction={<>Click the green <strong>Save</strong> button in the top-right corner of the editor.</>} visual={
        <BrowserFrame url="admin.shopify.com/themes/code">
          <div style={{ padding: "10px 16px", background: "#f6f6f7", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <div style={{ padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: 4, fontSize: 12, color: "#555" }}>Discard</div>
            <div style={{ padding: "6px 14px", background: "rgba(249,115,22,0.12)", border: "2.5px solid #f97316", borderRadius: 4, fontSize: 12, fontWeight: 700, color: "#9a3d00" }}>
              Save ← click this
            </div>
          </div>
          <div style={{ padding: 16, fontFamily: "monospace", fontSize: 11, color: "#888" }}>…your code is here…</div>
        </BrowserFrame>
      } />

      <Step num={7} instruction="Come back here and verify your installation below." extra={<VerifyBlock brandId={brandId} />} />

      <HelpBar />
    </>
  );
}

function SquarespaceInstructions({ brandId }: { brandId: string }) {
  return (
    <>
      <Step num={1} instruction="Log into your Squarespace account at account.squarespace.com." visual={
        <BrowserFrame url="account.squarespace.com">
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 20 }}>Log in to Squarespace</div>
            <div style={{ maxWidth: 280, margin: "0 auto" }}>
              <div style={{ padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 4, marginBottom: 10, textAlign: "left", color: "#aaa", fontSize: 13 }}>Email</div>
              <div style={{ padding: "10px", background: "#000", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600 }}>Continue</div>
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={2} instruction={<>In the left menu, click <strong>Settings</strong> (the gear icon at the bottom).</>} visual={
        <BrowserFrame url="yoursite.squarespace.com/config">
          <div style={{ display: "flex", minHeight: 120 }}>
            <div style={{ width: 54, background: "#1a1a1a", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 20 }}>
              {["⊞", "✦", "✉", "📊"].map((icon, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>{icon}</div>
              ))}
              <div style={{ marginTop: "auto", paddingBottom: 16 }}>
                <Highlight label="⚙" />
              </div>
            </div>
            <div style={{ flex: 1, padding: 24, color: "#888", fontSize: 13 }}>← Settings gear at the bottom</div>
          </div>
        </BrowserFrame>
      } />

      <Step num={3} instruction={<>Scroll down and click <strong>Advanced</strong>.</>} visual={
        <BrowserFrame url="yoursite.squarespace.com/config/settings">
          <div style={{ padding: 20 }}>
            {["General", "Domains", "Billing", "Permissions"].map(item => (
              <div key={item} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", color: "#555", fontSize: 13 }}>{item}</div>
            ))}
            <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Highlight label="Advanced ← click this" />
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={4} instruction={<>Click <strong>Code Injection</strong>.</>} visual={
        <BrowserFrame url="yoursite.squarespace.com/config/settings/advanced">
          <div style={{ padding: 20 }}>
            {["URL Mappings", "SSL", "External API Keys"].map(item => (
              <div key={item} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", color: "#555", fontSize: 13 }}>{item}</div>
            ))}
            <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Highlight label="Code Injection ← click this" />
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={5} instruction={<>Paste your code in the <strong>Header</strong> box (the very top box on the page). Then click <strong>Save</strong>.</>} visual={
        <BrowserFrame url="yoursite.squarespace.com/config/settings/advanced/code-injection">
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Header</div>
            <div style={{ border: "2.5px solid #f97316", borderRadius: 4, padding: 12, background: "rgba(249,115,22,0.04)", minHeight: 60, fontFamily: "monospace", fontSize: 11, color: "#f97316" }}>
              👆 PASTE YOUR CODE IN THIS BOX
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>Footer</div>
            <div style={{ border: "1px solid #e0e0e0", borderRadius: 4, padding: 12, minHeight: 40, background: "#fafafa" }} />
          </div>
        </BrowserFrame>
      } extra={<div style={{ marginTop: 12 }}><CopyCodeBlock brandId={brandId} /></div>} />

      <Step num={6} instruction={<>Click the <strong>Save</strong> button at the top of the page.</>} />

      <Step num={7} instruction="Come back here and verify your installation." extra={<VerifyBlock brandId={brandId} />} />

      <HelpBar />
    </>
  );
}

function WixInstructions({ brandId }: { brandId: string }) {
  return (
    <>
      <Step num={1} instruction="Log into your Wix account at manage.wix.com." visual={
        <BrowserFrame url="manage.wix.com">
          <div style={{ padding: "32px 24px", textAlign: "center", background: "linear-gradient(135deg, #0057e7 0%, #6b7cff 100%)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 20 }}>Log in to Wix</div>
            <div style={{ maxWidth: 280, margin: "0 auto" }}>
              <div style={{ padding: "10px 14px", background: "white", borderRadius: 4, marginBottom: 10, textAlign: "left", color: "#aaa", fontSize: 13 }}>Email</div>
              <div style={{ padding: "10px", background: "#0057e7", border: "2px solid white", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600 }}>Log in</div>
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={2} instruction={<>In the left menu, click <strong>Settings</strong>.</>} visual={
        <BrowserFrame url="manage.wix.com/dashboard">
          <div style={{ display: "flex", minHeight: 120 }}>
            <div style={{ width: 200, background: "#f7f8fa", padding: "12px 0", borderRight: "1px solid #e0e0e0" }}>
              {["Dashboard", "Blog", "Store", "Contacts"].map(item => (
                <div key={item} style={{ padding: "9px 16px", fontSize: 13, color: "#555" }}>{item}</div>
              ))}
              <div style={{ padding: "9px 16px" }}>
                <Highlight label="Settings ← click here" />
              </div>
            </div>
            <div style={{ flex: 1, padding: 24, color: "#888", fontSize: 13 }}>Your site dashboard</div>
          </div>
        </BrowserFrame>
      } />

      <Step num={3} instruction={<>Scroll down to find <strong>Custom Code</strong> and click it.</>} visual={
        <BrowserFrame url="manage.wix.com/settings">
          <div style={{ padding: 20 }}>
            {["General Info", "Business Hours", "Domains", "Roles & Permissions"].map(item => (
              <div key={item} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", color: "#555", fontSize: 13 }}>{item}</div>
            ))}
            <div style={{ padding: "10px 0" }}>
              <Highlight label="Custom Code ← scroll here and click" />
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={4} instruction={<>Click the <strong>+ Add Custom Code</strong> button.</>} visual={
        <BrowserFrame url="manage.wix.com/settings/custom-code">
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#1a1a1a" }}>Custom Code</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Highlight label="+ Add Custom Code ← click this button" />
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={5} instruction={<>Paste your code. Make sure <strong>"All pages"</strong> and <strong>"Head"</strong> are both selected, then click <strong>Apply</strong>.</>} visual={
        <BrowserFrame url="manage.wix.com/settings/custom-code/new">
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Paste your code snippet</div>
              <div style={{ border: "2.5px solid #f97316", borderRadius: 4, padding: 10, background: "rgba(249,115,22,0.04)", minHeight: 50, fontFamily: "monospace", fontSize: 11, color: "#f97316" }}>
                👆 PASTE YOUR CODE HERE
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Add to pages</div>
                <div style={{ padding: "7px 10px", border: "2px solid #f97316", borderRadius: 4, fontSize: 12, color: "#9a3d00", fontWeight: 600, background: "rgba(249,115,22,0.08)" }}>
                  ✓ All pages
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Place code in</div>
                <div style={{ padding: "7px 10px", border: "2px solid #f97316", borderRadius: 4, fontSize: 12, color: "#9a3d00", fontWeight: 600, background: "rgba(249,115,22,0.08)" }}>
                  ✓ Head
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      } extra={<div style={{ marginTop: 12 }}><CopyCodeBlock brandId={brandId} /></div>} />

      <Step num={6} instruction="Come back here and verify your installation." extra={<VerifyBlock brandId={brandId} />} />

      <HelpBar />
    </>
  );
}

function WordPressInstructions({ brandId }: { brandId: string }) {
  return (
    <>
      <Step num={1} instruction={<>Log into your WordPress admin at <strong>yoursite.com/wp-admin</strong>.</>} visual={
        <BrowserFrame url="yoursite.com/wp-admin">
          <div style={{ padding: "32px 24px", textAlign: "center", background: "#f0f0f1" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1d2327", marginBottom: 20 }}>WordPress</div>
            <div style={{ maxWidth: 280, margin: "0 auto", background: "white", padding: 20, borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: 4, marginBottom: 10, textAlign: "left", color: "#aaa", fontSize: 13 }}>Username or Email</div>
              <div style={{ padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: 4, marginBottom: 12, textAlign: "left", color: "#aaa", fontSize: 13 }}>Password</div>
              <div style={{ padding: "10px", background: "#2271b1", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600 }}>Log In</div>
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={2} instruction={<>In the left menu, hover over <strong>Plugins</strong>, then click <strong>Add New</strong>.</>} visual={
        <BrowserFrame url="yoursite.com/wp-admin/plugins.php">
          <div style={{ display: "flex", minHeight: 130 }}>
            <div style={{ width: 180, background: "#1d2327", padding: "12px 0" }}>
              {["Dashboard", "Posts", "Media", "Pages"].map(item => (
                <div key={item} style={{ padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{item}</div>
              ))}
              <div style={{ padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Plugins</div>
              <div style={{ padding: "6px 24px" }}>
                <Highlight label="Add New ← click this" />
              </div>
            </div>
            <div style={{ flex: 1, padding: 20, color: "#888", fontSize: 13 }}>WordPress Admin</div>
          </div>
        </BrowserFrame>
      } />

      <Step num={3} instruction={<>In the search box, type <strong>WPCode</strong>. When it appears, click <strong>Install Now</strong>, then <strong>Activate</strong>.</>} visual={
        <BrowserFrame url="yoursite.com/wp-admin/plugin-install.php">
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: 4, fontFamily: "monospace", fontSize: 13, color: "#1a1a1a" }}>WPCode</div>
            </div>
            <div style={{ border: "1px solid #e0e0e0", borderRadius: 4, padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, background: "#1d2327", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 }}>W</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>WPCode — Insert Headers and Footers</div>
                <div style={{ fontSize: 11, color: "#888" }}>The easiest way to add custom code</div>
              </div>
              <div>
                <Highlight label="Install Now →" />
              </div>
            </div>
          </div>
        </BrowserFrame>
      } />

      <Step num={4} instruction={<>In the left menu, click <strong>Code Snippets</strong> → <strong>Header &amp; Footer</strong>.</>} visual={
        <BrowserFrame url="yoursite.com/wp-admin/admin.php?page=wpcode-headers-footers">
          <div style={{ display: "flex", minHeight: 100 }}>
            <div style={{ width: 180, background: "#1d2327", padding: "12px 0" }}>
              {["Dashboard", "Posts"].map(item => (
                <div key={item} style={{ padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{item}</div>
              ))}
              <div style={{ padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Code Snippets</div>
              <div style={{ padding: "6px 24px" }}>
                <Highlight label="Header & Footer" />
              </div>
            </div>
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#1a1a1a" }}>Header &amp; Footer Code</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Header</div>
              <div style={{ border: "2.5px solid #f97316", borderRadius: 4, padding: 10, background: "rgba(249,115,22,0.04)", minHeight: 50, fontFamily: "monospace", fontSize: 11, color: "#f97316" }}>
                👆 PASTE YOUR CODE IN THIS BOX
              </div>
            </div>
          </div>
        </BrowserFrame>
      } extra={<div style={{ marginTop: 12 }}><CopyCodeBlock brandId={brandId} /></div>} />

      <Step num={5} instruction={<>Click the <strong>Save Changes</strong> button.</>} />

      <Step num={6} instruction="Come back here and verify your installation." extra={<VerifyBlock brandId={brandId} />} />

      <HelpBar />
    </>
  );
}

function OtherInstructions({ brandId }: { brandId: string }) {
  return (
    <>
      <div
        style={{
          padding: "20px 20px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          marginBottom: 20,
          fontFamily: "'General Sans', system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 0 }}>
          Copy the code below and paste it somewhere near the very top of every page on your website — before it closes the opening section. If you&apos;re not sure where exactly, just hit the button below and we&apos;ll take care of it for you.
        </p>
      </div>

      <CopyCodeBlock brandId={brandId} />

      <div style={{ marginTop: 16 }}>
        <VerifyBlock brandId={brandId} />
      </div>

      <HelpBar />
    </>
  );
}

// ── Platform selection screen ─────────────────────────────────────────────────

const PLATFORMS: { id: Platform; label: string; icon: string; desc: string }[] = [
  { id: "shopify", label: "Shopify", icon: "🛍", desc: "Shopify stores" },
  { id: "squarespace", label: "Squarespace", icon: "⬛", desc: "Squarespace sites" },
  { id: "wix", label: "Wix", icon: "✦", desc: "Wix websites" },
  { id: "wordpress", label: "WordPress", icon: "⊞", desc: "WordPress sites" },
  { id: "other", label: "Something else", icon: "⚡", desc: "Any other platform" },
];

// ── Main export ───────────────────────────────────────────────────────────────

export function InstallGuide({ brandId, brandName }: InstallGuideProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [showAudit, setShowAudit] = useState(false);

  // Audit link is available before platform selection
  const auditPath = `/audit/${brandId}`;

  return (
    <div className="min-h-screen" style={{ paddingTop: 88 }}>
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-10 fade-up-1">
          <div
            className="w-12 h-12 flex items-center justify-center mb-6"
            style={{ background: "rgba(0,0,0,0.15)", borderRadius: "2px" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l5 5 7-8" />
            </svg>
          </div>
          <h1 className="font-goldman text-3xl text-white mb-2" style={{ fontWeight: 700 }}>
            {brandName} is live.
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            Your brand identity profile is ready. Now add one line to your website so AI can find you.
          </p>
          <div className="flex gap-3">
            <a
              href={auditPath}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "4px",
                color: "rgba(255,255,255,0.65)",
                fontSize: 12,
                textDecoration: "none",
                fontFamily: "'General Sans', system-ui, sans-serif",
              }}
            >
              View your AI audit report →
            </a>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 32 }} />

        {/* ── Platform selection ──────────────────────────────────── */}
        {!platform && (
          <div className="fade-up-2">
            <h2
              className="font-goldman text-xl text-white mb-2"
              style={{ fontWeight: 700 }}
            >
              What platform is your website on?
            </h2>
            <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'General Sans', system-ui, sans-serif" }}>
              We&apos;ll show you exactly where to paste — one screenshot at a time.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {PLATFORMS.filter(p => p.id !== "other").map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    padding: "20px 16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s, border-color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  <span style={{ fontSize: 24 }}>{p.icon}</span>
                  <div>
                    <p
                      className="font-goldman"
                      style={{ fontSize: 14, color: "white", fontWeight: 700, marginBottom: 2 }}
                    >
                      {p.label}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'General Sans', system-ui, sans-serif" }}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPlatform("other")}
              style={{
                width: "100%",
                padding: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            >
              <span style={{ fontSize: 20 }}>⚡</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'General Sans', system-ui, sans-serif", marginBottom: 1 }}>
                  Something else / custom site
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'General Sans', system-ui, sans-serif" }}>
                  Framer, Webflow, custom code, etc.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ── Platform instructions ───────────────────────────────── */}
        {platform && (
          <div className="fade-up-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="section-tag mb-1">install instructions</p>
                <h2 className="font-goldman text-xl text-white" style={{ fontWeight: 700 }}>
                  {PLATFORMS.find(p => p.id === platform)?.icon}{" "}
                  {PLATFORMS.find(p => p.id === platform)?.label}
                </h2>
              </div>
              <button
                onClick={() => setPlatform(null)}
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'General Sans', system-ui, sans-serif",
                  padding: "4px 8px",
                }}
              >
                ← change platform
              </button>
            </div>

            {platform === "shopify" && <ShopifyInstructions brandId={brandId} />}
            {platform === "squarespace" && <SquarespaceInstructions brandId={brandId} />}
            {platform === "wix" && <WixInstructions brandId={brandId} />}
            {platform === "wordpress" && <WordPressInstructions brandId={brandId} />}
            {platform === "other" && <OtherInstructions brandId={brandId} />}

            {/* Bottom audit link */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <a
                href={auditPath}
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "'General Sans', system-ui, sans-serif",
                  textDecoration: "none",
                }}
              >
                Skip to your AI audit report →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Spinner keyframe for verify button */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

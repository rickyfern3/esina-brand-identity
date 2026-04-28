"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
}

/**
 * Reusable copy-to-clipboard button for use in server components.
 * Shows "Copy Code" → "Copied! ✓" on click.
 */
export function CopyButton({ text, label = "Copy Code", size = "md" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const isSm = size === "sm";

  return (
    <button
      onClick={copy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: isSm ? "6px 12px" : "10px 18px",
        background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.1)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.15)"}`,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: isSm ? 12 : 13,
        fontWeight: 600,
        color: copied ? "rgba(134,239,172,0.9)" : "white",
        fontFamily: "'General Sans', system-ui, sans-serif",
        transition: "all 0.2s",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? (
        <>
          <svg
            width={isSm ? 13 : 15}
            height={isSm ? 13 : 15}
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
            width={isSm ? 13 : 15}
            height={isSm ? 13 : 15}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import NavBar from "../components/NavBar";
import type { ChatMessage } from "@/app/api/onboard/chat/route";

// ── Constants ─────────────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Tell us about your brand. Don't overthink it — just talk. The more you share, the better we understand who you are.\n\nWhat's your brand called, why did you start it, who are your customers, what makes you different, what does your brand feel like? Just let it flow.",
};

// ── Install step ──────────────────────────────────────────────────────

function InstallStep({ brandId, brandName }: { brandId: string; brandName: string }) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<script src="https://esina.app/esina.js?brand=${brandId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md fade-up-1">
        {/* Success mark */}
        <div className="mb-10">
          <div
            className="w-12 h-12 flex items-center justify-center mb-6"
            style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l5 5 7-8" />
            </svg>
          </div>
          <h2 className="font-goldman text-2xl text-white mb-2">{brandName} is live.</h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            your brand identity profile and AI perception audit are ready. now install the attribution pixel.
          </p>
        </div>

        {/* Divider */}
        <div className="mb-8" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

        {/* Embed code */}
        <div className="mb-6">
          <p className="section-tag mb-3">1. add this to your store</p>
          <div
            className="code-mid px-4 py-4 text-xs leading-relaxed break-all mb-2"
            style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'SF Mono', 'Fira Code', monospace" }}
          >
            {embedCode}
          </div>
          <button
            onClick={handleCopy}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {copied ? "copied" : "copy embed code"}
          </button>
        </div>

        {/* Brand.md link */}
        <div className="mb-10">
          <p className="section-tag mb-3">2. your brand.md is live</p>
          <a
            href={`https://esina.app/api/brand/${brandId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 text-xs"
            style={{
              background: "rgba(0,0,0,0.12)",
              borderRadius: "2px",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              transition: "background 0.15s ease",
            }}
          >
            <span className="truncate">/api/brand/{brandId}</span>
            <span className="ml-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>↗</span>
          </a>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <a href={`/audit/${brandId}`} className="btn-primary py-3 text-sm text-center">
            view ai perception audit
          </a>
          <a href="/brands" className="btn-secondary py-3 text-sm text-center">
            browse brand directory
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Chat bubble ───────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div
          className="w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-1"
          style={{ background: "rgba(0,0,0,0.2)", borderRadius: "2px" }}
        >
          <span className="font-goldman text-[10px] text-white">E</span>
        </div>
      )}
      <div
        className="max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
        style={{
          background: isUser ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          borderRadius: "2px",
          color: isUser ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.85)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-1"
        style={{ background: "rgba(0,0,0,0.2)", borderRadius: "2px" }}
      >
        <span className="font-goldman text-[10px] text-white">E</span>
      </div>
      <div
        className="px-4 py-3 flex items-center gap-1.5"
        style={{ background: "rgba(0,0,0,0.12)", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(255,255,255,0.4)", animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(255,255,255,0.4)", animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(255,255,255,0.4)", animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [conversationDone, setConversationDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedBrandId, setCompletedBrandId] = useState<string | null>(null);
  const [completedBrandName, setCompletedBrandName] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCount = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || aiTyping) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setAiTyping(true);
    setError(null);
    messageCount.current += 1;

    try {
      const res = await fetch("/api/onboard/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
      if (data.done) setConversationDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setAiTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, aiTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleGenerate = async () => {
    if (!contactEmail.trim()) { setShowEmailPrompt(true); return; }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/onboard/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, contact_email: contactEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setCompletedBrandId(data.brandId);
      setCompletedBrandName(data.brandName || "Your brand");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setGenerating(false);
    }
  };

  // Install screen
  if (completedBrandId) {
    return <InstallStep brandId={completedBrandId} brandName={completedBrandName} />;
  }

  // Generating overlay
  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-up-1">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-6"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              borderTopColor: "rgba(255,255,255,0.8)",
            }}
          />
          <p className="font-goldman text-white mb-2">building your brand profile</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            extracting identity · generating embedding · running ai audit
          </p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>~20–30 seconds</p>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto" style={{ paddingTop: "88px" }}>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <p className="section-tag text-center mb-10">esina · brand identity interview</p>

          <div className="space-y-0">
            {messages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
            {aiTyping && <TypingIndicator />}
          </div>

          {/* Generate / email prompt */}
          {(conversationDone || messageCount.current >= 5) && !aiTyping && (
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {!showEmailPrompt ? (
                <div className="space-y-3">
                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ready to generate your brand profile?
                  </p>
                  <button
                    onClick={() => setShowEmailPrompt(true)}
                    className="btn-primary w-full py-3.5 text-sm"
                  >
                    generate my brand.md
                  </button>
                  {!conversationDone && (
                    <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
                      or keep talking — the more context, the richer the profile.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white">almost there. what's your email?</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>so we can send you your brand audit report.</p>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
                    placeholder="you@brand.com"
                    autoFocus
                    className="w-full px-4 py-3 text-sm focus:outline-none"
                    style={{
                      background: "rgba(0,0,0,0.15)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "2px",
                      color: "white",
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!contactEmail.trim()}
                    className="btn-primary w-full py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    generate my brand.md
                  </button>
                  <button
                    onClick={() => setShowEmailPrompt(false)}
                    className="w-full py-2 text-xs"
                    style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.15s" }}
                  >
                    ← back to conversation
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      {!showEmailPrompt && (
        <div
          className="sticky bottom-0 backdrop-blur-md"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(122,122,118,0.8)", backdropFilter: "blur(12px)" }}
        >
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="tell us about your brand…"
                rows={1}
                disabled={aiTyping}
                className="flex-1 px-4 py-3 text-sm focus:outline-none resize-none leading-relaxed disabled:opacity-50"
                style={{
                  background: "rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "2px",
                  color: "white",
                  maxHeight: "140px",
                  overflowY: "auto",
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 140) + "px";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || aiTyping}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "#fff", borderRadius: "2px", transition: "opacity 0.15s" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4A4A46">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
              enter to send · shift+enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

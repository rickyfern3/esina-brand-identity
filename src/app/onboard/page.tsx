"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ChatMessage } from "@/app/api/onboard/chat/route";

// ── Constants ─────────────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Tell us about your brand. Don't overthink it — just talk. The more you share, the better we understand who you are.\n\nWhat's your brand called, why did you start it, who are your customers, what makes you different, what does your brand feel like? Just let it flow.",
};

// ── Install step (shown after successful submission) ──────────────────

function InstallStep({ brandId, brandName }: { brandId: string; brandName: string }) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<script src="https://esina-brand-identity.vercel.app/esina.js?brand=${brandId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Success */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-700/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{brandName} is live on ESINA.</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your brand identity profile and AI perception audit are ready.
            Now install the attribution pixel to close the loop.
          </p>
        </div>

        {/* Embed code */}
        <div className="mb-6">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2">
            1. Add this to your store
          </p>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 break-all leading-relaxed">
            {embedCode}
          </div>
          <button
            onClick={handleCopy}
            className="mt-2 w-full py-2.5 border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm text-zinc-300 hover:text-white transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy embed code"}
          </button>
        </div>

        {/* Brand.md link */}
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2">
            2. Your brand.md is live
          </p>
          <a
            href={`https://esina-brand-identity.vercel.app/api/brand/${brandId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-600 transition-colors"
          >
            <span className="text-xs text-zinc-400 font-mono truncate">
              /api/brand/{brandId}
            </span>
            <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`/audit/${brandId}`}
            className="flex-1 text-center px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-semibold rounded-xl transition-colors"
          >
            View AI Perception Audit →
          </a>
          <a
            href="/brands"
            className="flex-1 text-center px-6 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-medium rounded-xl transition-colors"
          >
            Browse Brand Directory
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
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
          <span className="text-white font-bold text-[10px]">E</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? "bg-violet-700/80 text-white rounded-br-sm"
            : "bg-zinc-800/80 text-zinc-100 rounded-bl-sm border border-zinc-700/50"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
        <span className="text-white font-bold text-[10px]">E</span>
      </div>
      <div className="bg-zinc-800/80 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
  const messageCount = useRef(0); // user message count

  // Scroll to bottom on new messages
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

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || "",
      };

      if (data.reply) {
        setMessages((prev) => [...prev, assistantMessage]);
      }

      if (data.done) {
        setConversationDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setAiTyping(false);
      // Refocus input
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
    if (!contactEmail.trim()) {
      setShowEmailPrompt(true);
      return;
    }
    await submitForExtraction();
  };

  const submitForExtraction = async () => {
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

  // ── Install screen ─────────────────────────────────────────────────

  if (completedBrandId) {
    return <InstallStep brandId={completedBrandId} brandName={completedBrandName} />;
  }

  // ── Generating overlay ────────────────────────────────────────────

  if (generating) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-white font-medium mb-2">Building your brand profile…</p>
          <p className="text-zinc-500 text-sm">Extracting identity · Generating embedding · Running AI audit</p>
          <p className="text-zinc-600 text-xs mt-2">This takes about 20-30 seconds</p>
        </div>
      </div>
    );
  }

  // ── Chat interface ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-[#09090b]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">ESINA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/questionnaire"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Prefer a form? →
            </Link>
            <span className="text-xs text-zinc-600 hidden sm:block">Conversational Onboarding</span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Intro label */}
          <div className="text-center mb-8">
            <span className="text-xs text-zinc-600 uppercase tracking-widest">
              Esina · Brand Identity Interview
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-0">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            {aiTyping && <TypingIndicator />}
          </div>

          {/* "I'm done" + Generate button — shown when AI signals done OR after enough turns */}
          {(conversationDone || messageCount.current >= 5) && !aiTyping && (
            <div className="mt-6 border-t border-zinc-800/60 pt-6">
              {!showEmailPrompt ? (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 text-center">
                    Ready to generate your brand profile?
                  </p>
                  <button
                    onClick={() => setShowEmailPrompt(true)}
                    className="w-full py-3.5 bg-violet-700 hover:bg-violet-600 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Generate my brand.md →
                  </button>
                  {!conversationDone && (
                    <p className="text-xs text-zinc-600 text-center">
                      Or keep talking — the more context, the richer the profile.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-300 font-medium">Almost there. What&apos;s your email?</p>
                  <p className="text-xs text-zinc-500">So we can send you your brand audit report.</p>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
                    placeholder="you@brand.com"
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-600 transition-colors"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!contactEmail.trim()}
                    className="w-full py-3.5 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Generate my brand.md →
                  </button>
                  <button
                    onClick={() => setShowEmailPrompt(false)}
                    className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    ← Back to conversation
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-950/30 border border-red-800/40 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar — hidden once email prompt is shown */}
      {!showEmailPrompt && (
        <div className="border-t border-zinc-800/60 bg-[#09090b]/95 backdrop-blur sticky bottom-0">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell us about your brand…"
                rows={1}
                disabled={aiTyping}
                className="flex-1 bg-zinc-900/80 border border-zinc-700/60 rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-600/60 transition-colors resize-none leading-relaxed disabled:opacity-50"
                style={{ maxHeight: "140px", overflowY: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 140) + "px";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || aiTyping}
                className="w-10 h-10 rounded-xl bg-violet-700 hover:bg-violet-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-zinc-700 mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

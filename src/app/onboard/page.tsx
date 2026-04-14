"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import { InstallGuide } from "./InstallGuide";
import CardFlow from "./CardFlow";
import type { ChatMessage } from "@/app/api/onboard/chat/route";

// ── Constants ──────────────────────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Let's build your brand.md. First — what's your brand name and when did you start it?",
};

type Path = null | "cards" | "chat";

// ── Chat bubble ────────────────────────────────────────────────────────────────

function ChatBubble({ message, imageUrl }: { message: ChatMessage; imageUrl?: string | null }) {
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
      <div className={`max-w-[80%] ${imageUrl ? "" : ""}`}>
        {imageUrl && (
          <div className={`mb-1.5 ${isUser ? "flex justify-end" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="mood board"
              className="max-w-[220px] max-h-[160px] object-cover"
              style={{ borderRadius: "2px", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        )}
        {message.content && (
          <div
            className="px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
            style={{
              background: isUser ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
              borderRadius: "2px",
              color: isUser ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.85)",
              border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {message.content}
          </div>
        )}
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

// ── Icons ──────────────────────────────────────────────────────────────────────

function MicIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function StopIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="rgba(239,68,68,0.9)">
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}

function PaperclipIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function XIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Landing screen ─────────────────────────────────────────────────────────────

function LandingScreen({ onSelect }: { onSelect: (path: "cards" | "chat") => void }) {
  const [hovered, setHovered] = useState<"cards" | "chat" | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center px-6" style={{ paddingTop: "88px" }}>
        <div className="w-full max-w-2xl fade-up-1">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="section-tag mb-3">esina · brand identity</p>
            <h1 className="font-goldman text-3xl text-white mb-3">build your brand.md</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              two ways to map your identity. same output.
            </p>
          </div>

          {/* Path cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Cards path — default/highlighted */}
            <button
              onClick={() => onSelect("cards")}
              onMouseEnter={() => setHovered("cards")}
              onMouseLeave={() => setHovered(null)}
              className="relative text-left p-6 flex flex-col gap-3 transition-all duration-200"
              style={{
                background: hovered === "cards"
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              {/* Default badge */}
              <div
                className="absolute top-3 right-3 px-1.5 py-0.5 text-[9px] font-goldman tracking-wider uppercase"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                recommended
              </div>

              {/* Icon */}
              <div className="flex gap-1 mb-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full"
                    style={{ width: `${[40, 28, 20][i - 1]}px`, background: "rgba(255,255,255,0.5)" }}
                  />
                ))}
              </div>

              <div>
                <p className="font-goldman text-white text-base mb-1">quick version</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>5 minutes</p>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Visual cards. Tap your way through nine oblique prompts — songs, scents, places, enemies.
              </p>

              <div
                className="mt-auto pt-3 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>9 cards · live preview</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Chat path */}
            <button
              onClick={() => onSelect("chat")}
              onMouseEnter={() => setHovered("chat")}
              onMouseLeave={() => setHovered(null)}
              className="text-left p-6 flex flex-col gap-3 transition-all duration-200"
              style={{
                background: hovered === "chat"
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              {/* Icon */}
              <div className="flex flex-col gap-1 mb-1">
                {[60, 45].map((w, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full"
                    style={{ width: `${w}%`, background: "rgba(255,255,255,0.25)" }}
                  />
                ))}
              </div>

              <div>
                <p className="font-goldman text-white text-base mb-1">tell us everything</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>10–15 minutes</p>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Have a real conversation about your brand. Richer narrative, deeper identity extraction.
              </p>

              <div
                className="mt-auto pt-3 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>conversational · voice + images</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            both paths generate the same brand.md · ai audit · identity embedding
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [path, setPath] = useState<Path>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  // Parallel array: imageUrl per message (null if no image)
  const [messageImages, setMessageImages] = useState<(string | null)[]>([null]);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [conversationDone, setConversationDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedBrandId, setCompletedBrandId] = useState<string | null>(null);
  const [completedBrandName, setCompletedBrandName] = useState("");

  // Voice input state
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasUsedMic, setHasUsedMic] = useState(false);

  // Image upload state
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageCount = useRef(0);

  // Voice input refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const preRecordTextRef = useRef("");
  const committedTranscriptRef = useRef("");

  // Detect speech support on mount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  useEffect(() => { resizeTextarea(); }, [input, resizeTextarea]);

  // ── Image upload ──────────────────────────────────────────────────────

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }, []);

  // ── Voice toggle ──────────────────────────────────────────────────────

  const toggleListening = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setHasUsedMic(true);
    preRecordTextRef.current = input.trimEnd();
    committedTranscriptRef.current = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          committedTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const base = preRecordTextRef.current;
      const sep = base && (committedTranscriptRef.current || interim) ? " " : "";
      setInput(base + sep + committedTranscriptRef.current + interim);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInput((prev) => prev.trimEnd());
      setTimeout(() => inputRef.current?.focus(), 50);
    };

    recognition.onerror = () => { setIsRecording(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [input, isRecording]);

  // ── Send message ──────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    const hasContent = text.trim() || pendingImage;
    if (!hasContent || aiTyping) return;

    // Stop recording if active
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const displayText = text.trim() || "(mood board image)";
    const userMessage: ChatMessage = { role: "user", content: displayText };
    const newMessages = [...messages, userMessage];
    const imageToSend = pendingImage;

    setMessages(newMessages);
    setMessageImages((prev) => [...prev, imageToSend]);
    setInput("");
    setPendingImage(null);
    setAiTyping(true);
    setError(null);
    messageCount.current += 1;

    try {
      const res = await fetch("/api/onboard/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, imageBase64: imageToSend }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        setMessageImages((prev) => [...prev, null]);
      }
      if (data.done) setConversationDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setAiTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, aiTyping, isRecording, pendingImage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Generate profile ──────────────────────────────────────────────────

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

  // ── Render: install screen ────────────────────────────────────────────

  if (completedBrandId) {
    return <InstallGuide brandId={completedBrandId} brandName={completedBrandName} />;
  }

  // ── Render: generating overlay ────────────────────────────────────────

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-up-1">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-6"
            style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "rgba(255,255,255,0.8)" }}
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

  // ── Render: landing ───────────────────────────────────────────────────

  if (path === null) {
    return <LandingScreen onSelect={setPath} />;
  }

  // ── Render: cards path ────────────────────────────────────────────────

  if (path === "cards") {
    return (
      <CardFlow
        onSwitchToChat={() => setPath("chat")}
        onComplete={(brandId, brandName) => {
          setCompletedBrandId(brandId);
          setCompletedBrandName(brandName);
        }}
      />
    );
  }

  // ── Render: chat interface ────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto" style={{ paddingTop: "88px" }}>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-10">
            <p className="section-tag">esina · brand identity interview</p>
            <button
              onClick={() => setPath(null)}
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              ← back
            </button>
          </div>

          <div className="space-y-0">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} imageUrl={messageImages[i]} />
            ))}
            {aiTyping && <TypingIndicator />}
          </div>

          {/* Generate CTA */}
          {(conversationDone || messageCount.current >= 6) && !aiTyping && (
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {!showEmailPrompt ? (
                <div className="space-y-3">
                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ready to generate your brand profile?
                  </p>
                  <button onClick={() => setShowEmailPrompt(true)} className="btn-primary w-full py-3.5 text-sm">
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
                  <p className="text-sm text-white">almost there. what&apos;s your email?</p>
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
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    ← back to conversation
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              className="mt-4 px-4 py-3 text-sm"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "2px", color: "rgba(252,165,165,0.8)" }}
            >
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      {!showEmailPrompt && (
        <div
          className="sticky bottom-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(122,122,118,0.88)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="max-w-2xl mx-auto px-6 py-4">

            {/* Pending image preview */}
            {pendingImage && (
              <div className="mb-3 flex items-center gap-2">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pendingImage}
                    alt="pending upload"
                    className="h-14 w-14 object-cover flex-shrink-0"
                    style={{ borderRadius: "2px", border: "1px solid rgba(255,255,255,0.2)" }}
                  />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center"
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      borderRadius: "50%",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    <XIcon size={8} />
                  </button>
                </div>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>image ready to send</span>
              </div>
            )}

            <div className="flex items-end gap-2">

              {/* Mic button */}
              {speechSupported && (
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  {!hasUsedMic && (
                    <span
                      className="absolute bottom-full mb-2 whitespace-nowrap text-[10px] text-center pointer-events-none"
                      style={{ color: "rgba(255,255,255,0.4)", left: "50%", transform: "translateX(-50%)" }}
                    >
                      tap to talk
                    </span>
                  )}
                  <button
                    onClick={toggleListening}
                    disabled={aiTyping}
                    title={isRecording ? "tap to stop" : "tap to speak"}
                    className={`w-10 h-10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed ${isRecording ? "mic-recording" : ""}`}
                    style={{
                      background: isRecording ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.1)",
                      border: isRecording ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "2px",
                      color: isRecording ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.65)",
                      transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                    }}
                  >
                    {isRecording ? <StopIcon size={13} /> : <MicIcon size={15} />}
                  </button>
                </div>
              )}

              {/* Image upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={aiTyping}
                title="attach mood board image"
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: pendingImage ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                  border: pendingImage ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  color: "rgba(255,255,255,0.5)",
                  transition: "background 0.2s ease",
                }}
              >
                <PaperclipIcon size={15} />
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "listening…" : "type or speak your answer…"}
                rows={1}
                disabled={aiTyping}
                className="flex-1 px-4 py-3 text-sm focus:outline-none resize-none leading-relaxed disabled:opacity-50"
                style={{
                  background: "rgba(0,0,0,0.15)",
                  border: isRecording
                    ? "1px solid rgba(239,68,68,0.25)"
                    : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "2px",
                  color: "white",
                  maxHeight: "140px",
                  overflowY: "auto",
                  transition: "border-color 0.2s ease",
                }}
              />

              {/* Send button */}
              <button
                onClick={() => sendMessage(input)}
                disabled={(!input.trim() && !pendingImage) || aiTyping}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "#fff", borderRadius: "2px", transition: "opacity 0.15s" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4A4A46">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Footer hint */}
            <p className="text-xs mt-2 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
              {isRecording
                ? "recording — tap stop when done"
                : "enter to send · shift+enter for new line · 📎 for mood board"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

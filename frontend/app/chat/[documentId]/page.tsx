"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { use } from "react";
import axios from "axios";
import { UserButton, useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

// ─── Type Contracts ───────────────────────────────────────────────────────────
// Explicit types for the source data sent by the backend via SSE.
// This matches the JSON format from Python's stream_generator:
//   [{"text": "...", "pages": [1, 2]}, ...]

interface Source {
  text: string;
  pages: number[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

// ─── Markdown Components ──────────────────────────────────────────────────────
// Defined outside the component to avoid re-creating on every render.
// Each component maps a markdown AST node to a styled React element.
//
// Design decisions:
// - neutral-* scale (not gray-*) to avoid the blue tint in Tailwind's gray.
// - emerald accents for interactive/highlighted elements — warm, not "AI blue".
// - Generous spacing (mb-3, mt-4) for readability in chat context.
// - Code blocks have a border to distinguish from the page background.
// - Links open in new tab with noopener/noreferrer for security.

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg font-semibold text-neutral-100 mt-4 mb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-semibold text-neutral-100 mt-3 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-neutral-200 mt-3 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-neutral-100">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-orange-500/50 pl-4 my-3 text-neutral-400 italic">
      {children}
    </blockquote>
  ),
  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    // className is set by ReactMarkdown for fenced code blocks (e.g., "language-python").
    // Its presence distinguishes block code (inside <pre>) from inline code.
    if (className) {
      return (
        <code className={`font-mono text-sm ${className}`}>{children}</code>
      );
    }
    // Inline code — small, pill-shaped, distinct from surrounding text.
    return (
      <code className="bg-[#1a1817] text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono border border-[#262322]">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-[#121110] border border-[#262322] p-4 rounded-lg overflow-x-auto my-3 text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-[#262322] my-4" />,
  a: ({
    href,
    children,
  }: {
    href?: string;
    children?: React.ReactNode;
  }) => (
    <a
      href={href}
      className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

// ─── Helper: format page label from Source ─────────────────────────────────────
function formatPageLabel(pages: number[]): string | null {
  if (!pages || pages.length === 0) return null;
  if (pages.length === 1) return `Page ${pages[0]}`;
  return `Pages ${pages[0]}–${pages[pages.length - 1]}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ref-based buffer for smooth streaming.
  // Chunks accumulate in the ref WITHOUT triggering re-renders.
  // A setInterval syncs the buffer to state at ~20fps (every 50ms).
  const streamBufferRef = useRef("");

  // ─── Load chat history on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`,
          {
            params: { document_id: documentId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data.messages);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [documentId, getToken]);

  // ─── Auto-scroll to bottom when messages change ──────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Focus input after loading or sending ────────────────────────────────
  useEffect(() => {
    if (!loadingHistory && !loading) {
      inputRef.current?.focus();
    }
  }, [loadingHistory, loading]);

  // ─── Send message with streaming ─────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    // IMPORTANT: Do NOT set isStreaming=true here.
    // isStreaming should only be true when we're actually receiving chunks.
    // The gap between loading=true and isStreaming=true is when the
    // "Thinking..." indicator shows — while we wait for the first chunk.
    setIsStreaming(false);
    setError("");
    streamBufferRef.current = "";

    try {
      const token = await getToken();

      // Build chat_history from the last 6 messages (3 user-assistant pairs).
      // This gives the LLM enough context for follow-ups without
      // overwhelming the prompt with too much history.
      const recentMessages = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: userMessage.content,
            document_id: parseInt(documentId),
            chat_history: recentMessages,
          }),
        }
      );

      if (!response.ok) throw new Error("Stream request failed");

      // Add empty assistant message that we'll fill via streaming.
      // NOW mark streaming as active since we're about to receive chunks.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsStreaming(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      // Sync buffer → state at 20fps (every 50ms).
      // This is the key to smooth streaming: chunks accumulate in the ref
      // instantly (no re-render), and the UI updates at a fixed rate.
      const intervalId = setInterval(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.content !== streamBufferRef.current) {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: streamBufferRef.current,
            };
            return updated;
          }
          return prev; // No change — skip re-render
        });
      }, 50);

      let done = false;
      let sourcesData: Source[] = [];

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (data === "[DONE]") {
                // Stream complete — handled after the loop
              } else if (data.startsWith("[SOURCES]")) {
                // Parse source citations from JSON.
                // Format: [SOURCES]<json_array>
                const raw = data.slice(9);
                try {
                  sourcesData = JSON.parse(raw) as Source[];
                } catch {
                  // Fallback for old format (|||−separated strings).
                  // This handles the transition period where the backend
                  // hasn't been redeployed yet but the frontend has.
                  sourcesData = raw
                    .split("|||")
                    .filter(Boolean)
                    .map((text) => ({ text, pages: [] }));
                }
              } else if (data.startsWith("[Error:")) {
                streamBufferRef.current += data;
              } else {
                // Normal text chunk — append to buffer (no re-render!)
                streamBufferRef.current += data;
              }
            }
          }
        }
      }

      // Stream finished — do final sync and cleanup
      clearInterval(intervalId);

      // Final sync: ensure state matches the complete buffer + attach sources.
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...lastMsg,
          content: streamBufferRef.current,
          sources: sourcesData.length > 0 ? sourcesData : undefined,
        };
        return updated;
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      // Clean up the empty assistant message if the stream failed
      // before any content was received. Without this, users would see
      // a ghost empty bubble after an error.
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }, [question, loading, messages, documentId, getToken]);

  // ─── Handle keyboard shortcuts ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex flex-col bg-[#121110] bg-grid-pattern text-neutral-300 selection:bg-orange-500/20 selection:text-orange-300 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-orange-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#121110]/75 border-b border-[#262322] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-xs shadow-md shadow-orange-500/10">
            P
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-100 uppercase">
              Document Chat
            </h1>
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider">Document ID {documentId}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/documents"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition duration-300 font-medium"
          >
            ← Documents
          </a>
          <UserButton />
        </div>
      </header>

      {/* ── Messages Area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#262322] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3e3937]">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">
          {/* Loading skeleton */}
          {loadingHistory && (
            <div className="flex flex-col gap-4 mt-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`max-w-md px-4 py-3 rounded-2xl animate-pulse ${
                    i % 2 === 1
                      ? "bg-[#1a1817]/50 border border-[#262322]/50 self-end"
                      : "bg-[#121110]/40 border border-[#262322]/40 self-start"
                  }`}
                >
                  <div className="h-3 bg-[#262322] rounded w-48"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingHistory && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-32 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1817] border border-[#262322] flex items-center justify-center mb-4 text-orange-400/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <p className="text-neutral-400 text-xs font-semibold mb-1">
                Ask anything about your document
              </p>
              <p className="text-neutral-600 text-[10px]">
                Answers are generated from the PDF content with page citations
              </p>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => {
            const isCurrentlyStreaming =
              isStreaming && i === messages.length - 1 && msg.role === "assistant";

            return (
              <div key={i} className="flex flex-col">
                {msg.role === "user" ? (
                  /* ── User Message ─────────────────────────────────── */
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-[#1a1817] border border-[#262322] text-neutral-100 rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* ── Assistant Message ────────────────────────────── */
                  <div className="flex gap-3 max-w-[85%]">
                    {/* AI indicator dot */}
                    <div className="w-6 h-6 rounded-full bg-orange-950/60 border border-orange-900/40 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Render markdown for ALL states (streaming + final). */}
                      <div className="text-sm leading-relaxed text-neutral-300 prose-chat">
                        <ReactMarkdown components={markdownComponents}>
                          {msg.content}
                        </ReactMarkdown>

                        {/* Streaming cursor — thin blinking line. */}
                        {isCurrentlyStreaming && (
                          <span
                            className="inline-block w-0.5 h-4 bg-orange-500/70 rounded-full ml-0.5 align-middle cursor-blink"
                          />
                        )}
                      </div>

                      {/* ── Source Citations ──────────────────────────── */}
                      {msg.sources && msg.sources.length > 0 && (
                        <details className="mt-3 group">
                          <summary className="text-xs text-neutral-600 hover:text-orange-400 cursor-pointer flex items-center gap-1.5 select-none transition">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 transition-transform duration-200 group-open:rotate-90"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            {msg.sources.length} source
                            {msg.sources.length !== 1 ? "s" : ""} referenced
                          </summary>

                          <div className="mt-2 space-y-2 pl-0.5">
                            {msg.sources.map((src, si) => {
                              const pageLabel = formatPageLabel(src.pages);
                              return (
                                <div
                                  key={si}
                                  className="bg-[#121110] border border-[#262322] rounded-xl p-3"
                                >
                                  <div className="flex items-center gap-2 mb-1.5">
                                    {pageLabel && (
                                      <span className="text-[10px] bg-orange-950/50 text-orange-400 px-2 py-0.5 rounded-md border border-orange-900/30 font-semibold uppercase tracking-wider">
                                        {pageLabel}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider font-semibold">
                                      Source {si + 1}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-500 leading-relaxed">
                                    {src.text.length > 300
                                      ? src.text.slice(0, 300) + "…"
                                      : src.text}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking indicator */}
          {loading && !isStreaming && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-orange-950/60 border border-orange-900/40 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                <span className="thinking-dots">Thinking</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <p className="text-red-400/80 text-xs bg-red-950/20 border border-red-900/20 rounded-lg px-4 py-2">
                {error}
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Area ──────────────────────────────────────────────────── */}
      <div className="border-t border-[#262322] px-6 py-4 shrink-0 bg-[#121110]/20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document…"
            disabled={loading}
            className="flex-1 bg-[#121110]/50 text-neutral-200 rounded-xl px-4 py-2.5 text-xs outline-none border border-[#262322] focus:border-orange-500/30 placeholder:text-neutral-600 disabled:opacity-40 transition"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !question.trim()}
            className="bg-[#ededed] hover:bg-white disabled:bg-[#1a1817] disabled:text-neutral-600 text-neutral-950 px-5 py-2.5 rounded-full text-xs font-bold transition duration-300 disabled:cursor-not-allowed shrink-0 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
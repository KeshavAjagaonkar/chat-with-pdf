"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { use } from "react";
import { flushSync } from "react-dom";
import axios from "axios";
import { UserButton, useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Sparkles, Send, Loader2, ArrowLeft, ChevronRight, MessageSquare } from "lucide-react";

// ─── Type Contracts ───────────────────────────────────────────────────────────
// Explicit types for the source data sent by the backend via SSE.
// This matches the JSON format from Python's stream_generator:
//   [{"text": "...", "pages": [1, 2]}, ...]

interface Source {
  text: string;
  pages: number[];
  filename?: string;
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
// - zinc-* scale to avoid the blue/sepia tint.
// - amber accents for interactive/highlighted elements — warm, premium, and highly legible.
// - Generous spacing (mb-3, mt-4) for readability in chat context.
// - Code blocks have a border to distinguish from the page background.
// - Links open in new tab with noopener/noreferrer for security.

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg font-semibold text-zinc-100 mt-4 mb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-semibold text-zinc-200 mt-3 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-zinc-200 mt-3 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0 leading-relaxed text-zinc-300">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-300">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-300">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-zinc-50">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-zinc-300">{children}</em>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-amber-500/50 pl-4 my-3 text-zinc-400 italic">
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
      <code className="bg-zinc-900 text-amber-400 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800/80">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto my-3 text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-zinc-800 my-4" />,
  a: ({
    href,
    children,
  }: {
    href?: string;
    children?: React.ReactNode;
  }) => (
    <a
      href={href}
      className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-4 border border-zinc-800 rounded-xl bg-zinc-900/30 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <table className="min-w-full divide-y divide-zinc-800 text-left border-collapse text-xs md:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-zinc-900/80 text-zinc-200 uppercase tracking-wider font-semibold text-[10px] md:text-xs">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody className="divide-y divide-zinc-800 bg-transparent text-zinc-300">
      {children}
    </tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="hover:bg-zinc-800/10 transition-colors duration-150">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-4 py-3 font-semibold border-b border-zinc-800">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-4 py-3 leading-relaxed border-b border-zinc-800/50">
      {children}
    </td>
  ),
};

// ─── Helper: format page label from Source ─────────────────────────────────────
function formatPageLabel(pages: number[], filename?: string): string | null {
  if (!pages || pages.length === 0) {
    if (filename) return filename;
    return null;
  }
  const pagesStr = pages.length === 1 ? `Page ${pages[0]}` : `Pages ${pages[0]}–${pages[pages.length - 1]}`;
  if (filename) {
    return `${pagesStr} of ${filename}`;
  }
  return pagesStr;
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userHasScrolledUpRef = useRef(false);

  // Direct DOM ref for the streaming message.
  // During streaming we bypass React state entirely and mutate this div's
  // innerHTML directly. This is the same technique used by ChatGPT —
  // it eliminates all mid-stream re-renders, which is the root cause of
  // the scroll fighting and page juggling the user was experiencing.
  const streamingDivRef = useRef<HTMLDivElement>(null);
  const streamBufferRef = useRef("");

  // ─── Scroll helpers ──────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // If the user scrolls more than 80px from the bottom, pause auto-scroll.
    userHasScrolledUpRef.current = distanceToBottom > 80;
  }, []);

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

  // ─── Auto-scroll when committed messages change (new message sent/received) ──
  // This only fires for discrete events (send message, history load),
  // NOT during streaming — streaming uses direct DOM mutation below.
  useEffect(() => {
    if (!userHasScrolledUpRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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

    // Snapshot current messages BEFORE the state update so we have the
    // correct, up-to-date history for the API call. setMessages is async
    // and wouldn't reflect the new user message in the same tick anyway.
    const historySnapshot = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setIsStreaming(false);
    setError("");
    streamBufferRef.current = "";
    // Clear any leftover text from the previous stream's DOM node.
    // React may reuse the same DOM element, so we must explicitly reset it.
    if (streamingDivRef.current) {
      streamingDivRef.current.textContent = "";
    }
    userHasScrolledUpRef.current = false;  // Always snap to bottom on new send

    try {
      const token = await getToken();

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
            // Use the snapshot taken before state mutation — this is the
            // correct, up-to-date conversation history at time of send.
            chat_history: historySnapshot,
          }),
        }
      );

      if (!response.ok) throw new Error("Stream request failed");

      // flushSync forces React to synchronously commit this state update
      // to the DOM before moving to the next line. Without this, setIsStreaming(true)
      // is batched and the streaming div hasn't mounted yet when the first chunk
      // arrives, making streamingDivRef.current null and losing early tokens.
      flushSync(() => {
        setIsStreaming(true);
      });

      // Snap to bottom when streaming starts so user sees the first token
      scrollToBottom();

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      let done = false;
      let sourcesData: Source[] = [];
      let streamParserBuffer = ""; // Buffer to handle TCP packet fragmentation

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const text = decoder.decode(value, { stream: true });
          streamParserBuffer += text;

          let boundary = streamParserBuffer.indexOf("\n\n");
          while (boundary !== -1) {
            const event = streamParserBuffer.slice(0, boundary).trim();
            streamParserBuffer = streamParserBuffer.slice(boundary + 2);

            const lines = event.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  // Stream complete — handled after the loop
                } else if (data.startsWith("[SOURCES]")) {
                  const raw = data.slice(9);
                  try {
                    sourcesData = JSON.parse(raw) as Source[];
                  } catch {
                    sourcesData = raw
                      .split("|||")
                      .filter(Boolean)
                      .map((text) => ({ text, pages: [] }));
                  }
                } else if (data.startsWith("[Error:")) {
                  streamBufferRef.current += data;
                } else {
                  // Decode the JSON-encoded chunk to restore newlines.
                  let decoded = data;
                  if (data.startsWith('"') && data.endsWith('"')) {
                    try { decoded = JSON.parse(data); } catch { /* use raw */ }
                  }
                  streamBufferRef.current += decoded;

                  // ── Direct DOM mutation: NO React re-render ────────────
                  // Append the new text directly to the streaming div.
                  // This is the key: the browser paints only the new text node,
                  // not the entire component tree. Zero scroll fighting.
                  if (streamingDivRef.current) {
                    streamingDivRef.current.textContent = streamBufferRef.current;
                    // Only auto-scroll if user has not manually scrolled up
                    if (!userHasScrolledUpRef.current) {
                      scrollToBottom();
                    }
                  }
                }
              }
            }
            
            boundary = streamParserBuffer.indexOf("\n\n");
          }
        }
      }

      // Stream finished.
      // Snapshot the accumulated content and sources into local variables BEFORE
      // calling setMessages. setMessages uses a functional updater that React may
      // defer — if the finally block runs first it clears streamBufferRef.current
      // to "", causing the committed message to have empty content.
      const finalContent = streamBufferRef.current;
      const finalSources = sourcesData.length > 0 ? sourcesData : undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: finalContent,
          sources: finalSources,
        },
      ]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsStreaming(false);
      streamBufferRef.current = "";
      // Also clear the DOM node so it's pristine if React reuses it next render.
      if (streamingDivRef.current) {
        streamingDivRef.current.textContent = "";
      }
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
    <main className="min-h-screen flex flex-col bg-zinc-950 bg-grid-pattern text-zinc-300 selection:bg-amber-500/20 selection:text-white relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-amber-500/2 rounded-full blur-[90px] pointer-events-none" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-white" strokeWidth={2} />
            <span className="text-[15px] font-semibold tracking-tight text-white">chat-with-pdf</span>
          </a>
          <span className="text-zinc-500 text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-medium">
            ID {documentId}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/documents"
            className="text-xs text-zinc-400 hover:text-white transition duration-200 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Documents
          </a>
          <UserButton />
        </div>
      </header>

      {/* ── Messages Area ───────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
      >
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">
          
          {/* Loading history skeleton */}
          {loadingHistory && (
            <div className="flex flex-col gap-4 mt-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`max-w-md px-4 py-3 rounded-2xl animate-pulse ${
                    i % 2 === 1
                      ? "bg-zinc-900 border border-zinc-800 self-end"
                      : "bg-zinc-900/50 border border-zinc-800 self-start"
                  }`}
                >
                  <div className="h-3 bg-zinc-800 rounded w-48"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingHistory && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-32 text-center select-none">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-600">
                <MessageSquare className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <p className="text-zinc-400 text-xs font-semibold mb-1">
                Ask anything about this document
              </p>
              <p className="text-zinc-500 text-[11px]">
                Answers are compiled from vector chunks with precise page citations.
              </p>
            </div>
          )}

          {/* ── Committed message list ────────────────────────────────────
               Only contains finalized messages. ReactMarkdown runs on these.
               This list is NEVER mutated during streaming — zero re-renders.
          ────────────────────────────────────────────────────────────── */}
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col">
              {msg.role === "user" ? (
                /* ── User Message ─────────────────────────────────── */
                <div className="flex justify-end">
                  <div className="max-w-[75%] bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* ── Assistant Message (committed, fully formatted) ── */
                <div className="flex gap-3.5 max-w-[90%]">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1 select-none text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 select-none">
                      <span className="text-[10px] font-sans font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                        chat-with-pdf AI
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Traceable Response</span>
                    </div>
                    <div className="text-sm leading-relaxed font-sans">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {/* ── Source Citations ──────────────────────────── */}
                    {msg.sources && msg.sources.length > 0 && (
                      <details className="mt-3 group">
                        <summary className="text-xs text-zinc-500 hover:text-amber-400 cursor-pointer flex items-center gap-1.5 select-none transition font-medium">
                          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-90 text-zinc-600" />
                          {msg.sources.length} source reference{msg.sources.length !== 1 ? "s" : ""} matched
                        </summary>
                        <div className="mt-2 space-y-2 pl-0.5">
                          {msg.sources.map((src, si) => {
                            const pageLabel = formatPageLabel(src.pages, src.filename);
                            return (
                              <div key={si} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3.5">
                                <div className="flex items-center gap-2 mb-1.5 font-sans">
                                  {pageLabel && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-semibold uppercase tracking-wider">
                                      {pageLabel}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                                    Segment {si + 1}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                  {src.text.length > 300 ? src.text.slice(0, 300) + "…" : src.text}
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
          ))}

          {/* ── Thinking indicator (waiting for first token) ─────────── */}
          {loading && !isStreaming && (
            <div className="flex gap-3.5 max-w-[90%] animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1 text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 select-none">
                  <span className="text-[10px] font-sans font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                    chat-with-pdf AI
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Scanning database index...</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Live streaming bubble ────────────────────────────────────
               This is rendered once when isStreaming=true and stays mounted
               until the stream ends. Text is injected via direct DOM mutation
               (streamingDivRef.textContent), so React never re-renders during
               streaming. This is the key to zero scroll juggling.
          ────────────────────────────────────────────────────────────── */}
          {isStreaming && (
            <div className="flex gap-3.5 max-w-[90%]">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1 select-none text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 select-none">
                  <span className="text-[10px] font-sans font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                    chat-with-pdf AI
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Traceable Response</span>
                </div>
                {/* Plain text div — mutated directly, NO ReactMarkdown during streaming.
                    On stream end, this unmounts and the committed message above renders with full markdown. */}
                <div
                  ref={streamingDivRef}
                  className="text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap"
                />
                <span
                  className="inline-block w-0.5 h-4 bg-amber-400 rounded-full ml-0.5 align-middle cursor-blink mt-1"
                  style={{ animation: "cursor-blink 1s step-end infinite" }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <p className="text-red-400/80 text-xs bg-red-950/20 border border-red-900/20 rounded-lg px-4 py-2 font-sans">
                [Error] {error}
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Area ──────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-800/50 px-6 py-4 shrink-0 bg-zinc-950/20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            disabled={loading}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500/40 text-zinc-100 rounded-xl px-4 py-2.5 text-xs outline-none placeholder:text-zinc-600 disabled:opacity-40 transition-colors duration-200 font-sans"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !question.trim()}
            className="bg-zinc-100 hover:bg-white disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-full text-xs font-semibold transition duration-300 disabled:cursor-not-allowed shrink-0 shadow-sm flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { use } from "react";
import axios from "axios";
import { UserButton, useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

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

  // Ref-based buffer for smooth streaming.
  // Chunks accumulate in the ref WITHOUT triggering re-renders.
  // A setInterval syncs the buffer to state at ~20fps (every 50ms).
  const streamBufferRef = useRef("");

  // Load chat history on mount
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
        console.error("Failed to load chat history");
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [documentId, getToken]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setIsStreaming(true);
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

      // Add empty assistant message that we'll fill via streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
      let sourcesData: string[] = [];

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
                // Stream complete
              } else if (data.startsWith("[SOURCES]")) {
                // Parse source citations
                const raw = data.slice(9);
                sourcesData = raw.split("|||").filter(Boolean);
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

      // Final sync: ensure state matches the complete buffer
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
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }, [question, loading, messages, documentId, getToken]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 text-white">

      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Chat with PDF</h1>
          <p className="text-gray-500 text-xs">Document #{documentId}</p>
        </div>

        <div className="flex items-center gap-4">
          <a href="/documents"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← My Documents
          </a>
          <UserButton />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3">
        {/* Loading skeleton */}
        {loadingHistory && (
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`max-w-xl px-4 py-3 rounded-xl animate-pulse ${
                  i % 2 === 1 ? "bg-blue-600/30 self-end" : "bg-gray-800 self-start"
                }`}
              >
                <div className="h-3 bg-gray-700 rounded w-48"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingHistory && messages.length === 0 && (
          <p className="text-gray-600 text-sm text-center mt-20">
            Ask anything about your PDF
          </p>
        )}

        {messages.map((msg, i) => {
          // Is this the last message AND currently streaming?
          const isCurrentlyStreaming = isStreaming && i === messages.length - 1 && msg.role === "assistant";

          return (
            <div key={i} className="flex flex-col gap-1">
              <div
                className={`max-w-xl px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-blue-600 self-end"
                  : "bg-gray-800 self-start"
                }`}
              >
                {msg.role === "assistant" ? (
                  isCurrentlyStreaming ? (
                    // During streaming: render plain text (fast, no markdown overhead)
                    // Add blinking cursor ▌ for visual feedback
                    <span className="whitespace-pre-wrap">
                      {msg.content}
                      <span className="animate-pulse text-blue-400">▌</span>
                    </span>
                  ) : (
                    // After streaming: render with full markdown formatting
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ children }) => (
                          <code className="bg-gray-900 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto my-2 text-xs">{children}</pre>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )
                ) : (
                  msg.content
                )}
              </div>

              {/* Source citations — shown below assistant messages */}
              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <details className="self-start max-w-xl mt-1">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition px-2">
                    📄 Sources ({msg.sources.length})
                  </summary>
                  <div className="mt-2 flex flex-col gap-2 px-2">
                    {msg.sources.map((src, si) => (
                      <div key={si} className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
                        {src.length > 300 ? src.slice(0, 300) + "..." : src}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}

        {/* Thinking indicator — shown when waiting for first chunk */}
        {loading && !isStreaming && (
          <div className="bg-gray-800 self-start px-4 py-3 rounded-xl text-sm text-gray-400">
            Thinking...
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 px-6 py-4 flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !question.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          Send
        </button>
      </div>

    </main>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { use } from "react";
import axios from "axios";
import { UserButton, useAuth } from "@clerk/nextjs";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history when the page opens.
  // This runs once on mount (empty dependency array would cause issues
  // with getToken, so we include it but getToken is stable across renders).
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = await getToken();

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`,
          {
            params: { document_id: documentId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(response.data.messages);
      } catch (err) {
        // Don't show an error for history load failure —
        // the user can still chat, they just won't see past messages.
        console.error("Failed to load chat history");
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [documentId, getToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`,
        {
          question: userMessage.content,
          document_id: parseInt(documentId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Show loading skeleton while fetching chat history */}
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

        {/* Empty state — only show after history has loaded and there are truly no messages */}
        {!loadingHistory && messages.length === 0 && (
          <p className="text-gray-600 text-sm text-center mt-20">
            Ask anything about your PDF
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xl px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === "user"
              ? "bg-blue-600 self-end"
              : "bg-gray-800 self-start"
              }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
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
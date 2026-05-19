"use client";

import { useState } from "react";
import { use } from "react";
import axios from "axios";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    const response = await axios.post("http://localhost:3001/api/chat", {
      question,
      document_id: parseInt(documentId),
    });

    const assistantMessage: Message = {
      role: "assistant",
      content: response.data.answer,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold">Chat with your PDF</h1>
        <p className="text-gray-400 text-xs">Document ID: {documentId}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-20">
            Ask anything about your PDF
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-2xl px-4 py-3 rounded-xl text-sm ${msg.role === "user"
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
      </div>

      <div className="border-t border-gray-800 px-6 py-4 flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question about your PDF..."
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition"
        >
          Send
        </button>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth, UserButton } from "@clerk/nextjs";
import { FileText, Search, Trash2, MessageSquare, Home, Upload } from "lucide-react";

interface Document {
  id: number;
  filename: string;
  uploaded_at: string;
}

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDocuments(response.data.documents);
      } catch (err) {
        setError("Failed to load documents. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [getToken]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteDocument = async (docId: number, filename: string) => {
    if (!window.confirm(`Delete "${filename}"? This will also delete all chat history.`)) {
      return;
    }
    setDeleting(docId);

    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/${docId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      setError("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  // Filter documents in real time
  const filteredDocuments = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 relative selection:bg-amber-500/20 selection:text-white">
      
      {/* Decorative gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-amber-500/2 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between shrink-0">
        <a href="/" className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-tight text-white">chat-with-pdf</span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-xs text-zinc-400 hover:text-white transition duration-200 font-medium flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload new
          </a>
          <UserButton />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 py-8 relative">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* Search bar inside documents list */}
          {!loading && !error && documents.length > 0 && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search through indexed PDFs..."
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-600 rounded-lg px-4 py-2.5 pl-10 text-xs text-white outline-none placeholder:text-zinc-600 transition-colors duration-200"
              />
              <Search className="w-4 h-4 text-zinc-650 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="h-3.5 bg-zinc-800 rounded w-2/3 mb-2.5"></div>
                    <div className="h-2 bg-zinc-800 rounded w-1/3"></div>
                  </div>
                  <div className="h-7 bg-zinc-800 rounded w-16"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error display */}
          {error && (
            <p className="text-red-400/80 text-xs text-center py-6 bg-red-950/10 border border-red-900/20 rounded-xl">
              {error}
            </p>
          )}

          {/* Empty state */}
          {!loading && !error && documents.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4">
              <p className="text-zinc-500 text-xs font-mono">
                No documents uploaded yet
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-zinc-100 text-zinc-900 font-medium px-5 py-2 rounded-lg hover:bg-white transition-all duration-200 text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload your first PDF
              </button>
            </div>
          )}

          {/* Filtered empty state */}
          {!loading && !error && documents.length > 0 && filteredDocuments.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
              No documents match your query &ldquo;{searchQuery}&rdquo;.
            </div>
          )}

          {/* Document list */}
          {!loading && !error && filteredDocuments.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between hover:border-zinc-700 transition-colors duration-200 group"
                >
                  <div className="min-w-0 flex-1 pr-4 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-650 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Uploaded {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Delete doc icon button */}
                    <button
                      onClick={() => deleteDocument(doc.id, doc.filename)}
                      disabled={deleting === doc.id}
                      className="text-zinc-600 hover:text-red-400 disabled:opacity-30 transition p-2 rounded-lg hover:bg-zinc-800/50"
                      title="Delete document"
                    >
                      {deleting === doc.id ? (
                        <span className="text-[10px] animate-pulse">...</span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Chat capsule button */}
                    <button
                      onClick={() => router.push(`/chat/${doc.id}`)}
                      className="bg-zinc-800 hover:bg-zinc-100 text-zinc-300 hover:text-zinc-900 border border-zinc-700/50 hover:border-transparent text-sm font-medium py-1.5 px-4 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

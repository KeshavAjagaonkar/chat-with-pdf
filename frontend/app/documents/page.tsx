"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth, UserButton } from "@clerk/nextjs";

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
    <main className="min-h-screen flex flex-col bg-[#121110] text-neutral-300 relative selection:bg-orange-500/20 selection:text-orange-300">
      
      {/* Decorative gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#121110]/75 border-b border-[#262322] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="w-7 h-7 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-xs shadow-md shadow-orange-500/10">
            P
          </a>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-100 uppercase">My Documents</h1>
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
              {loading ? "Loading indexing..." : `${documents.length} document${documents.length !== 1 ? "s" : ""} active`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-xs text-neutral-400 hover:text-neutral-100 transition duration-300 font-medium"
          >
            ← Upload new
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
                className="w-full bg-[#1a1817]/50 border border-[#262322] hover:border-[#383330] focus:border-orange-500/30 rounded-full px-4 py-2.5 pl-10 text-xs text-neutral-200 outline-none placeholder:text-neutral-600 transition"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 animate-pulse"
                >
                  <div className="h-3.5 bg-neutral-900 rounded w-2/3 mb-2.5"></div>
                  <div className="h-2 bg-neutral-900 rounded w-1/3"></div>
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
            <div className="text-center py-16 bg-[#1a1817]/30 border border-dashed border-[#262322] rounded-2xl flex flex-col items-center justify-center gap-4">
              <p className="text-neutral-500 text-xs">
                No documents uploaded yet
              </p>
              <a
                href="/dashboard"
                className="bg-[#ededed] hover:bg-white text-neutral-950 text-[11px] uppercase tracking-wider font-bold py-2.5 px-6 rounded-full transition duration-300 shadow shadow-black/10"
              >
                Upload your first PDF
              </a>
            </div>
          )}

          {/* Filtered empty state */}
          {!loading && !error && documents.length > 0 && filteredDocuments.length === 0 && (
            <div className="text-center py-16 bg-[#1a1817]/30 border border-dashed border-[#262322] rounded-2xl text-neutral-500 text-xs">
              No documents match your query &ldquo;{searchQuery}&rdquo;.
            </div>
          )}

          {/* Document list */}
          {!loading && !error && filteredDocuments.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-4.5 flex items-center justify-between hover:bg-[#1a1817]/80 hover:border-[#383330] transition-all duration-300 group transform hover:scale-[1.005]"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-xs font-semibold text-neutral-200 truncate group-hover:text-neutral-100 transition">
                      {doc.filename}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Uploaded {formatDate(doc.uploaded_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Delete doc icon button */}
                    <button
                      onClick={() => deleteDocument(doc.id, doc.filename)}
                      disabled={deleting === doc.id}
                      className="text-neutral-600 hover:text-red-400 disabled:opacity-30 transition p-2 rounded-lg hover:bg-[#121110] border border-transparent hover:border-[#262322]"
                      title="Delete document"
                    >
                      {deleting === doc.id ? (
                        <span className="text-[10px] font-mono animate-pulse">...</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>

                    {/* Chat capsule button */}
                    <button
                      onClick={() => router.push(`/chat/${doc.id}`)}
                      className="bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-neutral-950 border border-orange-500/20 hover:border-transparent text-xs font-bold py-1.5 px-5 rounded-full transition duration-300 shadow shadow-orange-500/5 hover:shadow-orange-500/20"
                    >
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

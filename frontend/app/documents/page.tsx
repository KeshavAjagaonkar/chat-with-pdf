"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth, UserButton } from "@clerk/nextjs";

// TypeScript interface for a document returned by the API.
// This gives us autocomplete and type-checking when working with documents.
interface Document {
  id: number;
  filename: string;
  uploaded_at: string; // ISO date string from Python
}

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null); // tracks which doc is being deleted

  // useEffect with [] runs once on mount — perfect for fetching data.
  // We define an async function inside because useEffect itself can't be async.
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

  // Format ISO date string to something human-friendly.
  // toLocaleDateString uses the user's browser locale automatically.
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteDocument = async (docId: number, filename: string) => {
    // Simple confirmation — prevents accidental deletes.
    if (!window.confirm(`Delete "${filename}"? This will also delete all chat history for this document.`)) {
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

      // Remove from local state immediately (optimistic UI).
      // No need to refetch the entire list from the server.
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      setError("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 text-white">

      {/* Header bar — consistent with chat page */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">My Documents</h1>
          <p className="text-gray-500 text-xs">
            {loading ? "Loading..." : `${documents.length} document${documents.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a href="/"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Upload new
          </a>
          <UserButton />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-6">

        {/* Loading state — skeleton cards */}
        {loading && (
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-xl p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-800 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <p className="text-red-400 text-sm text-center mt-20">{error}</p>
          </div>
        )}

        {/* Empty state — no documents uploaded yet */}
        {!loading && !error && documents.length === 0 && (
          <div className="max-w-2xl mx-auto text-center mt-20">
            <p className="text-gray-500 text-sm mb-4">
              No documents uploaded yet
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition text-sm"
            >
              Upload your first PDF
            </a>
          </div>
        )}

        {/* Document list */}
        {!loading && !error && documents.length > 0 && (
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-900 rounded-xl p-5 flex items-center justify-between hover:bg-gray-800/80 transition"
              >
                <div className="min-w-0 flex-1">
                  {/* min-w-0 prevents long filenames from overflowing the flex container */}
                  <p className="text-sm font-medium text-white truncate">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded {formatDate(doc.uploaded_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => deleteDocument(doc.id, doc.filename)}
                    disabled={deleting === doc.id}
                    className="text-gray-500 hover:text-red-400 disabled:opacity-50 transition p-2 rounded-lg hover:bg-gray-800"
                    title="Delete document"
                  >
                    {deleting === doc.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/chat/${doc.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

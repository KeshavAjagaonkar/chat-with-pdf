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

export default function DashboardPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocuments(response.data.documents);
      } catch (err) {
        setError("Failed to load documents.");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setUploadError("Only PDF files are allowed.");
        setFile(null);
        return;
      }
      if (selected.size > MAX_FILE_SIZE) {
        setUploadError("File must be under 10MB.");
        setFile(null);
        return;
      }
      setFile(selected);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the new document to the list optimistically
      const newDoc: Document = {
        id: response.data.document_id,
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (err) {
      setUploadError("Upload failed. Make sure the backend is running.");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId: number, filename: string) => {
    if (!window.confirm(`Delete "${filename}"? This will also delete all chat history.`)) return;
    setDeleting(docId);

    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/${docId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      setError("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-gray-500 text-xs">Upload & manage your PDFs</p>
        </div>
        <UserButton />
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Upload section */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload a new PDF
            </h2>

            <div className="flex gap-3 items-start">
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1 text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
              />
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-5 rounded-lg transition text-sm shrink-0"
              >
                {uploading ? "Processing..." : "Upload"}
              </button>
            </div>

            {file && (
              <p className="text-green-400 text-xs mt-2">✓ {file.name}</p>
            )}
            {uploadError && (
              <p className="text-red-400 text-xs mt-2">{uploadError}</p>
            )}
          </div>

          {/* Documents section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Your Documents
              {!loading && (
                <span className="text-gray-600 font-normal">({documents.length})</span>
              )}
            </h2>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-900 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded w-2/3 mb-3"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && <p className="text-red-400 text-sm text-center mt-8">{error}</p>}

            {/* Empty state */}
            {!loading && !error && documents.length === 0 && (
              <div className="text-center py-12 text-gray-600 text-sm">
                No documents yet. Upload your first PDF above!
              </div>
            )}

            {/* Document list */}
            {!loading && !error && documents.length > 0 && (
              <div className="flex flex-col gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-900 rounded-xl p-5 flex items-center justify-between hover:bg-gray-800/80 transition border border-gray-800/50"
                  >
                    <div className="min-w-0 flex-1">
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

        </div>
      </div>
    </main>
  );
}

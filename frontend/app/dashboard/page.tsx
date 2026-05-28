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

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

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

  // Real-time document filtering
  const filteredDocuments = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#121110] text-neutral-300 relative selection:bg-orange-500/20 selection:text-orange-300">
      
      {/* Decorative warm radial gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-orange-600/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#121110]/75 border-b border-[#262322] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="w-7 h-7 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-xs shadow-md shadow-orange-500/10">
            P
          </a>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-100 uppercase">Dashboard</h1>
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider">Ingest & Manage PDFs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition duration-300 font-medium"
          >
            ← Home
          </a>
          <UserButton />
        </div>
      </header>

      {/* Content wrapper */}
      <div className="flex-1 px-6 py-8 relative">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Upload Section (Sleek custom dotted zone) */}
          <div className="bg-[#1a1817]/80 border border-[#262322] rounded-2xl p-6 shadow-xl shadow-black/40 backdrop-blur-sm relative overflow-hidden group hover:border-[#262322]/80 transition duration-300">
            
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload PDF Document
            </h2>

            {/* Custom Styled Drag Zone Label */}
            <div className="border border-dashed border-[#262322] rounded-xl p-6 flex flex-col items-center justify-center bg-[#121110]/40 hover:bg-[#1a1817]/40 hover:border-orange-500/20 transition-all duration-300 group cursor-pointer relative">
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="w-10 h-10 bg-orange-950/40 border border-orange-900/20 text-orange-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>

              <span className="text-xs text-neutral-300 font-semibold mb-1">Click to select PDF or drag it here</span>
              <span className="text-[10px] text-neutral-600">Supports PDF format up to 10MB</span>
            </div>

            {/* Ingest Action Buttons */}
            {file && (
              <div className="mt-4 flex items-center justify-between bg-[#121110]/40 border border-[#262322] rounded-xl px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-orange-400">✓</span>
                  <span className="text-neutral-200 font-medium truncate">{file.name}</span>
                  <span className="text-neutral-600 text-[10px] shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-[#ededed] hover:bg-white text-neutral-950 font-bold px-5 py-2 rounded-full transition text-[11px] uppercase tracking-wider shrink-0 disabled:bg-neutral-800 disabled:text-neutral-500 shadow shadow-black/10"
                >
                  {uploading ? "Parsing..." : "Ingest PDF"}
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-red-400/80 text-xs mt-3 bg-red-950/20 border border-red-900/20 px-3 py-1.5 rounded-lg">
                {uploadError}
              </p>
            )}
          </div>

          {/* Documents Section (With integrated real-time search) */}
          <div className="flex flex-col gap-4">
            
            {/* Header + Search bar layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262322] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your Documents
                {!loading && (
                  <span className="text-neutral-600 font-normal">({filteredDocuments.length})</span>
                )}
              </h2>

              {/* Dynamic search input field */}
              {documents.length > 0 && (
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full bg-[#1a1817]/50 border border-[#262322] hover:border-[#383330] focus:border-orange-500/30 rounded-full px-3.5 py-1.5 pl-8 text-xs text-neutral-200 outline-none placeholder:text-neutral-600 transition"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 animate-pulse flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 bg-neutral-900 rounded w-2/3 mb-2.5"></div>
                      <div className="h-2 bg-neutral-900 rounded w-1/3"></div>
                    </div>
                    <div className="h-7 bg-neutral-900 rounded w-16"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error display */}
            {error && <p className="text-red-400/80 text-xs text-center py-6 bg-red-950/10 border border-red-900/20 rounded-xl">{error}</p>}

            {/* Empty state */}
            {!loading && !error && documents.length === 0 && (
              <div className="text-center py-16 bg-[#1a1817]/30 border border-dashed border-[#262322] rounded-2xl text-neutral-500 text-xs leading-relaxed">
                No documents indexed yet. Upload and ingest your first PDF above!
              </div>
            )}

            {/* Filtered empty state */}
            {!loading && !error && documents.length > 0 && filteredDocuments.length === 0 && (
              <div className="text-center py-16 bg-[#1a1817]/30 border border-dashed border-[#262322] rounded-2xl text-neutral-500 text-xs leading-relaxed">
                No documents match your search query &ldquo;{searchQuery}&rdquo;.
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
                        Indexed {formatDate(doc.uploaded_at)}
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
      </div>
    </main>
  );
}

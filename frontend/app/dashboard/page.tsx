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
    <main className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#e8e4df] relative selection:bg-[#d4a574]/20 selection:text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f0f0f]/80 border-b border-white/[0.06] px-6 md:px-12 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a574] to-[#c4886a] flex items-center justify-center shadow-lg shadow-[#d4a574]/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0f0f0f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">DocQuery</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-[#a09a93] hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            Home
          </a>
          <UserButton />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 relative">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Upload Section */}
          <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.1] transition-colors duration-300">
            
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4a574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload PDF
            </h2>

            {/* Drop Zone */}
            <div className="border border-dashed border-white/[0.08] rounded-xl p-6 flex flex-col items-center justify-center bg-[#0f0f0f]/40 hover:bg-white/[0.02] hover:border-[#d4a574]/20 transition-all duration-300 cursor-pointer relative">
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="w-10 h-10 bg-[#d4a574]/10 border border-[#d4a574]/20 text-[#d4a574] rounded-xl flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>

              <span className="text-sm text-[#c4bfb8] font-medium mb-1">Click to select a PDF or drag it here</span>
              <span className="text-xs text-[#6b665f]">Up to 10MB per document</span>
            </div>

            {/* Selected file + upload button */}
            {file && (
              <div className="mt-4 flex items-center justify-between bg-[#0f0f0f]/60 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <span className="text-white font-medium truncate">{file.name}</span>
                  <span className="text-[#6b665f] text-xs shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-white text-[#0f0f0f] font-semibold px-5 py-1.5 rounded-lg text-sm transition-all duration-200 hover:bg-[#f0ece7] shrink-0 disabled:bg-[#2a2a2a] disabled:text-[#6b665f] shadow-sm"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-red-400/80 text-sm mt-3 bg-red-950/20 border border-red-900/20 px-3 py-1.5 rounded-lg">
                {uploadError}
              </p>
            )}
          </div>

          {/* Documents Section */}
          <div className="flex flex-col gap-4">
            
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4a574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                Your documents
                {!loading && (
                  <span className="text-[#6b665f] font-normal text-xs">({filteredDocuments.length})</span>
                )}
              </h2>

              {documents.length > 0 && (
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full bg-[#161616] border border-white/[0.06] hover:border-white/[0.1] focus:border-[#d4a574]/30 rounded-lg px-3.5 py-2 pl-9 text-sm text-white outline-none placeholder:text-[#6b665f] transition-colors duration-200"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#6b665f] absolute left-3 top-1/2 -translate-y-1/2"
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
                  <div key={i} className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 animate-pulse flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 bg-[#1c1c1c] rounded w-2/3 mb-2.5" />
                      <div className="h-2 bg-[#1c1c1c] rounded w-1/3" />
                    </div>
                    <div className="h-7 bg-[#1c1c1c] rounded w-16" />
                  </div>
                ))}
              </div>
            )}

            {/* Error display */}
            {error && <p className="text-red-400/80 text-sm text-center py-6 bg-red-950/10 border border-red-900/20 rounded-xl">{error}</p>}

            {/* Empty state */}
            {!loading && !error && documents.length === 0 && (
              <div className="text-center py-16 bg-[#161616]/50 border border-dashed border-white/[0.06] rounded-xl text-[#6b665f] text-sm">
                No documents yet. Upload your first PDF above.
              </div>
            )}

            {/* Filtered empty state */}
            {!loading && !error && documents.length > 0 && filteredDocuments.length === 0 && (
              <div className="text-center py-16 bg-[#161616]/50 border border-dashed border-white/[0.06] rounded-xl text-[#6b665f] text-sm">
                No documents match &ldquo;{searchQuery}&rdquo;
              </div>
            )}

            {/* Document list */}
            {!loading && !error && filteredDocuments.length > 0 && (
              <div className="flex flex-col gap-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[#161616] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between hover:border-white/[0.1] transition-all duration-200 group"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-medium text-white truncate group-hover:text-white transition">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-[#6b665f] mt-1">
                        Uploaded {formatDate(doc.uploaded_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Delete button */}
                      <button
                        onClick={() => deleteDocument(doc.id, doc.filename)}
                        disabled={deleting === doc.id}
                        className="text-[#4a453f] hover:text-red-400 disabled:opacity-30 transition-colors duration-200 p-2 rounded-lg hover:bg-white/[0.03]"
                        title="Delete document"
                      >
                        {deleting === doc.id ? (
                          <span className="text-xs animate-pulse">...</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>

                      {/* Chat button */}
                      <button
                        onClick={() => router.push(`/chat/${doc.id}`)}
                        className="bg-white/[0.06] hover:bg-white text-[#c4bfb8] hover:text-[#0f0f0f] border border-white/[0.06] hover:border-transparent text-sm font-semibold py-1.5 px-5 rounded-lg transition-all duration-200"
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

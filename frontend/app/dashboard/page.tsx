"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  MessageSquare,
  FolderOpen,
  Home,
  FileUp,
} from "lucide-react";

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

      const newDoc: Document = {
        id: response.data.document_id,
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setFile(null);

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

  const filteredDocuments = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 relative selection:bg-amber-500/20 selection:text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50 px-6 md:px-12 py-4 flex items-center justify-between shrink-0">
        <a href="/" className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-zinc-100" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-tight text-white">chat-with-pdf</span>
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-zinc-800/50 flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </a>
          <UserButton />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 relative">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Upload Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200">
            
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-zinc-400" />
              Upload PDF
            </h2>

            {/* Drop Zone */}
            <div className="border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-950/40 hover:bg-zinc-800/20 hover:border-zinc-700 transition-all duration-200 cursor-pointer relative">
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/50 text-zinc-400 rounded-xl flex items-center justify-center mb-3">
                <FileUp className="w-5 h-5" />
              </div>

              <span className="text-sm text-zinc-300 font-medium mb-1">Click to select a PDF or drag it here</span>
              <span className="text-xs text-zinc-600">Up to 10MB per document</span>
            </div>

            {/* Selected file + upload button */}
            {file && (
              <div className="mt-4 flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <span className="text-white font-medium truncate">{file.name}</span>
                  <span className="text-zinc-600 text-xs shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-zinc-100 text-zinc-900 font-medium px-5 py-1.5 rounded-lg text-sm transition-all duration-200 hover:bg-white shrink-0 disabled:bg-zinc-800 disabled:text-zinc-600"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/50">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-zinc-400" />
                Your documents
                {!loading && (
                  <span className="text-zinc-600 font-normal text-xs">({filteredDocuments.length})</span>
                )}
              </h2>

              {documents.length > 0 && (
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-600 rounded-lg px-3.5 py-2 pl-9 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors duration-200"
                  />
                  <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 bg-zinc-800 rounded w-2/3 mb-2.5" />
                      <div className="h-2 bg-zinc-800 rounded w-1/3" />
                    </div>
                    <div className="h-7 bg-zinc-800 rounded w-16" />
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-red-400/80 text-sm text-center py-6 bg-red-950/10 border border-red-900/20 rounded-xl">{error}</p>}

            {!loading && !error && documents.length === 0 && (
              <div className="text-center py-16 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-sm">
                No documents yet. Upload your first PDF above.
              </div>
            )}

            {!loading && !error && documents.length > 0 && filteredDocuments.length === 0 && (
              <div className="text-center py-16 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-sm">
                No documents match &ldquo;{searchQuery}&rdquo;
              </div>
            )}

            {!loading && !error && filteredDocuments.length > 0 && (
              <div className="flex flex-col gap-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between hover:border-zinc-700 transition-colors duration-200 group"
                  >
                    <div className="min-w-0 flex-1 pr-4 flex items-center gap-3">
                      <FileText className="w-4 h-4 text-zinc-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => deleteDocument(doc.id, doc.filename)}
                        disabled={deleting === doc.id}
                        className="text-zinc-700 hover:text-red-400 disabled:opacity-30 transition-colors duration-200 p-2 rounded-lg hover:bg-zinc-800/50"
                        title="Delete document"
                      >
                        {deleting === doc.id ? (
                          <span className="text-xs animate-pulse">...</span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

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
      </div>
    </main>
  );
}

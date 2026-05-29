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
  Loader2,
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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pollingDocId, setPollingDocId] = useState<number | null>(null);
  const [progressState, setProgressState] = useState<{ status: string; progress: number } | null>(null);

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

  // Polling for processing progress
  useEffect(() => {
    if (pollingDocId === null) return;

    let intervalId: NodeJS.Timeout;
    const pollStatus = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/status/${pollingDocId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        if (data.status === "completed" || data.progress === 100) {
          setPollingDocId(null);
          setUploading(false);
          setProgressState(null);
          
          // Re-fetch final documents list to include the newly ingested multi-file document
          const docsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setDocuments(docsResponse.data.documents);
        } else if (data.status === "failed") {
          setPollingDocId(null);
          setUploading(false);
          setUploadError(data.error || "Document processing failed. Please check file formatting.");
          setProgressState(null);
        } else {
          setProgressState({
            status: data.status,
            progress: data.progress,
          });
        }
      } catch (err) {
        console.error("Error polling document status:", err);
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, 1500);

    return () => clearInterval(intervalId);
  }, [pollingDocId, getToken]);

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
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const validFiles: File[] = [];
      let errMessage = "";

      if (selectedFiles.length > 5) {
        setUploadError("You can upload a maximum of 5 files at a time.");
        setFiles([]);
        return;
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.type !== "application/pdf") {
          errMessage = `"${file.name}" is not a PDF file.`;
          break;
        }
        if (file.size > MAX_FILE_SIZE) {
          errMessage = `"${file.name}" exceeds the 10MB size limit.`;
          break;
        }
        validFiles.push(file);
      }

      if (errMessage) {
        setUploadError(errMessage);
        setFiles([]);
      } else {
        setFiles(validFiles);
        setUploadError("");
      }
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    setProgressState({ status: "uploading", progress: 5 });

    try {
      const token = await getToken();
      const formData = new FormData();
      files.forEach((f) => {
        formData.append("files", f);
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const docId = response.data.document_id;
      setPollingDocId(docId);
      setProgressState({ status: "processing", progress: 15 });
      setFiles([]);

      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setUploadError("Upload failed. Make sure the backend service is running.");
      setUploading(false);
      setProgressState(null);
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
              Upload PDF Bundle
            </h2>

            {/* Drop Zone */}
            <div className="border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-950/40 hover:bg-zinc-800/20 hover:border-zinc-700 transition-all duration-200 cursor-pointer relative">
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              
              <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/50 text-zinc-400 rounded-xl flex items-center justify-center mb-3">
                <FileUp className="w-5 h-5" />
              </div>

              <span className="text-sm text-zinc-300 font-medium mb-1">Click to select PDFs or drag them here</span>
              <span className="text-xs text-zinc-600">Up to 5 files, under 10MB each</span>
            </div>

            {/* Selected files listing */}
            {files.length > 0 && !uploading && (
              <div className="mt-4 flex flex-col gap-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Selected Files ({files.length}/5)
                </div>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-amber-500">•</span>
                        <span className="truncate font-medium text-white">{file.name}</span>
                        <span className="text-zinc-600 shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-800/50">
                  <span className="text-xs text-zinc-500">
                    Total size: {((files.reduce((acc, f) => acc + f.size, 0)) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-6 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 shrink-0 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                  >
                    Upload and Process
                  </button>
                </div>
              </div>
            )}

            {/* Real-time Glowing Progress Card */}
            {progressState && (
              <div className="mt-6 border border-zinc-850 bg-zinc-950/60 rounded-xl p-5 relative overflow-hidden">
                {/* Glowing subtle top bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />
                
                <div className="flex items-center justify-between mb-3 text-xs md:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span className="text-zinc-300 font-medium capitalize flex items-center gap-1.5">
                      {progressState.status === "uploading" && "Uploading to secure gateway..."}
                      {progressState.status === "processing" && "Initializing pipeline..."}
                      {progressState.status === "extracting" && "Parsing layout and pages..."}
                      {progressState.status === "chunking" && "Creating semantic boundaries..."}
                      {progressState.status === "embedding" && "Vectorizing database chunks..."}
                      {!["processing", "extracting", "chunking", "embedding", "uploading"].includes(progressState.status) && progressState.status}
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
                    </span>
                  </div>
                  <span className="text-amber-400 font-semibold">{progressState.progress}%</span>
                </div>

                {/* Outer bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  {/* Glowing Inner bar */}
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    style={{ width: `${progressState.progress}%` }}
                  />
                </div>
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

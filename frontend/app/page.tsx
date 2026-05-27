"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 10MB in bytes. Defined as a constant so it's easy to change later
  // and stays consistent between the message shown and the check performed.
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      // Check MIME type — more reliable than file extension.
      // A user can rename "malware.exe" to "malware.pdf" to bypass extension checks,
      // but the MIME type is determined by the file's actual content headers.
      if (selected.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setFile(null);
        return;
      }

      // Check file size — prevents uploading files that would be too large
      // to process or would consume too many embedding API credits.
      if (selected.size > MAX_FILE_SIZE) {
        setError("File must be under 10MB.");
        setFile(null);
        return;
      }

      setFile(selected);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to documents list instead of directly to chat.
      // This lets the user see their new upload in context with all their other PDFs.
      router.push("/documents");

    } catch (err) {
      setError("Upload failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">

      <div className="absolute top-4 right-4">
        <UserButton />
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">

        <div className="mb-2">
          <h1 className="text-2xl font-bold">Chat with PDF</h1>
          <p className="text-gray-400 text-sm mt-1">
            Upload a PDF and ask questions about it
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Select PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
            />
          </div>

          {file && (
            <p className="text-green-400 text-sm">
              ✓ {file.name}
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition text-sm"
          >
            {loading ? "Processing PDF..." : "Upload & Start Chat"}
          </button>
        </div>

        <a
          href="/documents"
          className="bg-gray-900 rounded-xl p-4 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition text-center flex items-center justify-center gap-2"
        >
          📄 My Documents →
        </a>

      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      console.log("File selected:", selected.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    console.log("Uploading:", file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:3001/api/upload",
        formData
      );

      console.log("Response:", response.data);
      const { document_id } = response.data;
      router.push(`/chat/${document_id}`);

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed - check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-xl flex flex-col items-center gap-6 w-full max-w-md">
        <h1 className="text-3xl font-bold">Chat with your PDF</h1>
        <p className="text-gray-400 text-sm">Upload a PDF and ask anything</p>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full text-white text-sm"
        />

        {file && (
          <p className="text-green-400 text-sm">Selected: {file.name}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? "Processing..." : "Upload & Chat"}
        </button>
      </div>
    </main>
  );
}
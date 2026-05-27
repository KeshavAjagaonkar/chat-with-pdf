"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Features data
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      title: "Upload Any PDF",
      description: "Drop your PDF and our AI extracts, chunks, and indexes every page for instant retrieval.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "Chat Naturally",
      description: "Ask questions in plain language. Get instant, contextual answers with streaming responses.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Source Citations",
      description: "Every answer shows the exact passages used, so you can verify and trust the AI's response.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
            P
          </div>
          <span className="text-lg font-semibold">ChatPDF</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sign-in"
            className="text-sm text-gray-400 hover:text-white transition px-4 py-2"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero section */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-blue-500/20">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
          Powered by Gemini 2.5 Flash
        </div>

        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          Chat with any{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            PDF document
          </span>{" "}
          instantly
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-xl leading-relaxed">
          Upload your PDF and ask questions. Get accurate, cited answers in seconds — powered by AI that reads and understands your documents.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <a
            href="/sign-up"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
          >
            Start for free →
          </a>
          <a
            href="/sign-in"
            className="text-gray-400 hover:text-white font-medium px-6 py-3 transition text-sm"
          >
            I have an account
          </a>
        </div>
      </section>

      {/* Features section */}
      <section className="px-6 md:px-12 pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-gray-500 text-sm font-medium uppercase tracking-wider mb-10">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/80 transition group"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/20 transition">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 px-6 py-8 text-center">
        <p className="text-gray-600 text-xs">
          Built with Next.js, FastAPI, and Gemini AI
        </p>
      </footer>
    </main>
  );
}
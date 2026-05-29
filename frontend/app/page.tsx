"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const faqs = [
    {
      q: "How secure are my documents?",
      a: "Every PDF is bound to your personal account with end-to-end JWT authentication. No other user can access or even see your documents. Your data stays isolated in a multi-tenant PostgreSQL database.",
    },
    {
      q: "Does it work with scanned PDFs?",
      a: "Yes — as long as the PDF has selectable text (most modern scans do). For image-only scans without a text layer, we recommend running OCR first for best results.",
    },
    {
      q: "Is there a file size limit?",
      a: "Currently up to 10MB per PDF, which comfortably supports 250+ page documents. The AI model handles large context windows, so even dense documents get thorough analysis.",
    },
    {
      q: "How fast is the processing?",
      a: "Almost instant. Upload a PDF and it's ready to chat with in under 10 seconds. The system extracts text, generates embeddings, and indexes everything automatically.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e8e4df] flex flex-col relative overflow-x-hidden selection:bg-[#d4a574]/20 selection:text-white">

      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f0f0f]/80 border-b border-white/[0.06] px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a574] to-[#c4886a] flex items-center justify-center shadow-lg shadow-[#d4a574]/10 group-hover:shadow-[#d4a574]/20 transition-shadow duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0f0f0f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">DocQuery</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href="/sign-in"
            className="text-sm text-[#a09a93] hover:text-white transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/[0.04]"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="text-sm bg-white text-[#0f0f0f] font-semibold px-5 py-2 rounded-lg hover:bg-[#f0ece7] transition-all duration-200 shadow-sm"
          >
            Get started free
          </a>
        </div>
      </nav>

      {/* ─── Hero — Two Column ──────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 pt-16 pb-20 md:pt-24 md:pb-28 relative z-10">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#d4a574]/[0.03] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left — Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] text-[#a09a93] text-xs px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Powered by Gemini 2.5 Flash
            </div>

            <h1 className="text-[2.75rem] md:text-[3.5rem] leading-[1.08] font-bold tracking-tight text-white">
              Ask your PDFs anything.
              <span className="block text-[#a09a93] mt-1">Get cited answers.</span>
            </h1>

            <p className="text-[#8a847d] text-base md:text-lg mt-6 leading-relaxed max-w-md">
              Upload any document and ask questions in plain English. Every answer traces back to the exact page — so you can verify, not just trust.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-10">
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full sm:w-auto bg-white text-[#0f0f0f] font-semibold px-7 py-3 rounded-lg hover:bg-[#f0ece7] transition-all duration-200 text-sm shadow-sm"
              >
                Start for free
              </button>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-center border border-white/[0.08] text-[#c4bfb8] font-medium px-7 py-3 rounded-lg hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-200 text-sm"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right — Clean Chat Preview */}
          <div className="relative">
            <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/40 relative overflow-hidden">
              {/* Tiny file indicator */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
                <div className="w-6 h-6 rounded-md bg-[#d4a574]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-[#8a847d]">commercial_lease_agreement.pdf</span>
              </div>

              {/* Chat messages */}
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-white/[0.06] border border-white/[0.04] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-[#e8e4df]">What is the notice period for lease termination?</p>
                  </div>
                </div>

                {/* Assistant message */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 border border-[#d4a574]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#c4bfb8] leading-relaxed">
                      The landlord can terminate the lease upon a <strong className="text-white font-medium">30-day written notice</strong>, but only if the tenant fails to cure the default within <strong className="text-white font-medium">10 business days</strong> of receiving notice.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-[#d4a574]/8 border border-[#d4a574]/12 text-[#d4a574] text-[11px] font-medium px-2.5 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Page 14
                    </div>
                  </div>
                </div>

                {/* Second user question */}
                <div className="flex justify-end">
                  <div className="bg-white/[0.06] border border-white/[0.04] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-[#e8e4df]">Are any items non-refundable?</p>
                  </div>
                </div>

                {/* Second assistant response */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 border border-[#d4a574]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#c4bfb8] leading-relaxed">
                      Yes — custom-made products, personalized items, and clearance sales are strictly <strong className="text-white font-medium">non-refundable</strong>.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-[#d4a574]/8 border border-[#d4a574]/12 text-[#d4a574] text-[11px] font-medium px-2.5 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Pages 13–14
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blur behind the card */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#d4a574]/[0.04] rounded-full blur-[60px] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── Value Props — Three Cards ──────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 relative z-10 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Card 1 */}
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.06] group-hover:border-white/[0.08] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Upload any PDF</h3>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                Drag, drop, done. Contracts, textbooks, research papers, manuals — up to 10MB per document. Indexed in seconds.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.06] group-hover:border-white/[0.08] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Ask in plain English</h3>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                No commands, no syntax. Type your question naturally and get a clear, direct answer drawn from your document.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.06] group-hover:border-white/[0.08] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Cited to the page</h3>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                Every answer comes with exact page references. You see where the information came from — always verifiable, never a black box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works — Three Steps ─────────────────────────────── */}
      <section id="how-it-works" className="px-6 md:px-12 lg:px-20 py-16 md:py-24 relative z-10 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#d4a574] mb-3">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-12">
            Three steps. Under a minute.
          </h2>

          <div className="space-y-10">
            {/* Step 1 */}
            <div className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-sm font-semibold text-[#c4bfb8]">
                1
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">Upload your document</h3>
                <p className="text-sm text-[#8a847d] leading-relaxed">
                  Select a PDF from your device. We parse every page, extract the text, and generate vector embeddings automatically. You just wait a few seconds.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-sm font-semibold text-[#c4bfb8]">
                2
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">Ask a question</h3>
                <p className="text-sm text-[#8a847d] leading-relaxed">
                  Type anything you want to know in plain language. The system finds the most relevant sections across every page of your document.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-sm font-semibold text-[#c4bfb8]">
                3
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">Get a cited answer</h3>
                <p className="text-sm text-[#8a847d] leading-relaxed">
                  Receive a clear, concise answer with page-level citations. Click the page badge to verify. Follow up with more questions — the AI remembers the conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Use Cases — Clean Grid ─────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 relative z-10 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#d4a574] mb-3">Built for</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">
            Anyone who reads documents for work
          </h2>
          <p className="text-[#8a847d] text-sm md:text-base mb-12 max-w-xl">
            Whether you're studying for exams, reviewing contracts, or digging through spec sheets — stop skimming pages and start getting answers.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            
            {/* Use case 1 */}
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 md:p-6 hover:border-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4a574]/8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Students & Academics</h3>
              </div>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                Summarize textbook chapters, pull specific definitions, or prep for exams by querying your lecture notes and research papers directly.
              </p>
            </div>

            {/* Use case 2 */}
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 md:p-6 hover:border-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4a574]/8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Legal & Compliance</h3>
              </div>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                Find termination clauses, liability limits, or compliance requirements across contracts. Get the exact section and page number every time.
              </p>
            </div>

            {/* Use case 3 */}
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 md:p-6 hover:border-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4a574]/8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Researchers & Engineers</h3>
              </div>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                Query technical specs, datasheets, or academic journals. Locate hardware parameters, chemical formulas, or methodology details in seconds.
              </p>
            </div>

            {/* Use case 4 */}
            <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-5 md:p-6 hover:border-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4a574]/8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Business & Finance</h3>
              </div>
              <p className="text-sm text-[#8a847d] leading-relaxed">
                Audit financial reports, review vendor agreements, or scan policy documents. Ask targeted questions instead of reading everything front to back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 relative z-10 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#d4a574] mb-3">FAQ</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-10">
            Common questions
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/[0.06] rounded-xl overflow-hidden transition-colors duration-200 hover:border-white/[0.08]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-medium text-[#e8e4df] hover:text-white transition-colors duration-200 outline-none"
                  >
                    <span>{faq.q}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-[#6b665f] transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180 text-[#d4a574]" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <p className="px-5 pb-4 text-sm text-[#8a847d] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 relative z-10 border-t border-white/[0.04]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
            Stop reading. Start asking.
          </h2>
          <p className="text-[#8a847d] text-sm md:text-base mb-8 leading-relaxed">
            Upload your first PDF and get cited answers in under a minute. No credit card required.
          </p>
          <button
            onClick={() => router.push("/sign-up")}
            className="bg-white text-[#0f0f0f] font-semibold px-8 py-3 rounded-lg hover:bg-[#f0ece7] transition-all duration-200 text-sm shadow-sm"
          >
            Get started free
          </button>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] px-6 py-6 text-center relative z-10">
        <p className="text-[#4a453f] text-xs">
          Built with Next.js, Gemini, and PGVector
        </p>
      </footer>
    </main>
  );
}
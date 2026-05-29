"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  MessageSquare,
  ShieldCheck,
  Upload,
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Scale,
  FlaskConical,
  Briefcase,
  Sparkles,
  Zap,
} from "lucide-react";

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
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500/20 selection:text-white">

      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50 px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-zinc-100" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-tight text-white">chat-with-pdf</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href="/sign-in"
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-zinc-800/50"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="text-sm bg-zinc-100 text-zinc-900 font-medium px-5 py-2 rounded-lg hover:bg-white transition-all duration-200"
          >
            Get started free
          </a>
        </div>
      </nav>

      {/* ─── Hero — Two Column ──────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 pt-20 pb-24 md:pt-28 md:pb-32 relative z-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left — Copy */}
          <div className="max-w-xl">
            <div className="relative p-[1px] rounded-full overflow-hidden mb-6 inline-flex">
              {/* Rotating glowing border beam */}
              <div className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#09090b_0%,#09090b_50%,#ffffff_75%,#f59e0b_100%)]" />
              {/* Inner capsule content */}
              <div className="relative z-10 flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full text-zinc-400 text-xs select-none">
                <Zap className="w-3 h-3 text-amber-400" />
                Powered by Gemini 2.5 Flash
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] font-bold tracking-tight text-white">
              Ask your PDFs anything.
              <span className="block text-zinc-500 mt-2">Get cited answers.</span>
            </h1>

            <p className="text-zinc-400 text-base md:text-lg mt-6 leading-relaxed max-w-md">
              Upload any document and ask questions in plain English. Every answer traces back to the exact page — so you can verify, not just trust.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-10">
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full sm:w-auto bg-zinc-100 text-zinc-900 font-medium px-7 py-3 rounded-lg hover:bg-white transition-all duration-200 text-sm flex items-center justify-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-center border border-zinc-800 text-zinc-300 font-medium px-7 py-3 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 text-sm"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right — Clean Chat Preview */}
          <div className="relative">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/60 relative overflow-hidden">
              {/* File indicator */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">commercial_lease_agreement.pdf</span>
              </div>

              {/* Chat messages */}
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-zinc-800 border border-zinc-700/50 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-zinc-100">What is the notice period for lease termination?</p>
                  </div>
                </div>

                {/* Assistant message */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      The landlord can terminate the lease upon a <strong className="text-white font-medium">30-day written notice</strong>, but only if the tenant fails to cure the default within <strong className="text-white font-medium">10 business days</strong>.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium px-2.5 py-1 rounded-md">
                      <FileText className="w-3 h-3" />
                      Page 14
                    </div>
                  </div>
                </div>

                {/* Second user question */}
                <div className="flex justify-end">
                  <div className="bg-zinc-800 border border-zinc-700/50 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-zinc-100">Are any items non-refundable?</p>
                  </div>
                </div>

                {/* Second assistant */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Yes — custom-made products, personalized items, and clearance sales are strictly <strong className="text-white font-medium">non-refundable</strong>.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium px-2.5 py-1 rounded-md">
                      <FileText className="w-3 h-3" />
                      Pages 13–14
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Value Props — Three Cards ──────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 relative z-10 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:bg-zinc-800/80 transition-colors duration-200">
                <Upload className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Upload any PDF</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Drag, drop, done. Contracts, textbooks, research papers, manuals — up to 10MB per document. Indexed in seconds.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:bg-zinc-800/80 transition-colors duration-200">
                <MessageSquare className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Ask in plain English</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                No commands, no syntax. Type your question naturally and get a clear, direct answer drawn from your document.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:bg-zinc-800/80 transition-colors duration-200">
                <ShieldCheck className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Cited to the page</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Every answer comes with exact page references. Always verifiable, never a black box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 relative z-10 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-14">
            Three steps. Under a minute.
          </h2>

          <div className="space-y-10">
            <div className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-sm font-semibold text-zinc-400">
                1
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">Upload your document</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Select a PDF from your device. We parse every page, extract the text, and generate vector embeddings automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-sm font-semibold text-zinc-400">
                2
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">Ask a question</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Type anything in plain language. The system finds the most relevant sections across every page of your document.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-sm font-semibold text-zinc-400">
                3
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">Get a cited answer</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Receive a clear answer with page-level citations. Follow up with more questions — the AI remembers your conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Use Cases ──────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 relative z-10 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">Built for</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">
            Anyone who reads documents for work
          </h2>
          <p className="text-zinc-500 text-sm md:text-base mb-12 max-w-xl">
            Whether you're studying for exams, reviewing contracts, or digging through spec sheets — stop skimming and start asking.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Students & Academics</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Summarize textbook chapters, pull specific definitions, or prep for exams by querying your lecture notes and research papers.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Legal & Compliance</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Find termination clauses, liability limits, or compliance requirements. Get the exact section and page number every time.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Researchers & Engineers</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Query technical specs, datasheets, or academic journals. Locate hardware parameters or methodology details in seconds.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Business & Finance</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Audit financial reports, review vendor agreements, or scan policy documents. Ask targeted questions instead of reading everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 relative z-10 border-t border-zinc-800/50">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">FAQ</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-10">
            Common questions
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
                    isOpen ? "border-zinc-700 bg-zinc-900" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-medium text-zinc-200 hover:text-white transition-colors duration-200 outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-600 transition-transform duration-300 shrink-0 ml-4 ${
                        isOpen ? "rotate-180 text-zinc-400" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <p className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed">
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
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32 relative z-10 border-t border-zinc-800/50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
            Stop reading. Start asking.
          </h2>
          <p className="text-zinc-500 text-sm md:text-base mb-8 leading-relaxed">
            Upload your first PDF and get cited answers in under a minute. No credit card required.
          </p>
          <button
            onClick={() => router.push("/sign-up")}
            className="bg-zinc-100 text-zinc-900 font-medium px-8 py-3 rounded-lg hover:bg-white transition-all duration-200 text-sm inline-flex items-center gap-2"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/50 px-6 py-6 text-center relative z-10">
        <p className="text-zinc-600 text-xs">
          Built with Next.js, Gemini, and PGVector
        </p>
      </footer>
    </main>
  );
}
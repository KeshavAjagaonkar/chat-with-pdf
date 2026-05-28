"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Autoplay step animations in the Mock UI preview
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Use cases matching targeted personas (User-Centric & Human-touched)
  const useCases = [
    {
      category: "Students & Academics",
      badge: "Study Smart",
      title: "Synthesize complex research & textbooks",
      description: "Stop scrolling through hundreds of pages. Query lecture notes, dense textbooks, or journal articles and instantly generate clear study guides cited directly to the source page.",
      bulletPoints: ["Summarize lengthy thesis papers", "Generate test preps & flashcard outline", "Verify citations in seconds"],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      category: "Legal & Business",
      badge: "Reduce Auditing Time",
      title: "Extract clauses & analyze compliance",
      description: "Audit contracts, analyze service agreements, or review vendor compliance policies. Query key liabilities and let the AI direct you instantly to the precise paragraph in your contract.",
      bulletPoints: ["Pinpoint termination clauses", "Audit multi-page financial reports", "Cross-examine policy agreements"],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      category: "Researchers & Engineers",
      badge: "Speed Up Mining",
      title: "Query datasheets, manuals & guidelines",
      description: "Mine scientific journals, query technical component datasheets, or lookup system installation guidelines. Access precise facts and calculations without reading the full index.",
      bulletPoints: ["Locate specific hardware specs", "Scan international regulatory guides", "Verify chemical/structural formulas"],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    }
  ];

  // Interactive FAQs Accordion
  const faqs = [
    {
      q: "How secure are my uploaded documents?",
      a: "Highly secure. Every PDF is bound strictly to your unique Clerk user account inside a multi-tenant PostgreSQL database. We use end-to-end JWT token authentication ensuring that no other user can query or even see your document catalogs."
    },
    {
      q: "Can the AI handle scanned images or scanned PDFs?",
      a: "Yes. Our pipeline processes structured text. Scanned PDFs containing embedded selectable text overlays are parsed seamlessly. For purely image-based PDFs, we recommend running standard OCR before indexing for maximum retrieval accuracy."
    },
    {
      q: "Is there a page limit or document size ceiling?",
      a: "Currently, our sandbox allows PDF uploads up to 10MB in size. This comfortably supports documents spanning up to 250+ pages. The Gemini 2.5 Flash model handles enormous context windows, enabling rich, multi-page deep analysis."
    },
    {
      q: "How fast is the parsing and ingestion process?",
      a: "Extremely fast. As soon as you select a document, our backend splits the PDF, extracts structured page texts, generates highly dimensional vector embeddings using Google's embedding model, and indexes them in under 10 seconds."
    }
  ];

  // Mock UI Chat sequence steps (Clean study review cards)
  const mockChatSteps = [
    {
      user: "What is the return shipping policy?",
      assistant: "According to **Page 13**, return shipping fees are the **sole responsibility of the purchaser** unless the item arrived damaged or is proven defective.",
      pages: [13],
    },
    {
      user: "Are any items exempt from being returned?",
      assistant: "Yes. Per **Section 4.4 (Pages 13–14)**, exceptions include custom-made products, personalized items, and clearance sales, which are strictly **non-refundable**.",
      pages: [13, 14],
    },
    {
      user: "What documentation do I need to attach?",
      assistant: "As stated on **Page 12**, you must provide the **original purchase receipt** or proof of invoice, and all products must remain inside their **unopened packaging**.",
      pages: [12],
    },
  ];

  return (
    <main className="min-h-screen bg-[#121110] bg-grid-pattern text-neutral-300 flex flex-col relative selection:bg-orange-500/20 selection:text-orange-300 overflow-x-hidden">
      
      {/* Decorative Cozy Warm Ambient Glows (Orange/Amber) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-orange-500/5 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[350px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Frosted Glass Sticky Navigation (Charcoal background) */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#121110]/75 border-b border-[#262322] px-6 md:px-12 py-4 flex items-center justify-between shrink-0 transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-sm shadow-md shadow-orange-500/20">
            P
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-100 uppercase">ChatPDF</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sign-in"
            className="text-xs text-neutral-400 hover:text-neutral-100 transition duration-300 px-4 py-2"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="text-xs bg-[#ededed] hover:bg-white text-neutral-950 font-bold px-5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-black/10 transform hover:scale-[1.01]"
          >
            Start free
          </a>
        </div>
      </nav>

      {/* Benefit Hero Section */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12 md:pt-24 md:pb-16 max-w-4xl mx-auto shrink-0 relative z-10">
        
        {/* Vector architecture status pill */}
        <div className="inline-flex items-center gap-2 bg-orange-950/40 text-orange-400 text-[10px] uppercase tracking-widest font-bold px-3.5 py-1.5 rounded-full mb-6 border border-orange-900/30">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
          Vector Retrieval Ingestion Pipeline Active
        </div>

        <h1 className="text-4xl md:text-6xl font-black max-w-3xl leading-tight tracking-tight text-neutral-100">
          Reading documents never feels{" "}
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent relative">
            lonely here
          </span>
        </h1>

        <p className="text-neutral-400 text-sm md:text-base mt-6 max-w-2xl leading-relaxed">
          Upload manuals, textbooks, papers, or business reports. Ask questions in plain language and receive precise, verified answers cited down to the exact page number.
        </p>

        {/* User-Centric Capsule Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          
          <button
            onClick={() => router.push("/sign-up")}
            className="w-full sm:w-auto bg-[#ededed] hover:bg-white text-neutral-950 font-bold px-8 py-3.5 rounded-full transition-all duration-300 text-xs uppercase tracking-wider shadow-lg shadow-black/20 transform hover:scale-[1.02]"
          >
            Upload a PDF Now
          </button>
          
          <a
            href="/sign-in"
            className="w-full sm:w-auto border border-[#262322] bg-[#1a1817]/40 hover:bg-[#1a1817] text-neutral-300 font-bold px-6 py-3.5 rounded-full transition duration-300 text-xs uppercase tracking-wider"
          >
            View Dashboard
          </a>
        </div>
      </section>

      {/* Sandbox Live Chat Preview Layout */}
      <section className="px-6 md:px-12 pb-20 max-w-5xl mx-auto w-full shrink-0 relative z-10">
        <div className="bg-[#1a1817]/80 border border-[#262322] rounded-2xl p-2 md:p-3 shadow-[0_0_80px_rgba(249,115,22,0.015)] relative group hover:border-[#262322]/80 transition duration-500">
          
          {/* Top sandbox bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#262322]/80 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
              <span className="text-[10px] text-neutral-600 font-mono ml-4 truncate">sandboxed-vector-agent v1.2</span>
            </div>
            
            {/* Streak indicator on sandbox */}
            <div className="flex items-center gap-1 bg-orange-950/40 text-orange-400 border border-orange-900/30 px-2 py-0.5 rounded-full text-[9px] font-bold">
              <span className="w-1 h-1 bg-orange-400 rounded-full animate-ping"></span>
              127 days streak
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-3 h-[420px] rounded-xl overflow-hidden text-xs">
            
            {/* PDF side view mockup */}
            <div className="hidden md:flex md:col-span-2 bg-[#121110] border border-[#262322]/60 rounded-lg p-4 flex-col gap-4 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-[#262322]/60 pb-2">
                <span className="font-semibold text-neutral-400 tracking-wide uppercase text-[10px]">vendor_agreement_doc.pdf</span>
                <span className="text-[10px] text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">Page {mockChatSteps[activeStep].pages[0]} of 24</span>
              </div>
              <div className="flex-1 flex flex-col gap-3 opacity-60">
                <div className="h-4 bg-neutral-900 rounded w-full"></div>
                <div className="h-4 bg-neutral-900 rounded w-11/12"></div>
                <div className="h-4 bg-neutral-900 rounded w-10/12"></div>
                <div className="h-4 bg-neutral-900 rounded w-full"></div>
                <div className="h-4 bg-neutral-900 rounded w-3/4 bg-orange-950/20 border-l-2 border-orange-500/30 pl-2">
                  <div className="h-2 bg-orange-500/20 rounded w-11/12 mt-1"></div>
                </div>
                <div className="h-4 bg-neutral-900 rounded w-full"></div>
                <div className="h-4 bg-neutral-900 rounded w-8/12"></div>
              </div>
            </div>

            {/* AI Chat panel mockup */}
            <div className="col-span-5 md:col-span-3 bg-[#131211]/85 border border-[#262322]/60 rounded-lg flex flex-col overflow-hidden">
              
              {/* Sandbox chat Header */}
              <div className="px-4 py-2 border-b border-[#262322]/60 flex items-center justify-between shrink-0 bg-[#1a1817]/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                  <span className="text-neutral-300 font-medium">Assistant Streaming Context</span>
                </div>
                
                {/* Step indicators */}
                <div className="flex gap-1.5">
                  {mockChatSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`w-4 h-1.5 rounded-full transition duration-300 ${
                        idx === activeStep ? "bg-orange-500" : "bg-neutral-800"
                      }`}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Chat display sandbox body */}
              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-sans">
                {/* User bubble */}
                <div className="flex justify-end shrink-0">
                  <div className="bg-[#1a1817] text-neutral-100 rounded-2xl rounded-br-md px-3.5 py-2 max-w-[80%] leading-relaxed border border-[#262322]">
                    {mockChatSteps[activeStep].user}
                  </div>
                </div>

                {/* Assistant response */}
                <div className="flex gap-2.5 max-w-[90%] shrink-0">
                  <div className="w-5 h-5 rounded-full bg-orange-950 border border-orange-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-neutral-300 leading-relaxed font-sans">
                      {mockChatSteps[activeStep].assistant.split("**").map((text, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-neutral-100 font-semibold">{text}</strong> : text
                      )}
                    </p>
                    
                    {/* Collapsible reference badge */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] bg-orange-950/60 text-orange-400 px-2 py-0.5 rounded border border-orange-900/30 font-medium">
                        {mockChatSteps[activeStep].pages.length === 1 
                          ? `Page ${mockChatSteps[activeStep].pages[0]}` 
                          : `Pages ${mockChatSteps[activeStep].pages[0]}–${mockChatSteps[activeStep].pages[mockChatSteps[activeStep].pages.length - 1]}`
                        }
                      </span>
                      <span className="text-[9px] text-neutral-600">Source verified from vector storage</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input section mock */}
              <div className="p-3 border-t border-[#262322]/60 flex gap-2 shrink-0 bg-[#121110]/30">
                <div className="flex-1 bg-[#1a1817] rounded-lg px-3 py-2 text-neutral-600 flex items-center border border-[#262322]">
                  Ask a follow-up query...
                </div>
                <div className="bg-orange-500 text-neutral-950 w-8 h-8 rounded-lg flex items-center justify-center shadow shadow-orange-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Targeted Audience Use Cases */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-6xl mx-auto relative z-10 border-t border-[#262322] w-full shrink-0">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Tailored Use Cases</h2>
          <p className="text-2xl md:text-3xl font-black tracking-tight text-neutral-100 leading-tight">
            Designed for how you actually work
          </p>
          <p className="text-neutral-500 text-xs mt-3 leading-relaxed">
            Whether you are querying legal agreements, structural equations, or studying for finals, get accurate page-cites instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {useCases.map((uc, i) => (
            <div
              key={i}
              className="bg-[#1a1817]/40 border border-[#262322] rounded-2xl p-6 hover:border-orange-500/20 hover:bg-[#1a1817]/85 transition-all duration-300 flex flex-col justify-between group transform hover:scale-[1.005]"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262322]/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 bg-orange-950/40 border border-orange-900/20 text-orange-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                      {uc.icon}
                    </div>
                    <span className="text-xs font-bold text-neutral-200 uppercase tracking-tight">{uc.category}</span>
                  </div>
                  <span className="text-[9px] bg-orange-950/40 text-orange-400 px-2 py-0.5 rounded-full border border-orange-900/20 font-bold uppercase tracking-wider">
                    {uc.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-100 mb-2 leading-tight group-hover:text-neutral-100 transition">{uc.title}</h3>
                <p className="text-neutral-500 text-[11px] leading-relaxed mb-6">{uc.description}</p>
              </div>

              {/* Bullet details inside use-cases */}
              <div className="bg-[#121110]/40 border border-[#262322]/60 rounded-xl p-3.5 mt-auto">
                <ul className="space-y-2">
                  {uc.bulletPoints.map((bp, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0"></span>
                      {bp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step Interactive Workflow */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-4xl mx-auto relative z-10 border-t border-[#262322] w-full shrink-0">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Vector Ingestion</h2>
          <p className="text-2xl md:text-3xl font-black tracking-tight text-neutral-100 leading-tight">
            How our pipeline compound works
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3">
            <span className="text-[10px] bg-[#121110] text-neutral-500 font-mono w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold border border-[#262322]">01</span>
            <h3 className="text-xs font-bold text-neutral-200 tracking-tight uppercase">Segmented Parsing</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              We process your PDF on load, parsing exact page boundaries separately to prevent metadata loss during downstream chunking.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3">
            <span className="text-[10px] bg-[#121110] text-neutral-500 font-mono w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold border border-[#262322]">02</span>
            <h3 className="text-xs font-bold text-neutral-200 tracking-tight uppercase">Multi-page Vectorization</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Words are vectorized into multi-dimensional embeddings, keeping structural metadata in Postgres JSONB stores.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3">
            <span className="text-[10px] bg-[#121110] text-neutral-500 font-mono w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold border border-[#262322]">03</span>
            <h3 className="text-xs font-bold text-neutral-200 tracking-tight uppercase">Traceable Generation</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Gemini fetches overlapping vector chunks and returns clear bullet points carrying citation page badges for you to verify.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Accordion FAQs Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-3xl mx-auto relative z-10 border-t border-[#262322] w-full shrink-0">
        
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Common Questions</h2>
          <p className="text-2xl md:text-3xl font-black tracking-tight text-neutral-100 leading-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#1a1817]/60 border border-[#262322] rounded-xl overflow-hidden transition-all duration-300"
              >
                {/* FAQ Question button */}
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-xs font-bold text-neutral-200 tracking-tight uppercase hover:text-neutral-100 transition select-none outline-none focus:text-orange-400"
                >
                  <span>{faq.q}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4.5 w-4.5 text-neutral-600 transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-400" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* FAQ Answer with height transition */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 border-t border-[#262322]/60 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <p className="px-5 py-4 text-xs text-neutral-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Capsule Signup Prompt Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 text-center relative z-10 border-t border-[#262322] max-w-4xl mx-auto w-full shrink-0">
        <h2 className="text-3xl font-black text-neutral-100 tracking-tight leading-tight">
          Ready to save hours of reading?
        </h2>
        <p className="text-neutral-500 text-xs mt-3 max-w-md mx-auto leading-relaxed">
          Unlock, analyze, and query your research papers, financial reports, or structural specs immediately.
        </p>
        <div className="mt-8">
          <button
            onClick={() => router.push("/sign-up")}
            className="bg-[#ededed] hover:bg-white text-neutral-950 font-bold px-8 py-3.5 rounded-full transition-all duration-300 text-xs uppercase tracking-wider shadow-lg shadow-black/25 transform hover:scale-[1.02]"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#262322] px-6 py-8 text-center shrink-0 bg-[#121110]/60 relative z-10">
        <p className="text-neutral-600 text-[10px] tracking-wider uppercase font-bold">
          Powered by Gemini Pro, Vector Ingest, and Next.js Framework
        </p>
      </footer>
    </main>
  );
}
"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

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

  // Features data
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      title: "Upload & Parse Instantly",
      description: "Drop your PDF. Our high-fidelity extraction engine reads, formats, and indexes every page with boundary awareness.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "Natural Language Chat",
      description: "Ask questions in simple terms. Get instant, contextual responses delivered with high-speed streaming typing effect.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Pinpoint Page Citations",
      description: "No more hallucination. Every answer attaches context-aware page cards so you can trace source passages instantly.",
    },
  ];

  // Mock UI Chat sequence steps
  const mockChatSteps = [
    {
      user: "What is the return policy outlined in section 4?",
      assistant: "According to **Section 4 (Page 12)**, items can be returned within **30 days** of delivery. You must provide the original receipt, and the items must remain in their **unopened original packaging**.",
      pages: [12],
    },
    {
      user: "Are return shipping fees covered by the company?",
      assistant: "No. **Page 13** explicitly notes that return shipping costs are the **sole responsibility of the purchaser** unless the item arrived damaged or defective.",
      pages: [13],
    },
    {
      user: "What exceptions apply to these return rules?",
      assistant: "Per **Section 4.4 (Pages 13–14)**, exceptions include: custom-made products, personalized goods, and final clearance items which are strictly **non-refundable**.",
      pages: [13, 14],
    },
  ];

  return (
    <main className="min-h-screen bg-[#030303] text-neutral-300 flex flex-col relative selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#030303]/75 border-b border-neutral-900/60 px-6 md:px-12 py-4 flex items-center justify-between shrink-0 transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-sm shadow-md shadow-emerald-500/20">
            P
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-100 uppercase">ChatPDF</span>
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
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold px-4.5 py-2 rounded-lg transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transform hover:scale-[1.01]"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12 md:pt-24 md:pb-16 max-w-4xl mx-auto shrink-0 relative">
        <div className="inline-flex items-center gap-2 bg-emerald-950/40 text-emerald-400 text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full mb-6 border border-emerald-900/30">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          Ingestion & Vector Architecture Active
        </div>

        <h1 className="text-4xl md:text-6xl font-black max-w-3xl leading-tight tracking-tight text-neutral-100">
          Chat with any{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            PDF document
          </span>{" "}
          instantly
        </h1>

        <p className="text-neutral-400 text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
          Upload complex papers, long textbooks, or multi-page invoices. Ask questions and receive structured, highly accurate answers cited down to the exact page number.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <a
            href="/sign-up"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-8 py-3 rounded-xl transition-all duration-300 text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 transform hover:scale-[1.02]"
          >
            Get started for free
          </a>
          <a
            href="/sign-in"
            className="w-full sm:w-auto border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/40 font-medium px-6 py-3 rounded-xl transition duration-300 text-xs uppercase tracking-wider"
          >
            View Dashboard
          </a>
        </div>
      </section>

      {/* Interactive Mock UI Preview */}
      <section className="px-6 md:px-12 pb-16 max-w-5xl mx-auto w-full shrink-0">
        <div className="bg-neutral-950/50 border border-neutral-900 rounded-2xl p-2 md:p-3 shadow-[0_0_80px_rgba(16,185,129,0.02)] relative group hover:border-neutral-800/60 transition duration-500">
          {/* Top window buttons bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-900/60 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
            <span className="text-[10px] text-neutral-600 font-mono ml-4 truncate">chatpdf-sandbox-agent v1.2</span>
          </div>

          <div className="grid md:grid-cols-5 gap-3 h-[420px] rounded-xl overflow-hidden text-xs">
            {/* PDF side view mock */}
            <div className="hidden md:flex md:col-span-2 bg-[#090909] border border-neutral-900/60 rounded-lg p-4 flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-900/40 pb-2">
                <span className="font-semibold text-neutral-400 tracking-wide uppercase text-[10px]">document_preview.pdf</span>
                <span className="text-[10px] text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">Page {mockChatSteps[activeStep].pages[0]} of 24</span>
              </div>
              <div className="flex-1 flex flex-col gap-3 opacity-60">
                <div className="h-4 bg-neutral-900 rounded w-full"></div>
                <div className="h-4 bg-neutral-900 rounded w-11/12"></div>
                <div className="h-4 bg-neutral-900 rounded w-10/12"></div>
                <div className="h-4 bg-neutral-900 rounded w-full"></div>
                <div className="h-4 bg-neutral-900 rounded w-3/4 bg-emerald-950/20 border-l-2 border-emerald-500/30 pl-2">
                  <div className="h-2 bg-emerald-500/20 rounded w-11/12 mt-1"></div>
                </div>
                <div className="h-4 bg-neutral-900 rounded w-full"></div>
                <div className="h-4 bg-neutral-900 rounded w-8/12"></div>
              </div>
            </div>

            {/* AI Chat side view mock */}
            <div className="col-span-5 md:col-span-3 bg-[#070707] border border-neutral-900/60 rounded-lg flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="px-4 py-2 border-b border-neutral-900/60 flex items-center justify-between shrink-0 bg-neutral-950/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-neutral-300 font-medium">Assistant Streaming</span>
                </div>
                <div className="flex gap-1.5">
                  {mockChatSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`w-4 h-1.5 rounded-full transition duration-300 ${
                        idx === activeStep ? "bg-emerald-500" : "bg-neutral-800"
                      }`}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-sans">
                {/* User message */}
                <div className="flex justify-end shrink-0">
                  <div className="bg-neutral-900 text-neutral-100 rounded-2xl rounded-br-md px-3.5 py-2 max-w-[80%] leading-relaxed border border-neutral-800/40">
                    {mockChatSteps[activeStep].user}
                  </div>
                </div>

                {/* Assistant message */}
                <div className="flex gap-2.5 max-w-[90%] shrink-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-neutral-300 leading-relaxed font-sans">
                      {mockChatSteps[activeStep].assistant.split("**").map((text, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-neutral-100 font-semibold">{text}</strong> : text
                      )}
                    </p>
                    
                    {/* Source citation animation */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/30 font-medium transition duration-300">
                        {mockChatSteps[activeStep].pages.length === 1 
                          ? `Page ${mockChatSteps[activeStep].pages[0]}` 
                          : `Pages ${mockChatSteps[activeStep].pages[0]}–${mockChatSteps[activeStep].pages[mockChatSteps[activeStep].pages.length - 1]}`
                        }
                      </span>
                      <span className="text-[9px] text-neutral-600">Source verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input mock */}
              <div className="p-3 border-t border-neutral-900/60 flex gap-2 shrink-0 bg-neutral-950/30">
                <div className="flex-1 bg-neutral-900 rounded-lg px-3 py-2 text-neutral-600 flex items-center border border-neutral-800/40">
                  Ask another follow-up question...
                </div>
                <div className="bg-emerald-500 text-neutral-950 w-8 h-8 rounded-lg flex items-center justify-center shadow shadow-emerald-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 pb-16 md:pb-24 max-w-4xl mx-auto shrink-0 relative">
        <h2 className="text-center text-neutral-600 text-xs font-semibold uppercase tracking-wider mb-10">
          Core Platform Capabilities
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-neutral-950/40 border border-neutral-900/60 rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-neutral-950/60 transition-all duration-300 transform hover:scale-[1.01] group relative"
            >
              <div className="w-9 h-9 bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-950/80 transition-all duration-300 border border-emerald-900/20 group-hover:border-emerald-800/40">
                {feature.icon}
              </div>
              <h3 className="text-neutral-100 font-semibold mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900/60 px-6 py-8 text-center shrink-0 mt-auto bg-neutral-950/10">
        <p className="text-neutral-600 text-[10px] tracking-wider uppercase font-medium">
          Powered by Gemini Pro, Vector Ingest, and Next.js Framework
        </p>
      </footer>
    </main>
  );
}
"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [activeUseCase, setActiveUseCase] = useState(0);
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
        <code className="text-[10px] font-mono font-bold text-[#d18a59] bg-[#121110] px-1.5 py-0.5 rounded border border-[#262322]">
          [SYS.ACAD]
        </code>
      ),
      preview: {
        documentName: "biology_textbook_ch4.pdf",
        page: "Page 48",
        extractedText: "...the primary photochemical event in photosystem II is the light-induced transfer of an electron from the reaction center chlorophyll P680 to pheophytin...",
        userQuery: "How does photosystem II initiate electron transfer?",
        assistantResponse: "Electron transfer in photosystem II is initiated by the **light-induced transfer of an electron** from the reaction center chlorophyll **P680** to pheophytin."
      }
    },
    {
      category: "Legal & Business",
      badge: "Reduce Auditing Time",
      title: "Extract clauses & analyze compliance",
      description: "Audit contracts, analyze service agreements, or review vendor compliance policies. Query key liabilities and let the AI direct you instantly to the precise paragraph in your contract.",
      bulletPoints: ["Pinpoint termination clauses", "Audit multi-page financial reports", "Cross-examine policy agreements"],
      icon: (
        <code className="text-[10px] font-mono font-bold text-[#d18a59] bg-[#121110] px-1.5 py-0.5 rounded border border-[#262322]">
          [SYS.CORP]
        </code>
      ),
      preview: {
        documentName: "commercial_lease_agreement.pdf",
        page: "Page 14",
        extractedText: "...Landlord may terminate this lease upon 30 days prior written notice should Tenant fail to cure a rental default within 10 business days of initial notification...",
        userQuery: "What is the notice period for lease termination due to rent default?",
        assistantResponse: "The landlord can terminate the lease upon a **30-day written notice**, but only if you fail to cure the default within **10 business days** of receiving notice."
      }
    },
    {
      category: "Researchers & Engineers",
      badge: "Speed Up Mining",
      title: "Query datasheets, manuals & guidelines",
      description: "Mine scientific journals, query technical component datasheets, or lookup system installation guidelines. Access precise facts and calculations without reading the full index.",
      bulletPoints: ["Locate specific hardware specs", "Scan international regulatory guides", "Verify chemical/structural formulas"],
      icon: (
        <code className="text-[10px] font-mono font-bold text-[#d18a59] bg-[#121110] px-1.5 py-0.5 rounded border border-[#262322]">
          [SYS.DATA]
        </code>
      ),
      preview: {
        documentName: "motor_controller_datasheet.pdf",
        page: "Page 6",
        extractedText: "...operational input voltage ranges from 12V to 48V DC with peak efficiency of 98.4% achieved at continuous 36V draw under 40°C thermal threshold...",
        userQuery: "What is the peak operating efficiency and voltage?",
        assistantResponse: "The controller reaches its peak efficiency of **98.4%** at a continuous draw of **36V DC** under a thermal limit of **40°C**."
      }
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
    <main className="min-h-screen bg-[#121110] bg-grid-pattern text-neutral-300 flex flex-col relative selection:bg-[#d18a59]/20 selection:text-neutral-100 overflow-x-hidden">
      
      {/* Decorative Cozy Warm Ambient Glows (Muted Raw Copper/Amber) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#d18a59]/3 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#d18a59]/3 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[350px] bg-[#d18a59]/2 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Frosted Glass Sticky Navigation (Charcoal background) */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#121110]/75 border-b border-[#262322] px-6 md:px-12 py-4 flex items-center justify-between shrink-0 transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1a1817] border border-[#2a2624] rounded flex items-center justify-center text-[#d18a59] font-mono font-bold text-xs shadow-sm">
            $
          </div>
          <span className="text-sm font-mono tracking-tight text-neutral-100 uppercase">doc-query</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sign-in"
            className="text-xs text-neutral-400 hover:text-neutral-100 transition duration-300 px-4 py-2 font-medium"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="text-xs bg-[#f4ebe1] hover:bg-[#faf5ef] text-[#121110] border border-[#d2c3b4] font-bold px-4 py-2 rounded-full transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            Start free
          </a>
        </div>
      </nav>

      {/* Benefit Hero Section */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12 md:pt-24 md:pb-16 max-w-4xl mx-auto shrink-0 relative z-10">
        
        {/* Technical Architecture Status Monospace Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1a1817] border border-[#2a2624] text-neutral-400 font-mono text-[10px] px-3.5 py-1.5 rounded-md mb-6 uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 bg-[#d18a59] rounded-full"></span>
          Ingestion Node: Active (PostgreSQL Vector + Gemini 2.5 Flash)
        </div>

        <h1 className="text-4xl md:text-6xl font-black max-w-4xl leading-tight tracking-tight text-neutral-100">
          Grounded PDF Q&A with{" "}
          <span className="text-[#d18a59] font-mono block sm:inline">
            [page-level.attribution]
          </span>
        </h1>

        <p className="text-neutral-400 text-sm md:text-base mt-6 max-w-2xl leading-relaxed">
          An ingestion pipeline built for mathematical precision. Index manuals, spec sheets, compliance documents, or textbook catalogs to compile multi-page vector segments—then query in plain language with exact source-level grounding.
        </p>

        {/* User-Centric Capsule Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <button
            onClick={() => router.push("/sign-up")}
            className="w-full sm:w-auto bg-[#f4ebe1] hover:bg-[#faf5ef] text-[#121110] border border-[#d2c3b4] font-bold px-8 py-3.5 rounded-full transition-all duration-300 text-xs uppercase tracking-wider shadow-md shadow-black/10 transform hover:scale-[1.01]"
          >
            Upload a PDF Now
          </button>
          
          <a
            href="/sign-in"
            className="w-full sm:w-auto border border-[#2a2624] bg-[#1a1817]/40 hover:bg-[#1a1817] text-neutral-300 font-mono font-bold px-6 py-3.5 rounded-full transition duration-300 text-xs uppercase tracking-wider"
          >
            View Dashboard
          </a>
        </div>
      </section>

      {/* Sandbox Live Chat Preview Layout — Re-engineered as a Systems Inspection Console */}
      <section className="px-6 md:px-12 pb-20 max-w-5xl mx-auto w-full shrink-0 relative z-10">
        <div className="bg-[#1a1817] border border-[#262322] rounded-2xl p-2 md:p-3 shadow-[0_0_80px_rgba(209,138,89,0.02)] relative group hover:border-[#2a2624] transition duration-500">
          
          {/* Top sandbox bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#262322] mb-2 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#262322]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#262322]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#262322]"></div>
              <span className="text-[10px] text-neutral-600 ml-4">RAG_CLIENT_INSPECT_CONSOLE v2.4</span>
            </div>
            
            <div className="flex items-center gap-2 bg-[#121110] border border-[#262322] px-2.5 py-0.5 rounded text-[9px] font-mono text-neutral-500">
              <span className="w-1.5 h-1.5 bg-[#d18a59] rounded-full"></span>
              CLUSTER STATS: NORMAL
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-3 h-[420px] rounded-xl overflow-hidden text-xs font-mono bg-[#121110]">
            
            {/* Left Column (35%): SYSTEM REGISTRY TREE INDEX */}
            <div className="hidden md:flex md:col-span-4 bg-[#121110] border-r border-[#262322] p-4 flex-col gap-4 overflow-hidden relative select-none">
              <div className="border-b border-[#262322] pb-2 text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                DOCUMENT REGISTRY
              </div>
              <div className="flex-1 flex flex-col gap-3 font-mono text-[11px] text-neutral-400">
                <div>
                  <span className="text-neutral-600">/workspace</span>
                  <div className="pl-4 mt-2 space-y-1.5">
                    <div className="flex items-center justify-between hover:text-neutral-200 transition">
                      <span>📄 commercial_lease.pdf</span>
                      <span className="text-[9px] text-[#d18a59] bg-[#1a1817] px-1 rounded border border-[#262322]">18p</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>📄 system_spec_v4.pdf</span>
                      <span className="text-[9px] bg-neutral-900 px-1 rounded">124p</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>📄 biology_textbook.pdf</span>
                      <span className="text-[9px] bg-neutral-900 px-1 rounded">68p</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-[#262322] pt-3 text-[10px] text-neutral-500 space-y-1">
                  <div>VECTOR ENGINE: PGVECTOR</div>
                  <div>INDEX CAPACITY: 8.4 GB</div>
                  <div>LATEST EMBEDDING: COMPLETE</div>
                </div>
              </div>
            </div>

            {/* Right Column (65%): SIMULATED REAL-WORLD QUERY EXECUTION */}
            <div className="col-span-12 md:col-span-8 bg-[#121110] p-4 flex flex-col justify-between overflow-hidden">
              <div className="border-b border-[#262322] pb-2 text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-3">
                VECTOR QUERY EXECUTION LOG
              </div>

              {/* Execution Console outputs */}
              <div className="flex-1 overflow-y-auto space-y-4 text-[11px] md:text-xs">
                
                {/* Console command input */}
                <div>
                  <div className="text-neutral-500 text-[10px] mb-1">2026-05-29T00:48:37Z - [SYS.QUERY]</div>
                  <div className="bg-[#1a1817] border border-[#262322] px-3.5 py-2.5 rounded-lg text-neutral-200 flex items-center justify-between">
                    <span>$ doc-search --file-id commercial_lease.pdf --query &quot;What is the notice period for rent default?&quot;</span>
                  </div>
                </div>

                {/* Similarity search execute steps */}
                <div className="space-y-1.5 text-neutral-500 font-mono text-[10px] pl-1">
                  <div>[SYS.LOAD] Loading embeddings for document_id: 81... done</div>
                  <div>[SYS.VEC] Generating 1536-dimensional query embedding vector... done</div>
                  <div className="text-[#d18a59]">[SYS.MATH] Executing cosine similarity matrix scan... found 1 segment over similarity_threshold (0.842)</div>
                </div>

                {/* Highlighted exact source segment match */}
                <div className="bg-[#181615] border border-[#2a2624] rounded-xl p-3.5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-1.5 border-b border-[#262322] pb-1.5">
                    <span>📄 segment extract match #24</span>
                    <span className="text-[#d18a59] bg-[#d18a59]/10 border border-[#d18a59]/20 px-1.5 py-0.5 rounded font-mono">Page 14</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed italic font-mono bg-[#121110]/50 p-2 rounded-lg border border-[#262322]/40">
                    &quot;...Landlord may terminate this lease upon 30 days prior written notice should Tenant fail to cure a rental default within 10 business days of initial notification...&quot;
                  </p>
                </div>

                {/* Strictly grounded attributed response output */}
                <div>
                  <div className="text-[#d18a59] text-[10px] mb-1">[SYS.RESPONSE] Strictly grounded in Page 14</div>
                  <div className="bg-[#1a1817] border border-[#262322] p-3 rounded-lg text-neutral-200 leading-relaxed font-sans text-xs">
                    The landlord can terminate the lease upon a **30-day written notice**, but only if you fail to cure the default within **10 business days** of receiving notice.
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Targeted Audience Use Cases — Immersive Handcrafted Showcase Layout */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-6xl mx-auto relative z-10 border-t border-[#262322] w-full shrink-0">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-[#d18a59] uppercase tracking-widest mb-3">Tailored Use Cases</h2>
          <p className="text-2xl md:text-4xl font-black tracking-tight text-neutral-100 leading-tight">
            Designed for how you actually work
          </p>
          <p className="text-neutral-400 text-sm md:text-base mt-4 leading-relaxed max-w-xl mx-auto">
            Stop scanning lines page-by-page. Select your workflow below to see how our pipeline traces answers to the source.
          </p>
        </div>

        {/* Dynamic Multi-Layout Showcase Panel */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Handwritten selectors */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-none shrink-0">
            {useCases.map((uc, i) => {
              const isActive = activeUseCase === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveUseCase(i)}
                  className={`w-64 lg:w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 focus:outline-none shrink-0 select-none ${
                    isActive 
                      ? "bg-[#1a1817] border-[#262322] shadow-[0_4px_20px_rgba(0,0,0,0.4)] translate-x-1" 
                      : "bg-transparent border-transparent hover:bg-[#1a1817]/40 hover:border-[#262322]/40"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {uc.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isActive ? "text-[#d18a59]" : "text-neutral-500"}`}>
                        {uc.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-neutral-200 line-clamp-1">{uc.title}</h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Immersive focused display card */}
          <div className="lg:col-span-8 bg-[#1a1817] border border-[#262322] rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-500 min-h-[440px]">
            {/* Ambient copper glow behind right display card */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#d18a59]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col">
              
              {/* Badge & Category Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#262322]/60 mb-6 shrink-0">
                <span className="text-xs font-bold text-[#d18a59] uppercase tracking-widest">{useCases[activeUseCase].category}</span>
                <span className="text-[10px] bg-[#d18a59]/10 text-[#d18a59] px-3 py-1 rounded border border-[#d18a59]/25 font-bold uppercase tracking-wider">
                  {useCases[activeUseCase].badge}
                </span>
              </div>

              {/* Title & Large readable description */}
              <h3 className="text-xl md:text-2xl font-black text-neutral-100 mb-4 leading-snug">
                {useCases[activeUseCase].title}
              </h3>
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6">
                {useCases[activeUseCase].description}
              </p>

              {/* Handcrafted Real-World Pipeline Preview */}
              <div className="bg-[#121110] border border-[#262322] rounded-2xl p-4 mb-6 flex flex-col gap-3 font-sans relative overflow-hidden shrink-0">
                
                {/* PDF extract block */}
                <div className="pb-3 border-b border-[#262322]/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-neutral-500 font-bold font-mono">
                    <span>📄 Extracted {useCases[activeUseCase].preview.documentName}</span>
                    <span className="text-[#d18a59] bg-[#d18a59]/10 border border-[#d18a59]/20 px-1.5 py-0.5 rounded font-mono">{useCases[activeUseCase].preview.page}</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-neutral-400 leading-relaxed italic bg-[#1a1817]/40 px-3 py-2 rounded-lg border border-[#262322]/40 font-mono">
                    {useCases[activeUseCase].preview.extractedText}
                  </p>
                </div>

                {/* AI Query & Cited Response block */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 self-start bg-[#1a1817] px-3 py-1.5 rounded-full border border-[#262322] text-[11px] md:text-xs text-neutral-200 font-mono">
                    <span className="w-1.5 h-1.5 bg-[#d18a59] rounded-full"></span>
                    <span><strong>Query:</strong> {useCases[activeUseCase].preview.userQuery}</span>
                  </div>
                  
                  <div className="flex gap-2 max-w-[95%]">
                    <div className="w-4 h-4 rounded-full bg-[#121110] border border-[#262322] flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#d18a59]"></div>
                    </div>
                    <p className="text-[11px] md:text-xs text-neutral-300 leading-relaxed">
                      <strong>Response:</strong> {useCases[activeUseCase].preview.assistantResponse.split("**").map((txt, ti) => 
                        ti % 2 === 1 ? <strong key={ti} className="text-neutral-100 font-semibold">{txt}</strong> : txt
                      )}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Core Workflow Pillars (Bullet list) */}
            <div className="relative z-10 border-t border-[#262322]/60 pt-5 mt-auto shrink-0">
              <div className="flex flex-wrap gap-2.5">
                {useCases[activeUseCase].bulletPoints.map((bp, bidx) => (
                  <div 
                    key={bidx} 
                    className="bg-[#121110] border border-[#262322] text-neutral-300 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 font-medium"
                  >
                    <span className="w-1.5 h-1.5 bg-[#d18a59] rounded-full shrink-0"></span>
                    <span>{bp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Step-by-Step Interactive Workflow */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-4xl mx-auto relative z-10 border-t border-[#262322] w-full shrink-0">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-[#d18a59] uppercase tracking-widest mb-3">Vector Ingestion</h2>
          <p className="text-2xl md:text-3xl font-black tracking-tight text-neutral-100 leading-tight">
            How our pipeline compound works
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3">
            <span className="text-[10px] bg-[#121110] text-[#d18a59] font-mono w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold border border-[#262322]">01</span>
            <h3 className="text-sm font-bold text-neutral-100 tracking-tight uppercase">Segmented Parsing</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              We process your PDF on load, parsing exact page boundaries separately to prevent metadata loss during downstream chunking.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3">
            <span className="text-[10px] bg-[#121110] text-[#d18a59] font-mono w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold border border-[#262322]">02</span>
            <h3 className="text-sm font-bold text-neutral-100 tracking-tight uppercase">Multi-page Vectorization</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Words are vectorized into multi-dimensional embeddings, keeping structural metadata in Postgres JSONB stores.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1a1817]/40 border border-[#262322] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3">
            <span className="text-[10px] bg-[#121110] text-[#d18a59] font-mono w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold border border-[#262322]">03</span>
            <h3 className="text-sm font-bold text-neutral-100 tracking-tight uppercase">Traceable Generation</h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Gemini fetches overlapping vector chunks and returns clear bullet points carrying citation page badges for you to verify.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Accordion FAQs Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-3xl mx-auto relative z-10 border-t border-[#262322] w-full shrink-0">
        
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-[#d18a59] uppercase tracking-widest mb-3">Common Questions</h2>
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
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm md:text-base font-bold text-neutral-200 tracking-tight hover:text-neutral-100 transition select-none outline-none focus:text-[#d18a59]"
                >
                  <span>{faq.q}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4.5 w-4.5 text-neutral-600 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#d18a59]" : ""}`}
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
                  <p className="px-5 py-4 text-xs md:text-sm text-neutral-300 leading-relaxed">
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
        <p className="text-neutral-400 text-xs md:text-sm mt-3 max-w-md mx-auto leading-relaxed">
          Unlock, analyze, and query your research papers, financial reports, or structural specs immediately.
        </p>
        <div className="mt-8">
          <button
            onClick={() => router.push("/sign-up")}
            className="bg-[#f4ebe1] hover:bg-[#faf5ef] text-[#121110] border border-[#d2c3b4] font-bold px-8 py-3.5 rounded-full transition-all duration-300 text-xs uppercase tracking-wider shadow-lg shadow-black/25 transform hover:scale-[1.02]"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#262322] px-6 py-8 text-center shrink-0 bg-[#121110]/60 relative z-10">
        <p className="text-neutral-500 text-xs tracking-wider uppercase font-bold">
          Powered by Gemini Pro, Vector Ingest, and Next.js Framework
        </p>
      </footer>
    </main>
  );
}
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-5 bg-[#121110] text-neutral-300 relative selection:bg-orange-500/20 selection:text-orange-300">
      
      {/* Decorative Warm Blur blob */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Left side: Cozy visual benefits pane */}
      <section className="hidden lg:flex lg:col-span-3 bg-[#121110] bg-grid-pattern border-r border-[#262322] p-12 flex-col justify-between relative overflow-hidden z-10">
        
        {/* Top Logo branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-sm shadow-md shadow-orange-500/20">
            P
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-100 uppercase">ChatPDF</span>
        </div>

        {/* Cozy benefits list */}
        <div className="max-w-md flex flex-col gap-6 my-auto">
          <h2 className="text-3xl font-black text-neutral-100 tracking-tight leading-tight">
            Unlock the knowledge inside your documents
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Skip the tedious reading. Upload manuals, textbooks, papers, or contracts, and query them in natural language.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {/* Benefit Item 1 */}
            <div className="flex items-start gap-3 bg-[#1a1817]/60 border border-[#262322] p-4 rounded-xl hover:border-orange-500/10 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/25 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-200 tracking-tight uppercase">High-Speed Ingestion</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Gemini 2.5 Flash architecture processes and embeds a 50-page PDF in under 10 seconds.</p>
              </div>
            </div>

            {/* Benefit Item 2 */}
            <div className="flex items-start gap-3 bg-[#1a1817]/60 border border-[#262322] p-4 rounded-xl hover:border-orange-500/10 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/25 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-200 tracking-tight uppercase">Traceable Source Citations</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Every AI answer references exact page numbers, making manual verification simple and precise.</p>
              </div>
            </div>

            {/* Benefit Item 3 */}
            <div className="flex items-start gap-3 bg-[#1a1817]/60 border border-[#262322] p-4 rounded-xl hover:border-orange-500/10 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/25 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-200 tracking-tight uppercase">Isolated Data Privacy</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Vector chunks are linked securely to your authentication keys. Your private data remains yours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold">
          Engineered for high performance and accuracy
        </div>
      </section>

      {/* Right side: Clean, High-Contrast Clerk Form (40% width) */}
      <section className="col-span-5 lg:col-span-2 flex items-center justify-center p-6 relative overflow-hidden z-10 bg-[#121110]">
        
        {/* Extra mobile branding header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-6.5 h-6.5 bg-gradient-to-tr from-orange-500 to-amber-500 rounded flex items-center justify-center text-neutral-950 font-black text-xs">
            P
          </div>
          <span className="text-xs font-bold text-neutral-200 tracking-tight uppercase">ChatPDF</span>
        </div>

        {/* Perfectly legible SignUp component overridden by custom CSS */}
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#f97316", // orange-500
              colorBackground: "#1a1817", // warm dark-charcoal card
              colorText: "#f4f4f5", // zinc-100
              colorTextSecondary: "#d4d4d8", // zinc-300
              colorInputBackground: "#121110", // input base
              colorInputText: "#f4f4f5",
              colorBorder: "#262322", // warm border
            },
            elements: {
              card: "bg-[#1a1817] border border-[#262322] shadow-2xl rounded-2xl p-6",
              headerTitle: "text-zinc-100 font-bold tracking-tight text-lg",
              headerSubtitle: "text-zinc-400 text-xs",
              socialButtonsIconButton: "bg-[#121110] border border-[#262322] hover:bg-[#262322] text-zinc-100 transition duration-300 rounded-xl",
              socialButtonsBlockButton: "bg-[#121110] border border-[#262322] hover:bg-[#262322] text-zinc-200 transition duration-300 rounded-xl font-medium",
              socialButtonsBlockButtonText: "text-zinc-200 font-semibold",
              formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl py-2.5 transition duration-300",
              footerActionText: "text-zinc-400 text-xs",
              footerActionLink: "text-orange-500 hover:text-orange-400 font-bold underline underline-offset-4 transition",
              formFieldLabel: "text-zinc-300 text-xs font-semibold",
              formFieldInput: "bg-[#121110] border border-[#262322] text-zinc-100 rounded-xl focus:border-orange-500/50 transition duration-300 py-2.5 px-3.5 outline-none placeholder:text-zinc-600",
              dividerLine: "bg-[#262322]",
              dividerText: "text-zinc-500 uppercase text-[9px] tracking-widest font-bold",
            },
          }}
        />
      </section>
    </main>
  );
}
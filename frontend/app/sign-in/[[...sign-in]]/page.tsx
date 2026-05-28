import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-5 bg-[#121110] text-neutral-300 relative selection:bg-[#c86a3e]/20 selection:text-neutral-100">
      
      {/* Decorative Warm Blur blob */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-[#c86a3e]/3 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Left side: Cozy visual benefits pane */}
      <section className="hidden lg:flex lg:col-span-3 bg-[#121110] bg-grid-pattern border-r border-[#c8b9a6]/15 p-12 flex-col justify-between relative overflow-hidden z-10">
        
        {/* Top Logo branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1a1817] border border-[#c8b9a6]/20 rounded flex items-center justify-center text-[#c86a3e] font-mono font-bold text-xs shadow-sm shadow-[#c86a3e]/5">
            $
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-100 uppercase">doc-query</span>
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
            <div className="flex items-start gap-3 bg-[#1a1817]/60 border border-[#c8b9a6]/10 p-4 rounded-xl hover:border-[#c86a3e]/20 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-[#c86a3e]/10 text-[#e28a5f] border border-[#c86a3e]/20 flex items-center justify-center shrink-0">
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
            <div className="flex items-start gap-3 bg-[#1a1817]/60 border border-[#c8b9a6]/10 p-4 rounded-xl hover:border-[#c86a3e]/20 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-[#c86a3e]/10 text-[#e28a5f] border border-[#c86a3e]/20 flex items-center justify-center shrink-0">
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
            <div className="flex items-start gap-3 bg-[#1a1817]/60 border border-[#c8b9a6]/10 p-4 rounded-xl hover:border-[#c86a3e]/20 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-[#c86a3e]/10 text-[#e28a5f] border border-[#c86a3e]/20 flex items-center justify-center shrink-0">
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
          <div className="w-6.5 h-6.5 bg-[#1a1817] border border-[#c8b9a6]/20 rounded flex items-center justify-center text-[#c86a3e] font-mono font-bold text-[10px]">
            $
          </div>
          <span className="text-xs font-bold text-neutral-200 tracking-tight uppercase">doc-query</span>
        </div>

        {/* Perfectly legible SignIn component overridden by custom CSS */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#c86a3e", // brand forest rust
              colorBackground: "#1a1817", // warm dark-charcoal card
              colorText: "#f4f4f5", // zinc-100
              colorTextSecondary: "#d4d4d8", // zinc-300
              colorInputBackground: "#121110", // input base
              colorInputText: "#f4f4f5",
              colorBorder: "#c8b9a6", // warm border variable reference
            },
            elements: {
              card: "bg-[#1a1817] border border-[#c8b9a6]/15 shadow-2xl rounded-2xl p-6",
              headerTitle: "text-zinc-100 font-bold tracking-tight text-lg",
              headerSubtitle: "text-zinc-400 text-xs",
              socialButtonsIconButton: "bg-[#121110] border border-[#c8b9a6]/15 hover:bg-[#1a1817] text-zinc-100 transition duration-300 rounded-xl",
              socialButtonsBlockButton: "bg-[#121110] border border-[#c8b9a6]/15 hover:bg-[#1a1817] text-zinc-200 transition duration-300 rounded-xl font-medium",
              socialButtonsBlockButtonText: "text-zinc-200 font-semibold",
              formButtonPrimary: "bg-[#f4ebe1] hover:bg-[#faf5ef] text-[#121110] border border-[#d2c3b4] font-bold text-xs uppercase tracking-wider rounded-xl py-2.5 transition duration-300",
              footerActionText: "text-zinc-400 text-xs",
              footerActionLink: "text-[#e28a5f] hover:text-[#f3a87f] font-bold underline underline-offset-4 transition",
              formFieldLabel: "text-zinc-300 text-xs font-semibold",
              formFieldInput: "bg-[#121110] border border-[#c8b9a6]/15 text-zinc-100 rounded-xl focus:border-[#c86a3e]/40 transition duration-300 py-2.5 px-3.5 outline-none placeholder:text-zinc-600",
              dividerLine: "bg-[#c8b9a6]/15",
              dividerText: "text-zinc-500 uppercase text-[9px] tracking-widest font-bold",
            },
          }}
        />
      </section>
    </main>
  );
}
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-5 bg-[#030303] text-neutral-300 relative selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Decorative Blur blob */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Left side: Premium Visual & Benefits Pane (60% width) */}
      <section className="hidden lg:flex lg:col-span-3 bg-[#030303] bg-grid-pattern border-r border-neutral-900/60 p-12 flex-col justify-between relative overflow-hidden z-10">
        
        {/* Top Logo branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center text-neutral-950 font-black tracking-tight text-sm shadow-md shadow-emerald-500/20">
            P
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-100 uppercase">ChatPDF</span>
        </div>

        {/* Core benefit cards list */}
        <div className="max-w-md flex flex-col gap-6 my-auto">
          <h2 className="text-3xl font-black text-neutral-100 tracking-tight leading-tight">
            Unlock the knowledge inside your documents
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Skip the tedious reading. Upload manuals, textbooks, papers, or contracts, and query them in natural language.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {/* Benefit Item 1 */}
            <div className="flex items-start gap-3 bg-neutral-950/60 border border-neutral-900/60 p-4 rounded-xl hover:border-emerald-500/10 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 flex items-center justify-center shrink-0">
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
            <div className="flex items-start gap-3 bg-neutral-950/60 border border-neutral-900/60 p-4 rounded-xl hover:border-emerald-500/10 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 flex items-center justify-center shrink-0">
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
            <div className="flex items-start gap-3 bg-neutral-950/60 border border-neutral-900/60 p-4 rounded-xl hover:border-emerald-500/10 transition duration-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 flex items-center justify-center shrink-0">
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
      <section className="col-span-5 lg:col-span-2 flex items-center justify-center p-6 relative overflow-hidden z-10">
        
        {/* Extra mobile branding header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-6.5 h-6.5 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded flex items-center justify-center text-neutral-950 font-black text-xs">
            P
          </div>
          <span className="text-xs font-bold text-neutral-200 tracking-tight uppercase">ChatPDF</span>
        </div>

        {/* Perfectly legible SignIn component */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#10b981", // emerald-500
              colorBackground: "#09090b", // zinc-950 (perfect black-gray card)
              colorText: "#f4f4f5", // zinc-100 (light white)
              colorTextSecondary: "#d4d4d8", // zinc-300 (highly legible light gray for placeholders & subtitles)
              colorInputBackground: "#18181b", // zinc-900
              colorInputText: "#f4f4f5",
              colorBorder: "#27272a", // zinc-800
            },
            elements: {
              card: "bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 shadow-2xl shadow-black/95 rounded-2xl p-6",
              headerTitle: "text-zinc-100 font-bold tracking-tight text-lg",
              headerSubtitle: "text-zinc-400 text-xs",
              socialButtonsIconButton: "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 hover:text-white transition duration-300 rounded-xl",
              socialButtonsBlockButton: "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-white transition duration-300 rounded-xl font-medium",
              socialButtonsBlockButtonText: "text-zinc-200 font-semibold",
              formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl py-2.5 transition duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/35",
              footerActionText: "text-zinc-400 text-xs",
              footerActionLink: "text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition",
              formFieldLabel: "text-zinc-300 text-xs font-semibold",
              formFieldInput: "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl focus:border-emerald-500/50 transition duration-300 py-2.5 px-3.5 outline-none placeholder:text-zinc-600",
              dividerLine: "bg-zinc-800/80",
              dividerText: "text-zinc-500 uppercase text-[9px] tracking-widest font-bold",
            },
          }}
        />
      </section>
    </main>
  );
}
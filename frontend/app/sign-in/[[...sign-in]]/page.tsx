import { SignIn } from "@clerk/nextjs";
import { FileText, ShieldCheck, Zap, MessageSquare } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="auth-container min-h-screen w-full bg-zinc-950 bg-grid-pattern flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-amber-500/20 selection:text-white">
      
      {/* Decorative Warm Blur blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/2 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Centered Integrated Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-5xl w-full grid md:grid-cols-12 overflow-hidden shadow-2xl shadow-black/80 relative z-10">
        
        {/* Left Column: Sleek benefits pane (7/12 cols) */}
        <section className="md:col-span-7 bg-zinc-950/40 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800/80">
          
          {/* Top Logo branding */}
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-white" strokeWidth={2} />
            <span className="text-[15px] font-semibold tracking-tight text-white">chat-with-pdf</span>
          </div>

          {/* Benefits list */}
          <div className="max-w-md flex flex-col gap-6 my-auto pt-8 pb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Unlock the knowledge inside your documents
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Skip the tedious reading. Upload manuals, textbooks, papers, or contracts, and query them in natural language.
            </p>

            <div className="flex flex-col gap-3.5 mt-2">
              {/* Benefit Item 1 */}
              <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
                <div className="w-8.5 h-8.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase">High-Speed Ingestion</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Gemini 2.5 Flash architecture processes and embeds a 50-page PDF in under 10 seconds.</p>
                </div>
              </div>

              {/* Benefit Item 2 */}
              <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
                <div className="w-8.5 h-8.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase">Traceable Source Citations</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Every AI answer references exact page numbers, making manual verification simple and precise.</p>
                </div>
              </div>

              {/* Benefit Item 3 */}
              <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
                <div className="w-8.5 h-8.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase">Isolated Data Privacy</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Vector chunks are linked securely to your authentication keys. Your private data remains yours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="text-[10px] text-zinc-650 uppercase tracking-widest font-semibold">
            Engineered for high performance and accuracy
          </div>
        </section>

        {/* Right Column: Clean, High-Contrast Clerk Form (5/12 cols) */}
        <section className="md:col-span-5 flex items-center justify-center p-8 md:p-10 bg-zinc-900/20">
          {/* Transparent, perfectly nested Clerk SignUp component */}
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#f59e0b", // Amber accent
                colorBackground: "#18181b", // fallback for dialogs
                colorText: "#fafafa",
                colorTextSecondary: "#a1a1aa",
                colorInputBackground: "#09090b",
                colorInputText: "#fafafa",
                colorBorder: "rgba(255, 255, 255, 0.08)",
              },
              elements: {
                card: "bg-transparent border-none shadow-none p-0 w-full max-w-[340px]",
                headerTitle: "text-zinc-100 font-bold tracking-tight text-lg text-left",
                headerSubtitle: "text-zinc-400 text-xs text-left",
                socialButtonsIconButton: "bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-100 transition duration-300 rounded-xl",
                socialButtonsBlockButton: "bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-200 transition duration-300 rounded-xl font-medium",
                socialButtonsBlockButtonText: "text-zinc-200 font-semibold",
                formButtonPrimary: "bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl py-2.5 transition duration-300",
                footerActionText: "text-zinc-400 text-xs",
                footerActionLink: "text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 transition",
                formFieldLabel: "text-zinc-300 text-xs font-semibold",
                formFieldInput: "bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:border-amber-500/40 transition duration-300 py-2.5 px-3.5 outline-none placeholder:text-zinc-500",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-500 uppercase text-[9px] tracking-widest font-bold",
              },
            }}
          />
        </section>
      </div>
    </main>
  );
}
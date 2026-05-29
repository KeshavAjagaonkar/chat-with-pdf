import { SignIn } from "@clerk/nextjs";
import { FileText, ShieldCheck, Zap, MessageSquare } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-5 bg-zinc-950 text-zinc-300 relative overflow-hidden selection:bg-amber-500/20 selection:text-white">
      
      {/* Decorative Warm Blur blob */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/3 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Left side: Sleek visual benefits pane */}
      <section className="hidden lg:flex lg:col-span-3 bg-zinc-950 bg-grid-pattern border-r border-zinc-800 p-12 flex-col justify-between relative overflow-hidden z-10">
        
        {/* Top Logo branding */}
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-tight text-white">chat-with-pdf</span>
        </div>

        {/* Benefits list */}
        <div className="max-w-md flex flex-col gap-6 my-auto">
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Unlock the knowledge inside your documents
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Skip the tedious reading. Upload manuals, textbooks, papers, or contracts, and query them in natural language.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {/* Benefit Item 1 */}
            <div className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-850 p-4 rounded-xl hover:border-amber-500/20 transition duration-300">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase">High-Speed Ingestion</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Gemini 2.5 Flash architecture processes and embeds a 50-page PDF in under 10 seconds.</p>
              </div>
            </div>

            {/* Benefit Item 2 */}
            <div className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-850 p-4 rounded-xl hover:border-amber-500/20 transition duration-300">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase">Traceable Source Citations</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Every AI answer references exact page numbers, making manual verification simple and precise.</p>
              </div>
            </div>

            {/* Benefit Item 3 */}
            <div className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-850 p-4 rounded-xl hover:border-amber-500/20 transition duration-300">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase">Isolated Data Privacy</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Vector chunks are linked securely to your authentication keys. Your private data remains yours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-zinc-650 uppercase tracking-widest font-semibold">
          Engineered for high performance and accuracy
        </div>
      </section>

      {/* Right side: Clean, High-Contrast Clerk Form (40% width) */}
      <section className="col-span-5 lg:col-span-2 flex items-center justify-center p-6 relative overflow-hidden z-10 bg-zinc-950">
        
        {/* Extra mobile branding header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" strokeWidth={2} />
          <span className="text-xs font-semibold text-zinc-200 tracking-tight">chat-with-pdf</span>
        </div>

        {/* Perfectly legible SignIn component overridden by custom CSS */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#f59e0b", // Amber accent
              colorBackground: "#18181b", // Zinc-900 dark-charcoal card
              colorText: "#fafafa", // Zinc-50 text
              colorTextSecondary: "#a1a1aa", // Zinc-400
              colorInputBackground: "#09090b", // input base
              colorInputText: "#fafafa",
              colorBorder: "rgba(255, 255, 255, 0.08)", // border variable reference
            },
            elements: {
              card: "bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl p-6",
              headerTitle: "text-zinc-100 font-bold tracking-tight text-lg",
              headerSubtitle: "text-zinc-400 text-xs",
              socialButtonsIconButton: "bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-100 transition duration-300 rounded-xl",
              socialButtonsBlockButton: "bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-200 transition duration-300 rounded-xl font-medium",
              socialButtonsBlockButtonText: "text-zinc-200 font-semibold",
              formButtonPrimary: "bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl py-2.5 transition duration-300",
              footerActionText: "text-zinc-400 text-xs",
              footerActionLink: "text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 transition",
              formFieldLabel: "text-zinc-300 text-xs font-semibold",
              formFieldInput: "bg-zinc-950 border border-zinc-850 text-zinc-100 rounded-xl focus:border-amber-500/40 transition duration-300 py-2.5 px-3.5 outline-none placeholder:text-zinc-650",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-500 uppercase text-[9px] tracking-widest font-bold",
            },
          }}
        />
      </section>
    </main>
  );
}
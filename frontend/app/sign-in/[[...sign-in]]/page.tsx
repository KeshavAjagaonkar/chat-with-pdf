import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#030303] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#10b981", // emerald-500
            colorBackground: "#0a0a0a", // neutral-950
            colorText: "#f5f5f5", // neutral-100
            colorTextSecondary: "#a3a3a3", // neutral-400
            colorInputBackground: "#171717", // neutral-900
            colorInputText: "#f5f5f5",
            colorBorder: "#262626", // neutral-800
          },
          elements: {
            card: "bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 shadow-2xl shadow-black/80 rounded-2xl p-6",
            headerTitle: "text-neutral-100 font-semibold tracking-tight text-xl",
            headerSubtitle: "text-neutral-400 text-sm",
            socialButtonsIconButton: "bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-100 transition duration-300 rounded-xl",
            socialButtonsBlockButton: "bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-100 transition duration-300 rounded-xl",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-semibold text-sm rounded-xl py-2.5 transition duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25",
            footerActionText: "text-neutral-400 text-xs",
            footerActionLink: "text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 transition",
            formFieldLabel: "text-neutral-300 text-xs font-medium",
            formFieldInput: "bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl focus:border-emerald-500/50 transition duration-300 py-2.5",
            dividerLine: "bg-neutral-800",
            dividerText: "text-neutral-500 uppercase text-[10px] tracking-wider",
          },
        }}
      />
    </main>
  );
}
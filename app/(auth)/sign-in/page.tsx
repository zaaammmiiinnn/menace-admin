import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Sign In — MENACE Admin',
  description: 'Authorized personnel access to MENACE ops cockpit',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#262626] text-[11px] font-mono tracking-widest text-[#C6FF00]">
            <ShieldCheck className="w-3.5 h-3.5" />
            OPERATIONS CONSOLE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-[#F5F1E8]">
            MENACE
          </h1>
          <p className="text-xs text-[#8A8A8A] uppercase tracking-wider font-mono">
            Authorized Admin & Staff Access Only
          </p>
        </div>

        {/* Clerk Sign In with Menace Theme */}
        <div className="w-full flex justify-center">
          <SignIn
            appearance={{
              theme: dark,
              variables: {
                colorBackground: '#121212',
                colorPrimary: '#C6FF00',
                borderRadius: '0.5rem',
              },
              elements: {
                card: 'border border-[#262626] shadow-2xl shadow-black/80 bg-[#121212]',
                formButtonPrimary:
                  'bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-semibold text-sm transition-all duration-150',
                formFieldInput:
                  'border-[#2A2A2A] focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] bg-[#161616] text-[#F5F1E8]',
                footerActionLink: 'text-[#C6FF00] hover:underline',
                headerTitle: 'text-xl font-bold tracking-tight text-[#F5F1E8]',
                headerSubtitle: 'text-xs text-[#8A8A8A]',
                dividerLine: 'bg-[#262626]',
                dividerText: 'text-[#8A8A8A] text-xs font-mono',
              },
            }}
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        </div>

        <div className="mt-8 text-center text-[11px] font-mono text-[#555555]">
          SESSION PROTECTED BY CLERK & CLOUDFLARE D1
        </div>
      </div>
    </div>
  );
}

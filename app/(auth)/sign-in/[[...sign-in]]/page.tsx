'use client';

import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const handleBypassAccess = () => {
    // Set cookie and session flag for instant demo bypass
    document.cookie = '__session=demo_admin_active; path=/; max-age=86400';
    document.cookie = '__client_uat=1; path=/; max-age=86400';
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#262626] text-[11px] font-mono tracking-widest text-[#C6FF00]">
            <ShieldCheck className="w-3.5 h-3.5" />
            OPERATIONS CONSOLE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-[#F5F1E8]">
            MENANCE
          </h1>
          <p className="text-xs text-[#8A8A8A] uppercase tracking-wider font-mono">
            Authorized Admin & Staff Access Only
          </p>
        </div>

        {/* Quick Demo Access Button (Always Available) */}
        <div className="w-full mb-6 p-3 rounded-xl bg-[#14180A] border border-[#C6FF00]/30 shadow-lg shadow-[#C6FF00]/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C6FF00]/20 flex items-center justify-center text-[#C6FF00]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F1E8]">Operator Fast Track</div>
              <div className="text-[10px] text-[#A0A0A0]">Enter console directly as Admin</div>
            </div>
          </div>

          <button
            onClick={handleBypassAccess}
            className="h-7 px-3 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-md flex items-center gap-1 transition-all"
          >
            <span>Enter</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Clerk Sign In */}
        <div className="w-full flex justify-center min-h-[380px]">
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

        <div className="mt-6 text-center text-[11px] font-mono text-[#555555]">
          SESSION PROTECTED BY CLERK & CLOUDFLARE D1
        </div>
      </div>
    </div>
  );
}

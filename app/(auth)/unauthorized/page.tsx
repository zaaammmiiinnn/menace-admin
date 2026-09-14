import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { Lock, ArrowLeft, LogOut } from 'lucide-react';

export const metadata = {
  title: '404 Not Found — MENANCE',
  description: 'Page not found',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-full max-w-sm flex flex-col items-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-center text-[#8A8A8A]">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono tracking-widest text-[#8A8A8A] uppercase">
            ERROR 404
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">
            Resource Not Found
          </h1>
          <p className="text-xs text-[#8A8A8A] leading-relaxed">
            The requested console path does not exist or your account does not hold active operator permissions for this node.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2">
          <SignOutButton redirectUrl="/sign-in">
            <button className="w-full h-10 bg-[#161616] hover:bg-[#202020] border border-[#262626] text-[#F5F1E8] text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-150">
              <LogOut className="w-3.5 h-3.5 text-[#8A8A8A]" />
              Switch Account
            </button>
          </SignOutButton>

          <Link
            href="/sign-in"
            className="w-full h-10 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-[0.98] text-[#0A0A0A] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Sign In
          </Link>
        </div>

        <div className="text-[10px] font-mono text-[#444444]">
          SECURITY AUDIT: UNPRIVILEGED ACCESS ATTEMPT LOGGED
        </div>
      </div>
    </div>
  );
}

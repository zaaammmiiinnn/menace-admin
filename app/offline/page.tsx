'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-center text-[#C6FF00]">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono tracking-widest uppercase text-[#8A8A8A]">
            MENACE / OFFLINE MODE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">
            No signal. Try again.
          </h1>
          <p className="text-sm text-[#8A8A8A] leading-relaxed">
            Your connection dropped. Cached orders and shell are accessible, and pending fulfillments will automatically sync when reconnected.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full h-11 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-[0.98] text-[#0A0A0A] font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>

          <Link
            href="/orders"
            className="w-full h-11 bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] text-[#F5F1E8] text-sm font-medium rounded-lg flex items-center justify-center transition-all duration-150"
          >
            Go to Cached Orders
          </Link>
        </div>

        <div className="text-[11px] font-mono text-[#8A8A8A]">
          STATUS: QUEUED MUTATIONS PERSISTED LOCALLY
        </div>
      </div>
    </div>
  );
}

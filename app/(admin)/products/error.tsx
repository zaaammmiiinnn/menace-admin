'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-black tracking-tight text-[#F5F1E8]">
            SOMETHING BROKE
          </h2>
          <p className="text-sm text-[#8A8A8A]">
            The catalog page hit an error loading from D1.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-[#0F0F0F] border border-[#1C1C1C] rounded-xl p-4 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            ERROR DETAILS
          </p>
          <p className="text-sm font-mono text-red-400 break-all leading-relaxed">
            {error.message || 'Unknown error'}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-[#555]">
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C6FF00] text-black font-bold text-sm rounded-lg hover:bg-[#d4ff33] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            RETRY
          </button>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#1C1C1C] text-[#8A8A8A] font-bold text-sm rounded-lg hover:border-[#333] hover:text-[#F5F1E8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            DASHBOARD
          </Link>
        </div>

        {/* Debug Hint */}
        <p className="text-center text-[10px] font-mono text-[#555]">
          Check wrangler.toml D1 binding &bull; Verify getCloudflareContext() &bull; Run npm run preview:cloudflare
        </p>
      </div>
    </div>
  );
}

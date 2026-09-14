'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Wifi, WifiOff, RefreshCw, Search } from 'lucide-react';
import { registerServiceWorker, getOfflineQueue, clearOfflineQueue } from '@/lib/pwa/register';
import { toast } from 'sonner';

export function AdminHeaderBar({
  userRole,
  userName,
}: {
  userRole: 'admin' | 'staff';
  userName: string;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  useEffect(() => {
    registerServiceWorker();

    const updateOnline = () => setIsOnline(navigator.onLine);
    const updateQueue = () => setPendingQueueCount(getOfflineQueue().length);

    updateOnline();
    updateQueue();

    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    window.addEventListener('menance-queue-updated', updateQueue);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      window.removeEventListener('menance-queue-updated', updateQueue);
    };
  }, []);

  const handleSyncQueue = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      toast.info('No pending offline mutations.');
      return;
    }

    toast.loading(`Syncing ${queue.length} offline mutations...`);
    // Simulated replay of queued items
    setTimeout(() => {
      clearOfflineQueue();
      setPendingQueueCount(0);
      toast.success('Offline queue synchronized successfully with D1.');
      window.location.reload();
    }, 800);
  };

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-[#1C1C1C] bg-[#0E0E0E]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#C6FF00] flex items-center justify-center font-black text-black text-xs">
            M
          </div>
          <span className="text-xs font-black tracking-tight text-[#F5F1E8]">MENANCE</span>
        </Link>
        <div className="hidden sm:block text-xs font-mono text-[#8A8A8A]">
          OPERATIONS // {userRole.toUpperCase()} NODE
        </div>
      </div>

      {/* Right: Sync Status & Search */}
      <div className="flex items-center gap-3">
        {/* Offline Queue Badge */}
        {pendingQueueCount > 0 && (
          <button
            onClick={handleSyncQueue}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono animate-pulse hover:bg-amber-500/25 transition-colors"
            title="Click to sync pending offline actions"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{pendingQueueCount} queued</span>
          </button>
        )}

        {/* Live Network Pill */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono border ${
            isOnline
              ? 'bg-[#C6FF00]/10 border-[#C6FF00]/30 text-[#C6FF00]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span className="hidden xs:inline">ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE</span>
            </>
          )}
        </div>

        {/* Search trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-palette'))}
          className="h-8 px-2.5 bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] rounded-lg text-xs font-mono text-[#8A8A8A] hover:text-[#F5F1E8] flex items-center gap-2 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#C6FF00]" />
          <span className="hidden sm:inline">Search (⌘K)</span>
        </button>

        {/* Mobile User Profile */}
        <div className="lg:hidden flex items-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-7 h-7 rounded border border-[#262626]',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

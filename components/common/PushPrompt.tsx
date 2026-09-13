'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';
import { requestPushPermission } from '@/lib/pwa/register';
import { toast } from 'sonner';

export function PushPrompt() {
  const [permission, setPermission] = useState<string>('default');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleEnable = async () => {
    const res = await requestPushPermission();
    setPermission(res);
    if (res === 'granted') {
      toast.success('Push notifications active for new orders & drop telemetry.');
      // Send sample notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('MENACE Ops Alert', {
            body: 'New order: ₹1,499 — The Quiet Menace Tee',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
          });
        });
      }
    } else if (res === 'denied') {
      toast.error('Notification permissions blocked in browser settings.');
    }
  };

  const handleTestAlert = (type: 'order' | 'stock' | 'drop') => {
    if (permission !== 'granted') {
      toast.info('Enable push notifications first.');
      return;
    }

    const stubs = {
      order: {
        title: '⚡ New Order MNC-8826',
        body: 'New order: ₹1,499 — The Quiet Menace Tee (Size M)',
      },
      stock: {
        title: '⚠️ Low Stock Alert',
        body: 'Midnight Menace M: 3 left in fulfillment rack',
      },
      drop: {
        title: '🔥 Drop Live Telemetry',
        body: 'DROP 001 is live — 420 checkouts queued in storefront',
      },
    };

    const target = stubs[type];
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(target.title, {
          body: target.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        });
      });
    }
    toast.success(`Dispatched simulated push: ${target.title}`);
  };

  if (!isSupported) return null;

  return (
    <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#C6FF00]">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F1E8]">Order & Stock Push Alerts</div>
            <div className="text-[11px] text-[#8A8A8A]">
              Instant push alerts for drop velocity and rapid packaging
            </div>
          </div>
        </div>

        {permission === 'granted' ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#C6FF00]/10 text-[#C6FF00] text-xs font-mono font-medium">
            <Check className="w-3.5 h-3.5" />
            Active
          </div>
        ) : (
          <button
            onClick={handleEnable}
            className="h-7 px-3 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-semibold text-xs rounded-md transition-all duration-150 flex items-center gap-1.5"
          >
            <BellRing className="w-3 h-3" />
            Enable
          </button>
        )}
      </div>

      {permission === 'granted' && (
        <div className="pt-2 border-t border-[#1C1C1C] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-[#8A8A8A]">Test Web Push:</span>
          <button
            onClick={() => handleTestAlert('order')}
            className="px-2 py-1 text-[11px] font-mono bg-[#181818] hover:bg-[#202020] text-[#F5F1E8] rounded border border-[#262626] transition-colors"
          >
            + Order Alert
          </button>
          <button
            onClick={() => handleTestAlert('stock')}
            className="px-2 py-1 text-[11px] font-mono bg-[#181818] hover:bg-[#202020] text-[#F5F1E8] rounded border border-[#262626] transition-colors"
          >
            + Low Stock
          </button>
          <button
            onClick={() => handleTestAlert('drop')}
            className="px-2 py-1 text-[11px] font-mono bg-[#181818] hover:bg-[#202020] text-[#F5F1E8] rounded border border-[#262626] transition-colors"
          >
            + Drop Live
          </button>
        </div>
      )}
    </div>
  );
}

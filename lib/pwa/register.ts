'use client';

export interface QueuedMutation {
  id: string;
  type: 'MARK_PACKED' | 'MARK_SHIPPED' | 'UPDATE_STOCK';
  payload: any;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = 'menance_offline_queue_v1';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        });
    });
  }
}

export function getOfflineQueue(): QueuedMutation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineMutation(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const queue = getOfflineQueue();
  const item: QueuedMutation = {
    ...mutation,
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  queue.push(item);
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

  // Trigger background sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg: any) => {
      reg.sync.register('sync-orders').catch(() => {});
    });
  }

  // Dispatch custom event for UI updates
  window.dispatchEvent(new CustomEvent('menance-queue-updated', { detail: queue.length }));
  return item;
}

export function clearOfflineQueue() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('menance-queue-updated', { detail: 0 }));
}

export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return await Notification.requestPermission();
}

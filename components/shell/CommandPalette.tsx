'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  Users,
  Boxes,
  TicketPercent,
  TrendingUp,
  Settings,
  Plus,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Quick Actions' | 'Operations';
  shortcut?: string;
  icon: any;
  action: () => void;
}

export function CommandPalette({ userRole = 'admin' }: { userRole?: 'admin' | 'staff' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd + K or Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }

      // 'G' then key sequence shortcuts when not in input
      if (!isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'g') {
          const nextKeyHandler = (nextEvent: KeyboardEvent) => {
            window.removeEventListener('keydown', nextKeyHandler);
            const key = nextEvent.key.toLowerCase();
            if (key === 'd') router.push('/dashboard');
            if (key === 'o') router.push('/orders');
            if (key === 'p' && userRole === 'admin') router.push('/products');
            if (key === 'c') router.push('/customers');
            if (key === 'i') router.push('/inventory');
            if (key === 'x' && userRole === 'admin') router.push('/discounts');
            if (key === 'a') router.push('/analytics');
            if (key === 's' && userRole === 'admin') router.push('/settings');
          };
          window.addEventListener('keydown', nextKeyHandler, { once: true });
        }
      }
    };

    const handleCustomToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-command-palette', handleCustomToggle);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-palette', handleCustomToggle);
    };
  }, [isOpen, router, userRole]);

  const commands: CommandItem[] = [
    {
      id: 'nav-dash',
      title: 'Go to Dashboard',
      category: 'Navigation',
      shortcut: 'G D',
      icon: LayoutDashboard,
      action: () => router.push('/dashboard'),
    },
    {
      id: 'nav-orders',
      title: 'Go to Orders Fulfillment',
      category: 'Navigation',
      shortcut: 'G O',
      icon: ShoppingBag,
      action: () => router.push('/orders'),
    },
    ...(userRole === 'admin'
      ? [
          {
            id: 'nav-products',
            title: 'Go to Products Catalog',
            category: 'Navigation' as const,
            shortcut: 'G P',
            icon: Shirt,
            action: () => router.push('/products'),
          },
          {
            id: 'act-new-prod',
            title: 'Create New Product',
            category: 'Quick Actions' as const,
            shortcut: 'N P',
            icon: Plus,
            action: () => router.push('/products/new'),
          },
        ]
      : []),
    {
      id: 'nav-inventory',
      title: 'Go to Inventory Matrix',
      category: 'Navigation',
      shortcut: 'G I',
      icon: Boxes,
      action: () => router.push('/inventory'),
    },
    {
      id: 'nav-customers',
      title: 'Go to Customers Directory',
      category: 'Navigation',
      shortcut: 'G C',
      icon: Users,
      action: () => router.push('/customers'),
    },
    ...(userRole === 'admin'
      ? [
          {
            id: 'nav-discounts',
            title: 'Go to Discounts & Promo Codes',
            category: 'Navigation' as const,
            shortcut: 'G X',
            icon: TicketPercent,
            action: () => router.push('/discounts'),
          },
        ]
      : []),
    {
      id: 'nav-analytics',
      title: 'Go to Analytics & Telemetry',
      category: 'Navigation',
      shortcut: 'G A',
      icon: TrendingUp,
      action: () => router.push('/analytics'),
    },
    ...(userRole === 'admin'
      ? [
          {
            id: 'nav-settings',
            title: 'Go to Store Settings & Staff',
            category: 'Navigation' as const,
            shortcut: 'G S',
            icon: Settings,
            action: () => router.push('/settings'),
          },
        ]
      : []),
    {
      id: 'act-sync',
      title: 'Force Reload & Sync Cache',
      category: 'Operations',
      icon: RefreshCw,
      action: () => window.location.reload(),
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-[#2A2A2A] bg-[#121212] shadow-2xl shadow-black overflow-hidden">
        {/* Search Input */}
        <div className="relative flex items-center px-3 border-b border-[#202020] bg-[#161616]">
          <Search className="w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to screen..."
            className="w-full h-11 px-3 text-xs bg-transparent text-[#F5F1E8] placeholder:text-[#666666] outline-none font-mono"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-[#8A8A8A] hover:text-[#F5F1E8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#181818]">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-[#1A1A1A] group transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#1C1C1C] group-hover:bg-[#C6FF00]/10 border border-[#282828] flex items-center justify-center text-[#8A8A8A] group-hover:text-[#C6FF00] transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#F5F1E8] group-hover:text-white">
                        {cmd.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#666666]">
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1E1E1E] rounded border border-[#2A2A2A] text-[#8A8A8A]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className="w-3 h-3 text-[#444444] group-hover:text-[#C6FF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs font-mono text-[#8A8A8A]">
              NO MATCHING COMMANDS
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 border-t border-[#1C1C1C] bg-[#0E0E0E] flex items-center justify-between text-[10px] font-mono text-[#666666]">
          <span>Navigate with arrows or shortcuts</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}

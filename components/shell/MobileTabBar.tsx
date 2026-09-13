'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  Bell,
  Menu,
  Plus,
  QrCode,
  TicketPercent,
  Search,
  X,
  Boxes,
  Users,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface MobileTabBarProps {
  userRole?: 'admin' | 'staff';
}

export function MobileTabBar({ userRole = 'admin' }: MobileTabBarProps) {
  const pathname = usePathname();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const tabs = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Products', href: '/products', icon: Shirt, adminOnly: true },
    { label: 'Alerts', href: '/dashboard#alerts', icon: Bell },
    { label: 'More', href: '#more', icon: Menu, isAction: true },
  ];

  const visibleTabs = tabs.filter((t) => !t.adminOnly || userRole === 'admin');

  return (
    <>
      {/* Floating Action Button (Quick Ops) */}
      <div className="lg:hidden fixed right-4 bottom-20 z-40">
        {isFabOpen && (
          <div className="absolute bottom-14 right-0 w-48 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in duration-150">
            {userRole === 'admin' && (
              <Link
                href="/products/new"
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#F5F1E8] hover:bg-[#1E1E1E] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#C6FF00]" />
                <span>Add Product</span>
              </Link>
            )}
            <Link
              href="/inventory"
              onClick={() => setIsFabOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-[#F5F1E8] hover:bg-[#1E1E1E] rounded-lg transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>Scan Barcode</span>
            </Link>
            {userRole === 'admin' && (
              <Link
                href="/discounts"
                onClick={() => setIsFabOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#F5F1E8] hover:bg-[#1E1E1E] rounded-lg transition-colors"
              >
                <TicketPercent className="w-3.5 h-3.5 text-[#C6FF00]" />
                <span>New Promo</span>
              </Link>
            )}
            <button
              onClick={() => {
                setIsFabOpen(false);
                window.dispatchEvent(new CustomEvent('toggle-command-palette'));
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F5F1E8] hover:bg-[#1E1E1E] rounded-lg transition-colors text-left"
            >
              <Search className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>Search Anything</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-12 h-12 rounded-full bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] shadow-xl shadow-black/80 flex items-center justify-center transition-all duration-150 active:scale-95"
          aria-label="Quick Actions"
        >
          {isFabOpen ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* More Navigation Drawer Modal for Mobile */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 flex flex-col justify-end">
          <div className="bg-[#121212] border-t border-[#262626] rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
                EXTENDED MENU
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-md text-[#8A8A8A] hover:text-[#F5F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/inventory"
                onClick={() => setIsMoreOpen(false)}
                className="p-3 bg-[#181818] border border-[#222222] rounded-xl flex items-center gap-3 text-xs font-medium text-[#F5F1E8]"
              >
                <Boxes className="w-4 h-4 text-[#C6FF00]" />
                Inventory
              </Link>
              <Link
                href="/customers"
                onClick={() => setIsMoreOpen(false)}
                className="p-3 bg-[#181818] border border-[#222222] rounded-xl flex items-center gap-3 text-xs font-medium text-[#F5F1E8]"
              >
                <Users className="w-4 h-4 text-[#C6FF00]" />
                Customers
              </Link>
              <Link
                href="/analytics"
                onClick={() => setIsMoreOpen(false)}
                className="p-3 bg-[#181818] border border-[#222222] rounded-xl flex items-center gap-3 text-xs font-medium text-[#F5F1E8]"
              >
                <TrendingUp className="w-4 h-4 text-[#C6FF00]" />
                Analytics
              </Link>
              {userRole === 'admin' && (
                <Link
                  href="/discounts"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 bg-[#181818] border border-[#222222] rounded-xl flex items-center gap-3 text-xs font-medium text-[#F5F1E8]"
                >
                  <TicketPercent className="w-4 h-4 text-[#C6FF00]" />
                  Discounts
                </Link>
              )}
              {userRole === 'admin' && (
                <Link
                  href="/settings"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-3 bg-[#181818] border border-[#222222] rounded-xl flex items-center gap-3 text-xs font-medium text-[#F5F1E8] col-span-2"
                >
                  <Settings className="w-4 h-4 text-[#C6FF00]" />
                  Store Settings & Staff Permissions
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-[#1F1F1F] px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href !== '#more' && (pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href)));

            if (tab.isAction) {
              return (
                <button
                  key={tab.label}
                  onClick={() => setIsMoreOpen(true)}
                  className="flex flex-col items-center justify-center py-1 px-3 text-[#8A8A8A] active:text-[#F5F1E8] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium tracking-tight mt-1">{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                  isActive ? 'text-[#C6FF00]' : 'text-[#8A8A8A] active:text-[#F5F1E8]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-tight mt-1">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Users,
  Boxes,
  TicketPercent,
  TrendingUp,
  Settings,
  Command,
} from 'lucide-react';

interface DesktopSidebarProps {
  userRole?: 'admin' | 'staff';
  userEmail?: string;
  userName?: string;
}

export function DesktopSidebar({
  userRole = 'admin',
  userEmail = 'admin@menance.store',
  userName = 'Admin',
}: DesktopSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: 'G D' },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, shortcut: 'G O' },
    { label: 'Products', href: '/products', icon: Shirt, shortcut: 'G P', adminOnly: true },
    { label: 'Customers', href: '/customers', icon: Users, shortcut: 'G C' },
    { label: 'Inventory', href: '/inventory', icon: Boxes, shortcut: 'G I' },
    { label: 'Discounts', href: '/discounts', icon: TicketPercent, shortcut: 'G X', adminOnly: true },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp, shortcut: 'G A' },
    { label: 'Settings', href: '/settings', icon: Settings, shortcut: 'G S', adminOnly: true },
  ];

  const visibleNav = navItems.filter((item) => !item.adminOnly || userRole === 'admin');

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-[#202020] bg-[#0E0E0E] h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#1C1C1C]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#C6FF00] flex items-center justify-center font-black text-black text-sm tracking-tighter">
            M
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-[#F5F1E8]">MENANCE</div>
            <div className="text-[10px] font-mono tracking-widest text-[#8A8A8A] uppercase">
              CONSOLE // {userRole}
            </div>
          </div>
        </Link>
        <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-pulse" title="System Online" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#666666]">
          OPERATIONS
        </div>
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#C6FF00] text-[#0A0A0A] font-semibold shadow-sm shadow-[#C6FF00]/10'
                  : 'text-[#8A8A8A] hover:text-[#F5F1E8] hover:bg-[#161616]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#0A0A0A]' : 'text-[#8A8A8A] group-hover:text-[#F5F1E8]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isActive ? 'text-black/60 font-semibold' : 'text-[#444444] group-hover:text-[#666666]'
                }`}
              >
                {item.shortcut}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Cmd+K Bar */}
      <div className="p-3 border-t border-[#1C1C1C]">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('toggle-command-palette'));
          }}
          className="w-full h-8 px-2.5 bg-[#141414] hover:bg-[#1B1B1B] border border-[#222222] rounded-lg text-xs font-mono text-[#8A8A8A] hover:text-[#F5F1E8] flex items-center justify-between transition-all duration-150"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Command className="w-3 h-3 text-[#C6FF00]" />
            Quick Command
          </span>
          <kbd className="text-[10px] px-1 py-0.5 bg-[#202020] rounded border border-[#2A2A2A] text-[#8A8A8A]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Operator Footer Profile */}
      <div className="p-3 border-t border-[#1C1C1C] bg-[#0A0A0A] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-7 h-7 rounded border border-[#2A2A2A]',
              },
            }}
          />
          <div className="overflow-hidden">
            <div className="text-xs font-medium text-[#F5F1E8] truncate">{userName}</div>
            <div className="text-[10px] font-mono text-[#8A8A8A] truncate">{userEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

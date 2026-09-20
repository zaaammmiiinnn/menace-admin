import React from 'react';
import { getAdminUser } from '@/lib/auth/roles';
import { DesktopSidebar } from '@/components/shell/DesktopSidebar';
import { MobileTabBar } from '@/components/shell/MobileTabBar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { AdminHeaderBar } from '@/components/shell/AdminHeaderBar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();
  const role = adminUser?.role === 'staff' ? 'staff' : 'admin';
  const email = adminUser?.email || 'admin@menance.store';
  const name = adminUser?.name || 'Administrator';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar (Fixed left) */}
      <DesktopSidebar userRole={role} userEmail={email} userName={name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Global Topbar with Sync & Status Telemetry */}
        <AdminHeaderBar userRole={role} userName={name} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Tab Bar (Fixed bottom) */}
      <MobileTabBar userRole={role} />

      {/* Global Cmd+K Command Palette */}
      <CommandPalette userRole={role} />
    </div>
  );
}

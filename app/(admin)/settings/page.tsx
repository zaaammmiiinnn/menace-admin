import React from 'react';
import { getSettings, getAuditLogs } from '@/lib/admin/queries';
import { SettingsClient } from '@/components/settings/SettingsClient';
import { Settings } from 'lucide-react';

export const metadata = {
  title: 'Settings & Staff Roles',
  description: 'Manage store configuration, shipping thresholds, and operator RBAC permissions',
};

export default async function SettingsPage() {
  const settings = await getSettings();
  const auditLogs = await getAuditLogs(40);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#C6FF00]" />
            SETTINGS & RBAC PERMISSIONS
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            STORE CONFIG // STAFF ACCESS // AUDIT TRAIL
          </p>
        </div>
      </div>

      <SettingsClient initialSettings={settings} initialAuditLogs={auditLogs} />
    </div>
  );
}

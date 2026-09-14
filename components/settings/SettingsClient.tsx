'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  UserPlus,
  Trash2,
  FileClock,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  updateStoreSettingsAction,
  updateStaffRoleAction,
  removeStaffRoleAction,
} from '@/lib/admin/actions';
import { toast } from 'sonner';

interface SettingsClientProps {
  initialSettings: Record<string, string>;
  initialAuditLogs: any[];
}

export function SettingsClient({ initialSettings, initialAuditLogs }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [isSaving, setIsSaving] = useState(false);

  // Staff roles parsed
  const [staffList, setStaffList] = useState<any[]>(() => {
    try {
      return settings.staff_roles ? JSON.parse(settings.staff_roles) : [];
    } catch {
      return [];
    }
  });

  // New staff form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'staff' | 'admin'>('staff');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStoreSettingsAction(settings);
      toast.success('Store settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const res = await updateStaffRoleAction(newEmail, newRole, newName || newEmail.split('@')[0]);
      setStaffList(res.list);
      setNewEmail('');
      setNewName('');
      toast.success(`Assigned role "${newRole.toUpperCase()}" to ${newEmail}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign staff role');
    }
  };

  const handleRemoveStaff = async (email: string) => {
    try {
      await removeStaffRoleAction(email);
      setStaffList((prev) => prev.filter((m) => m.email.toLowerCase() !== email.toLowerCase()));
      toast.success(`Removed permissions for ${email}`);
    } catch (err: any) {
      toast.error('Failed to revoke staff role');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Store Parameters Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
          <div>
            <h2 className="text-sm font-bold text-[#F5F1E8] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#C6FF00]" />
              BRAND & COMMERCE PARAMETERS
            </h2>
            <p className="text-xs text-[#8A8A8A]">
              Shared variables synced across Cloudflare D1
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="h-8 px-3.5 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Parameters'}
          </button>
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#121212] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F1E8]">Store Name</label>
            <input
              type="text"
              value={settings.store_name || 'MENANCE'}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F1E8]">Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline || 'Not for everyone.'}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs text-[#F5F1E8] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F1E8]">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={settings.free_shipping_threshold || '2999'}
              onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
              className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F1E8]">Standard Shipping Rate (₹)</label>
            <input
              type="number"
              value={settings.standard_shipping_rate || '149'}
              onChange={(e) => setSettings({ ...settings, standard_shipping_rate: e.target.value })}
              className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F1E8]">GST Percentage (%)</label>
            <input
              type="number"
              value={settings.gst_percentage || '18'}
              onChange={(e) => setSettings({ ...settings, gst_percentage: e.target.value })}
              className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F5F1E8]">Base Currency</label>
            <input
              type="text"
              readOnly
              value={settings.primary_currency || 'INR'}
              className="w-full h-9 px-3 bg-[#161616] border border-[#262626] rounded-lg text-xs font-mono text-[#8A8A8A] outline-none cursor-not-allowed"
            />
          </div>
        </div>
      </form>

      {/* Staff Roles RBAC Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
          <div>
            <h2 className="text-sm font-bold text-[#F5F1E8] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C6FF00]" />
              STAFF ROLES & OPERATOR PERMISSIONS
            </h2>
            <p className="text-xs text-[#8A8A8A]">
              Role matrix: Admin (full mutations) vs Staff (dispatch & customers read-only)
            </p>
          </div>
        </div>

        {/* Add Staff Form */}
        <form onSubmit={handleAddStaff} className="rounded-xl border border-[#222222] bg-[#121212] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="email"
            required
            placeholder="operator@menance.store"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full sm:w-36 h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
          />
          <select
            value={newRole}
            onChange={(e: any) => setNewRole(e.target.value)}
            className="w-full sm:w-28 h-9 px-2 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="h-9 px-4 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Operator
          </button>
        </form>

        {/* Existing Staff List */}
        <div className="rounded-xl border border-[#222222] bg-[#121212] divide-y divide-[#1D1D1D] overflow-hidden">
          {staffList.map((member: any) => (
            <div key={member.email} className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F5F1E8] flex items-center gap-2">
                  <span>{member.name || member.email.split('@')[0]}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded ${
                      member.role === 'admin'
                        ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                        : 'bg-[#222222] text-[#8A8A8A]'
                    }`}
                  >
                    {member.role.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#8A8A8A]">{member.email}</div>
              </div>

              <button
                onClick={() => handleRemoveStaff(member.email)}
                className="p-1.5 rounded hover:bg-rose-500/10 text-[#8A8A8A] hover:text-rose-400 transition-colors"
                title="Revoke Role"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Telemetry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
          <div>
            <h2 className="text-sm font-bold text-[#F5F1E8] flex items-center gap-2">
              <FileClock className="w-4 h-4 text-[#C6FF00]" />
              SYSTEM AUDIT LOG
            </h2>
            <p className="text-xs text-[#8A8A8A]">
              Immutable record of all mutations, inventory adjustments, and status transitions
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#121212] divide-y divide-[#1A1A1A] max-h-72 overflow-y-auto">
          {auditLogs.map((log: any) => (
            <div key={log.id} className="p-3 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#C6FF00]">
                    {log.action}
                  </span>
                  <span className="font-mono text-[11px] text-[#8A8A8A]">
                    {log.user_email || 'system'}
                  </span>
                </div>
                <p className="text-xs text-[#F5F1E8]">{log.details}</p>
              </div>

              <div className="font-mono text-[10px] text-[#666666] whitespace-nowrap">
                {new Date(log.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

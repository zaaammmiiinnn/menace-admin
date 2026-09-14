'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  TicketPercent,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import {
  createDiscountAction,
  toggleDiscountActiveAction,
  deleteDiscountAction,
} from '@/lib/admin/actions';
import { toast } from 'sonner';

interface DiscountsClientProps {
  initialDiscounts: any[];
}

export function DiscountsClient({ initialDiscounts }: DiscountsClientProps) {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(15);
  const [minOrder, setMinOrder] = useState(1499);
  const [maxUses, setMaxUses] = useState(250);

  const handleToggleActive = async (id: string) => {
    try {
      const res = await toggleDiscountActiveAction(id);
      setDiscounts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, active: res.active ? 1 : 0 } : d))
      );
      toast.success('Promo code status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update promo');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Promo code required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await createDiscountAction({
        code,
        type,
        value,
        minOrder,
        maxUses,
      });
      setDiscounts((prev) => [
        {
          id: res.id,
          code: code.toUpperCase(),
          type,
          value,
          min_order: minOrder,
          max_uses: maxUses,
          uses: 0,
          active: 1,
        },
        ...prev,
      ]);
      toast.success(`Discount code "${code.toUpperCase()}" created.`);
      setIsModalOpen(false);
      setCode('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDiscountAction(deleteTarget.id);
      setDiscounts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(`Promo code "${deleteTarget.code}" deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'code',
      header: 'COUPON CODE',
      cell: ({ row }) => (
        <div className="font-mono font-bold text-xs text-[#F5F1E8] flex items-center gap-2">
          <TicketPercent className="w-3.5 h-3.5 text-[#C6FF00]" />
          <span>{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'value',
      header: 'DISCOUNT',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-[#C6FF00] tabular-nums">
          {row.original.type === 'percentage'
            ? `${row.original.value}% OFF`
            : `₹${row.original.value} OFF`}
        </span>
      ),
    },
    {
      accessorKey: 'min_order',
      header: 'MIN ORDER',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#8A8A8A] tabular-nums">
          ₹{row.original.min_order?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      accessorKey: 'uses',
      header: 'REDEMPTIONS',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-[#F5F1E8] tabular-nums">
          {row.original.uses || 0}
          <span className="text-[#666666]"> / {row.original.max_uses || '∞'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'active',
      header: 'STATUS',
      cell: ({ row }) => {
        const isActive = Boolean(row.original.active);
        return (
          <button
            onClick={() => handleToggleActive(row.original.id)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
              isActive
                ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                : 'bg-[#222222] text-[#8A8A8A]'
            }`}
          >
            {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isActive ? 'ACTIVE' : 'DISABLED'}
          </button>
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <button
          onClick={() => setDeleteTarget(row.original)}
          className="p-1.5 rounded hover:bg-rose-500/10 text-[#8A8A8A] hover:text-rose-400 transition-colors"
          title="Delete Promo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={discounts}
        searchPlaceholder="Filter promo codes..."
        toolbarRight={
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            New Promo Code
          </button>
        }
      />

      {/* New Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl border border-[#262626] bg-[#121212] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5F1E8]">
                <TicketPercent className="w-4 h-4 text-[#C6FF00]" />
                CREATE PROMOTIONAL CODE
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A8A8A] hover:text-[#F5F1E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F1E8]">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MENANCE20"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#282828] focus:border-[#C6FF00] rounded-lg text-xs font-mono uppercase text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#F5F1E8]">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full h-9 px-2 bg-[#181818] border border-[#282828] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed INR (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#F5F1E8]">
                    {type === 'percentage' ? 'Percentage Off (%)' : 'Fixed Value (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#181818] border border-[#282828] focus:border-[#C6FF00] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#F5F1E8]">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#181818] border border-[#282828] focus:border-[#C6FF00] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#F5F1E8]">Max Uses</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#181818] border border-[#282828] focus:border-[#C6FF00] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202020]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 text-xs font-medium text-[#8A8A8A] hover:text-[#F5F1E8] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-8 px-4 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-bold text-xs rounded-md transition-all"
                >
                  {isSaving ? 'Creating...' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete promo code "${deleteTarget?.code}"?`}
        description="This coupon will be immediately revoked from the storefront checkout."
        confirmText="Delete Code"
        isDestructive={true}
      />
    </div>
  );
}

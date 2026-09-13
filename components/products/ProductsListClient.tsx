'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Shirt,
  CheckCircle2,
  Archive,
  FileText,
} from 'lucide-react';
import { toggleProductStatusAction, deleteProductAction } from '@/lib/admin/actions';
import { toast } from 'sonner';

interface ProductsListClientProps {
  initialProducts: any[];
}

export function ProductsListClient({ initialProducts }: ProductsListClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      await toggleProductStatusAction(id, nextStatus as any);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
      toast.success(`Product status updated to ${nextStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProductAction(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`Product "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'PRODUCT SILHOUETTE',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#C6FF00] flex-shrink-0">
            <Shirt className="w-4 h-4" />
          </div>
          <div>
            <Link
              href={`/products/${row.original.id}`}
              className="font-bold text-xs text-[#F5F1E8] hover:text-[#C6FF00] transition-colors flex items-center gap-1"
            >
              <span>{row.original.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
            </Link>
            <div className="text-[10px] font-mono text-[#8A8A8A]">
              /{row.original.slug} • {row.original.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'dropName',
      header: 'DROP',
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-[#8A8A8A]">
          {row.original.dropName || 'DROP 001'}
        </span>
      ),
    },
    {
      accessorKey: 'priceInr',
      header: 'PRICE',
      cell: ({ row }) => (
        <div className="font-mono text-xs tabular-nums text-[#F5F1E8]">
          ₹{row.original.priceInr.toLocaleString()}
          <span className="text-[10px] text-[#8A8A8A] ml-1">(${row.original.priceUsd})</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalStock',
      header: 'STOCK',
      cell: ({ row }) => {
        const stock = row.original.totalStock;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span
              className={`tabular-nums font-bold ${
                stock === 0
                  ? 'text-rose-400'
                  : stock < 15
                  ? 'text-amber-400'
                  : 'text-[#C6FF00]'
              }`}
            >
              {stock}
            </span>
            <span className="text-[10px] text-[#777777]">units</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <button
            onClick={() => handleToggleStatus(row.original.id, status)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
              status === 'active'
                ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20 hover:bg-[#C6FF00]/20'
                : status === 'draft'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-[#222222] text-[#8A8A8A] hover:bg-[#2A2A2A]'
            }`}
            title="Click to toggle status"
          >
            {status === 'active' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : status === 'draft' ? (
              <FileText className="w-3 h-3" />
            ) : (
              <Archive className="w-3 h-3" />
            )}
            {status.toUpperCase()}
          </button>
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${row.original.id}`}
            className="p-1.5 rounded hover:bg-[#1E1E1E] text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDeleteTarget(row.original)}
            className="p-1.5 rounded hover:bg-rose-500/10 text-[#8A8A8A] hover:text-rose-400 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search catalog by name, slug, drop..."
        toolbarRight={
          <Link
            href="/products/new"
            className="h-9 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all duration-150 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            New Silhouette
          </Link>
        }
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the product silhouette and all associated variant stock allocations from D1."
        confirmText="Delete Product"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { Truck, Package, Printer, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderTableProps {
  orders: any[];
  onPack: (id: string) => Promise<void> | void;
  onShip: (id: string) => Promise<void> | void;
}

export function OrderTable({ orders, onPack, onShip }: OrderTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'id',
      header: 'ORDER',
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          className="font-mono font-bold text-[#F5F1E8] hover:text-[#C6FF00] transition-colors flex items-center gap-1.5"
        >
          <span>{row.original.id}</span>
          <ExternalLink className="w-3 h-3 opacity-40 hover:opacity-100" />
        </Link>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'DATE',
      cell: ({ row }) => (
        <span className="text-[#8A8A8A] font-mono text-[11px]">
          {new Date(row.original.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'CUSTOMER',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#F5F1E8]">{row.original.customerName}</span>
          <span className="text-[11px] text-[#8A8A8A] truncate max-w-[160px]">
            {row.original.customerEmail}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'itemsCount',
      header: 'ITEMS',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#8A8A8A]">{row.original.itemsCount || 1} units</span>
      ),
    },
    {
      accessorKey: 'total_inr',
      header: 'TOTAL',
      cell: ({ row }) => (
        <span className="font-bold text-xs tabular-nums text-[#F5F1E8]">
          ₹{row.original.total_inr.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'delivered') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20">
              <CheckCircle2 className="w-3 h-3" /> DELIVERED
            </span>
          );
        }
        if (status === 'shipped') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Truck className="w-3 h-3" /> SHIPPED
            </span>
          );
        }
        if (status === 'paid') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Package className="w-3 h-3" /> PACKED
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PENDING
          </span>
        );
      },
    },
    {
      accessorKey: 'tracking_number',
      header: 'TRACKING',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#8A8A8A]">
          {row.original.tracking_number || '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {order.status === 'pending' && (
              <button
                onClick={() => onPack(order.id)}
                className="px-2 py-1 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold text-[11px] rounded transition-all"
                title="Mark as Packed"
              >
                Pack
              </button>
            )}

            {(order.status === 'paid' || order.status === 'pending') && (
              <button
                onClick={() => onShip(order.id)}
                className="px-2 py-1 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-sky-400 font-medium text-[11px] rounded transition-all"
                title="Mark as Shipped"
              >
                Ship
              </button>
            )}

            <button
              onClick={() => {
                toast.success(`Printing label for ${order.id}`);
                window.print();
              }}
              className="p-1 rounded hover:bg-[#202020] text-[#8A8A8A] hover:text-[#F5F1E8]"
              title="Print Shipping Label"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      searchPlaceholder="Filter orders by ID, customer, tracking..."
      pageSize={12}
    />
  );
}

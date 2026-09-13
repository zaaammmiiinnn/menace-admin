'use client';

import React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { ExternalLink, User, ShoppingBag } from 'lucide-react';

interface CustomersListClientProps {
  initialCustomers: any[];
}

export function CustomersListClient({ initialCustomers }: CustomersListClientProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'CUSTOMER',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#8A8A8A] flex-shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <Link
              href={`/customers/${row.original.id}`}
              className="font-bold text-xs text-[#F5F1E8] hover:text-[#C6FF00] transition-colors flex items-center gap-1"
            >
              <span>{row.original.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
            </Link>
            <div className="text-[11px] text-[#8A8A8A]">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'ordersCount',
      header: 'ORDERS',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums text-[#F5F1E8]">
          {row.original.ordersCount || 0} drops
        </span>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: 'LIFETIME SPEND',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs tabular-nums text-[#C6FF00]">
          ₹{row.original.totalSpent.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'MEMBER SINCE',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#8A8A8A]">
          {new Date(row.original.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <Link
          href={`/customers/${row.original.id}`}
          className="h-7 px-2.5 bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[#F5F1E8] hover:text-[#C6FF00] text-[11px] font-mono rounded flex items-center gap-1 w-fit transition-colors"
        >
          <ShoppingBag className="w-3 h-3" />
          Orders
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={initialCustomers}
      searchPlaceholder="Filter customers by name or email..."
    />
  );
}

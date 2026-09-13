'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Truck, Printer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderCardProps {
  order: any;
  onPack?: (orderId: string) => void;
  onShip?: (orderId: string) => void;
}

export function OrderCard({ order, onPack, onShip }: OrderCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20">
            <CheckCircle2 className="w-3 h-3" /> DELIVERED
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Truck className="w-3 h-3" /> SHIPPED
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Package className="w-3 h-3" /> PACKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PENDING
          </span>
        );
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `Shipping Label ${order.id}`,
        text: `Menace Shipping Label: Order ${order.id}\nCustomer: ${order.customerName}\nAddress: ${order.shipping_address}`,
      }).catch(() => {});
    } else {
      window.print();
    }
    toast.success(`Opening label print for ${order.id}`);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#F5F1E8] tracking-wider">
              {order.id}
            </span>
            {getStatusBadge(order.status)}
          </div>
          <div className="text-xs text-[#8A8A8A] mt-0.5 truncate">
            {order.customerName} • {order.customerEmail}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-extrabold tabular-nums text-[#F5F1E8]">
            ₹{order.total_inr.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-[#666666]">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Item Summary */}
      <div className="bg-[#171717] rounded-lg p-2.5 text-xs text-[#8A8A8A] space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[#A0A0A0]">
          <span>{order.itemsCount || 1} items</span>
          <span className="font-mono text-[#C6FF00]">
            {order.tracking_number ? `TRK: ${order.tracking_number}` : 'Awaiting dispatch'}
          </span>
        </div>
        <p className="text-xs text-[#F5F1E8] line-clamp-1">
          {order.items?.[0]?.productName || 'Menace Oversized Silhouette'}
          {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1C1C1C]">
        <div className="flex items-center gap-2">
          {order.status === 'pending' && onPack && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPack(order.id);
              }}
              className="h-7 px-2.5 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-semibold text-[11px] rounded-md transition-all flex items-center gap-1"
            >
              <Package className="w-3 h-3" />
              Pack
            </button>
          )}

          {(order.status === 'paid' || order.status === 'pending') && onShip && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShip(order.id);
              }}
              className="h-7 px-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-sky-400 font-medium text-[11px] rounded-md transition-all flex items-center gap-1"
            >
              <Truck className="w-3 h-3" />
              Ship
            </button>
          )}

          <button
            onClick={handlePrint}
            className="h-7 px-2.5 bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#8A8A8A] hover:text-[#F5F1E8] text-[11px] rounded-md transition-all flex items-center gap-1"
            title="Print Label"
          >
            <Printer className="w-3 h-3" />
            Label
          </button>
        </div>

        <Link
          href={`/orders/${order.id}`}
          className="text-[11px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8] flex items-center gap-1"
        >
          Inspect <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

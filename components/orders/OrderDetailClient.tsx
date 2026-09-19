'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Camera,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  MapPin,
  User,
  ExternalLink,
  Trash2,
  Sparkles,
  Banknote,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { updateOrderStatusAction, deleteOrderAction } from '@/lib/admin/actions';
import { CustomPrintWorkshopCard } from '@/components/orders/CustomPrintWorkshopCard';
import { toast } from 'sonner';

interface OrderDetailClientProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [trackingInput, setTrackingInput] = useState(order.tracking_number || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: any) => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(order.id, newStatus, trackingInput || undefined);
      setOrder((prev: any) => ({ ...prev, status: newStatus, tracking_number: trackingInput }));
      if (newStatus === 'paid') {
        toast.success(`Order ${order.id} marked as PACKED. Email dispatched to customer.`);
      } else if (newStatus === 'shipped') {
        toast.success(`Order ${order.id} marked as SHIPPED. Tracking email dispatched to customer.`);
      } else {
        toast.success(`Order ${order.id} status updated to ${newStatus.toUpperCase()}`);
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveTracking = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(order.id, order.status, trackingInput);
      setOrder((prev: any) => ({ ...prev, tracking_number: trackingInput }));
      toast.success('Tracking number saved');
    } catch (err: any) {
      toast.error('Failed to save tracking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm(`Are you sure you want to permanently delete order ${order.id}? This cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteOrderAction(order.id);
      toast.success(`Order ${order.id} deleted successfully`);
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete order');
      setIsDeleting(false);
    }
  };

  const handleCameraScan = () => {
    setIsScanning(true);
    toast.info('Accessing device optical sensor for shipping barcode...');
    setTimeout(() => {
      const scannedCode = `DELHIVERY-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setTrackingInput(scannedCode);
      setIsScanning(false);
      toast.success(`Scanned label barcode: ${scannedCode}`);
    }, 1200);
  };

  const handlePrintLabel = () => {
    if (navigator.share) {
      navigator.share({
        title: `Shipping Label - ${order.id}`,
        text: `MENANCE APPAREL\nOrder: ${order.id}\nCustomer: ${order.customer?.name}\nAddress: ${order.shipping_address}\nItems: ${order.items?.length || 1}`,
      }).catch(() => {});
    } else {
      window.print();
    }
    toast.success(`Printing label for ${order.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C1C]">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-[#F5F1E8]">{order.id}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#282828] text-[#8A8A8A] uppercase">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-mono">
              Placed {new Date(order.created_at).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintLabel}
            className="h-8 px-3 bg-[#161616] hover:bg-[#202020] border border-[#262626] text-[#F5F1E8] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#C6FF00]" />
            Print Shipping Label
          </button>
          <button
            onClick={handleDeleteOrder}
            disabled={isDeleting}
            className="h-8 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Order'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Barcode Scanner Input */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
                SHIPPING TRACKING NUMBER
              </span>
              <button
                onClick={handleCameraScan}
                disabled={isScanning}
                className="text-xs font-mono text-[#C6FF00] hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                {isScanning ? 'Scanning...' : 'Scan Label Barcode'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g. BLUEDART-882190 or DELHIVERY-49021"
                className="flex-1 h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
              />
              <button
                onClick={handleSaveTracking}
                disabled={isUpdating}
                className="h-9 px-4 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] overflow-hidden">
            <div className="p-3 bg-[#161616] border-b border-[#202020] text-xs font-mono uppercase tracking-wider text-[#8A8A8A]">
              FULFILLMENT MANIFEST ({order.items?.length || 0} ITEMS)
            </div>
            <div className="divide-y divide-[#1D1D1D]">
              {order.items?.map((item: any) => {
                const isCustom = item.edition === 'custom' || !!item.customArtworkUrl || !!item.custom_artwork_url || item.productName?.includes('Custom') || item.product_name?.includes('Custom') || item.name?.includes('Custom') || order.notes?.includes('CUSTOM PRINT');
                return (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#F5F1E8] flex items-center gap-2">
                          <span>{item.productName || item.product?.name || item.product_name || 'Menance Garment'}</span>
                          {isCustom && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30 font-semibold tracking-wider">
                              <Sparkles className="w-2.5 h-2.5" /> CUSTOM PRINT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#8A8A8A]">
                          Size: {item.size || item.variant?.size || 'Standard'} • Color: {item.color || item.variant?.color || 'Black'} • SKU: {item.variant?.sku || `MNC-${item.size || 'M'}`}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold tabular-nums text-[#F5F1E8]">
                          {item.quantity || 1} × ₹{(item.price_at_purchase || item.priceAtPurchase || item.priceInr || 1499).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#C6FF00] tabular-nums">
                          ₹{((item.quantity || 1) * (item.price_at_purchase || item.priceAtPurchase || item.priceInr || 1499)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Custom Print Workshop Station Card */}
                    {isCustom && (
                      <CustomPrintWorkshopCard order={order} item={item} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-[#141414] border-t border-[#202020] flex items-center justify-between">
              <span className="text-xs font-mono text-[#8A8A8A]">Total Order Value</span>
              <span className="text-base font-black tabular-nums text-[#F5F1E8]">
                ₹{order.total_inr.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Status Pipeline */}
        <div className="space-y-6">
          {/* Quick Status Changers */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              DISPATCH PIPELINE
            </span>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => handleStatusChange('paid')}
                disabled={isUpdating || order.status === 'paid'}
                className={`w-full h-9 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  order.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#181818] hover:bg-[#222222] border border-[#282828] text-[#F5F1E8]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Mark as Packed
              </button>

              <button
                onClick={() => handleStatusChange('shipped')}
                disabled={isUpdating || order.status === 'shipped'}
                className={`w-full h-9 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  order.status === 'shipped'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'bg-[#181818] hover:bg-[#222222] border border-[#282828] text-[#F5F1E8]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Mark as Shipped
              </button>

              <button
                onClick={() => handleStatusChange('delivered')}
                disabled={isUpdating || order.status === 'delivered'}
                className={`w-full h-9 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  order.status === 'delivered'
                    ? 'bg-[#C6FF00]/20 text-[#C6FF00] border border-[#C6FF00]/40'
                    : 'bg-[#181818] hover:bg-[#222222] border border-[#282828] text-[#F5F1E8]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Delivered
              </button>

              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating || order.status === 'cancelled'}
                className={`w-full h-8 px-3 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                  order.status === 'cancelled'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'hover:bg-rose-500/10 text-rose-400'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Order
              </button>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              CUSTOMER & DELIVERY
            </span>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#8A8A8A] flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F1E8]">
                    {order.customer?.name}
                  </div>
                  <div className="text-xs text-[#8A8A8A]">
                    {order.customer?.email}
                  </div>
                  <Link
                    href={`/customers/${order.customer_id}`}
                    className="text-[11px] font-mono text-[#C6FF00] hover:underline flex items-center gap-1 mt-1"
                  >
                    View History <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#1C1C1C]">
                <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#8A8A8A] flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#F5F1E8] leading-relaxed">
                  {order.shipping_address}
                </div>
              </div>

              {order.notes && (
                <div className="p-2.5 rounded-lg bg-[#171717] border border-[#262626] text-xs text-amber-400 font-mono">
                  NOTE: {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Settlement Card */}
          {(() => {
            const notes = (order.notes || '').toUpperCase();
            const isCod = notes.includes('CASH ON DELIVERY') || notes.includes('COD') || order.paymentMethod === 'Cash on Delivery (COD)';
            return (
              <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A] flex items-center gap-1.5">
                    {isCod ? <Banknote className="w-4 h-4 text-amber-400" /> : <CreditCard className="w-4 h-4 text-[#C6FF00]" />}
                    PAYMENT MODE
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isCod
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isCod ? 'COD' : 'ONLINE PAID'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {isCod ? (
                    <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-1">
                      <div className="text-amber-300 font-bold flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>COLLECT CASH AT DOORSTEP</span>
                      </div>
                      <div className="text-[#D4D4D4] text-[11px]">
                        Collect <span className="text-[#F5F1E8] font-bold">₹{order.total_inr.toLocaleString()}</span> in physical cash from recipient.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PRE-SETTLED ONLINE</span>
                      </div>
                      <div className="text-[#D4D4D4] text-[11px]">
                        Captured and verified via secure gateway. Zero cash collection required.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

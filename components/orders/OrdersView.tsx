'use client';

import React, { useState } from 'react';
import { OrderTable } from './OrderTable';
import { OrderCard } from './OrderCard';
import { SwipeableOrderRow } from './SwipeableOrderRow';
import { markOrderPackedAction, markOrderShippedAction } from '@/lib/admin/actions';
import { toast } from 'sonner';

interface OrdersViewProps {
  initialOrders: any[];
}

export function OrdersView({ initialOrders }: OrdersViewProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter((o) => o.status === 'pending').length },
    { id: 'paid', label: 'Packed', count: orders.filter((o) => o.status === 'paid').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter((o) => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
  ];

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const handlePack = async (orderId: string) => {
    try {
      await markOrderPackedAction(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o))
      );
      toast.success(`Order ${orderId} marked as PACKED. Email dispatched to customer.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order');
    }
  };

  const handleShip = async (orderId: string) => {
    try {
      const sampleTracking = `BLUEDART-${Math.floor(100000 + Math.random() * 900000)}`;
      await markOrderShippedAction(orderId, sampleTracking);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'shipped', tracking_number: sampleTracking } : o))
      );
      toast.success(`Order ${orderId} marked as SHIPPED. Tracking email dispatched.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1C1C1C] hide-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
              filter === tab.id
                ? 'bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-sm shadow-[#C6FF00]/10'
                : 'text-[#8A8A8A] hover:text-[#F5F1E8] hover:bg-[#141414]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filter === tab.id ? 'bg-black/20 text-black' : 'bg-[#1E1E1E] text-[#777777]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop Dense Table View (>= 1024px) */}
      <div className="hidden lg:block">
        <OrderTable
          orders={filteredOrders}
          onPack={handlePack}
          onShip={handleShip}
        />
      </div>

      {/* Mobile Swipe Gestures Card View (< 1024px) */}
      <div className="lg:hidden space-y-3">
        <div className="text-[11px] font-mono text-[#777777] flex items-center justify-between px-1">
          <span>SWIPE RIGHT: PACK</span>
          <span>SWIPE LEFT: SHIP</span>
        </div>

        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <SwipeableOrderRow
              key={order.id}
              orderId={order.id}
              onSwipeRight={handlePack}
              onSwipeLeft={handleShip}
            >
              <OrderCard
                order={order}
                onPack={handlePack}
                onShip={handleShip}
              />
            </SwipeableOrderRow>
          ))
        ) : (
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-8 text-center text-xs font-mono text-[#8A8A8A]">
            NO ORDERS IN THIS STAGE
          </div>
        )}
      </div>
    </div>
  );
}

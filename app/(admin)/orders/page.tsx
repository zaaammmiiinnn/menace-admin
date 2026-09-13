import React from 'react';
import { getOrders } from '@/lib/admin/queries';
import { OrdersView } from '@/components/orders/OrdersView';
import { ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Orders & Fulfillment',
  description: 'Manage order packaging, dispatch, shipping labels, and tracking',
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C6FF00]" />
            ORDER FULFILLMENT
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            RAPID DISPATCH // PACK & SHIP OPERATIONS
          </p>
        </div>
      </div>

      {/* Orders View */}
      <OrdersView initialOrders={orders} />
    </div>
  );
}

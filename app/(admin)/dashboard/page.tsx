import React from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/admin/queries';
import { StatCard } from '@/components/common/StatCard';
import { PushPrompt } from '@/components/common/PushPrompt';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { OrderCard } from '@/components/orders/OrderCard';
import { SwipeableOrderRow } from '@/components/orders/SwipeableOrderRow';
import { markOrderPackedAction, markOrderShippedAction } from '@/lib/admin/actions';
import {
  DollarSign,
  ShoppingBag,
  Percent,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Shirt,
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard',
  description: 'Real-time telemetry and order dispatch console for MENANCE apparel',
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8]">
            OPERATIONS COCKPIT
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            DROP 001 // LIVE TELEMETRY // REAL-TIME DISPATCH
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="h-8 px-3 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all duration-150"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Dispatch Queue
          </Link>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Revenue Today"
          value={`₹${stats.revenueToday.toLocaleString()}`}
          trend={stats.revenueTrend}
          trendLabel="vs yesterday"
          icon={<DollarSign className="w-4 h-4 text-[#C6FF00]" />}
          highlight={true}
        />
        <StatCard
          title="Orders Today"
          value={stats.ordersToday}
          trend={stats.ordersTrend}
          trendLabel="vs drop avg"
          icon={<ShoppingBag className="w-4 h-4 text-[#F5F1E8]" />}
        />
        <StatCard
          title="Conversion"
          value={`${stats.conversionRate}%`}
          trend={stats.conversionTrend}
          trendLabel="checkout rate"
          icon={<Percent className="w-4 h-4 text-[#8A8A8A]" />}
        />
        <StatCard
          title="Low Stock Warning"
          value={stats.lowStockCount}
          subtitle="variants < 10"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Push Notification & PWA Telemetry Prompt */}
      <div className="w-full" id="alerts">
        <PushPrompt />
      </div>

      {/* Charts (Revenue Velocity & Orders Breakdown) */}
      <DashboardCharts
        revenueChart={stats.revenueChart}
        ordersByStatus={stats.ordersByStatus}
      />

      {/* Bottom Section: Urgent Dispatch Queue & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Orders to Pack/Ship */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-sm font-bold tracking-tight text-[#F5F1E8]">
                AWAITING DISPATCH ({stats.recentOrders.length})
              </h2>
            </div>
            <Link
              href="/orders"
              className="text-xs font-mono text-[#C6FF00] hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Desktop Table View / Mobile Gesture Cards View */}
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 4).map((order) => (
              <SwipeableOrderRow
                key={order.id}
                orderId={order.id}
                onSwipeRight={async (id) => {
                  'use server';
                  await markOrderPackedAction(id);
                }}
                onSwipeLeft={async (id) => {
                  'use server';
                  await markOrderShippedAction(id);
                }}
              >
                <OrderCard
                  order={order}
                  onPack={async (id) => {
                    'use server';
                    await markOrderPackedAction(id);
                  }}
                  onShip={async (id) => {
                    'use server';
                    await markOrderShippedAction(id);
                  }}
                />
              </SwipeableOrderRow>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Top Performing Silhouettes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6FF00]" />
              <h2 className="text-sm font-bold tracking-tight text-[#F5F1E8]">
                BESTSELLERS
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono text-[#8A8A8A] hover:text-[#F5F1E8]"
            >
              Catalog
            </Link>
          </div>

          <div className="rounded-xl border border-[#222222] bg-[#121212] divide-y divide-[#1B1B1B] overflow-hidden">
            {stats.topProducts.map((p, index) => (
              <div
                key={p.sku}
                className="p-3.5 flex items-center justify-between hover:bg-[#161616] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center font-mono text-xs font-bold text-[#C6FF00]">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F1E8] line-clamp-1">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#8A8A8A]">
                      {p.sku} • {p.units} units
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold tabular-nums text-[#F5F1E8]">
                    ₹{p.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Barcode Scan Card */}
          <div className="rounded-xl border border-[#C6FF00]/30 bg-[#151908] p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#F5F1E8]">Physical Inventory Audit?</div>
              <div className="text-[11px] text-[#A0A0A0]">
                Scan barcodes directly from mobile camera or barcode gun
              </div>
            </div>
            <Link
              href="/inventory"
              className="h-8 px-3 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ml-3"
            >
              Scan Stock
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

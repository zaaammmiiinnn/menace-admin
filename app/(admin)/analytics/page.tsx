import React from 'react';
import { getDashboardStats } from '@/lib/admin/queries';
import { StatCard } from '@/components/common/StatCard';
import { AnalyticsChartsClient } from '@/components/analytics/AnalyticsChartsClient';
import { TrendingUp, DollarSign, ShoppingBag, Eye, Zap } from 'lucide-react';

export const metadata = {
  title: 'Analytics & Telemetry',
  description: 'Drop 001 sell-through, size distribution, and revenue curves',
};

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-[#C6FF00]" />
            ANALYTICS & TELEMETRY
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            DROP 001 DATA // AOV // CONVERSION FUNNEL
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Avg Order Value"
          value="₹2,149"
          trend={8.2}
          trendLabel="vs target"
          icon={<DollarSign className="w-4 h-4 text-[#C6FF00]" />}
          highlight={true}
        />
        <StatCard
          title="Sell-Through Rate"
          value="74.6%"
          trend={14.1}
          trendLabel="Drop 001"
          icon={<Zap className="w-4 h-4 text-[#F5F1E8]" />}
        />
        <StatCard
          title="Return Rate"
          value="1.8%"
          trend={-0.4}
          trendLabel="industry 6%"
          icon={<ShoppingBag className="w-4 h-4 text-[#8A8A8A]" />}
        />
        <StatCard
          title="Storefront Sessions"
          value="24.8k"
          trend={22.5}
          trendLabel="peak drop hour"
          icon={<Eye className="w-4 h-4 text-[#F5F1E8]" />}
        />
      </div>

      {/* Charts */}
      <AnalyticsChartsClient stats={stats} />
    </div>
  );
}

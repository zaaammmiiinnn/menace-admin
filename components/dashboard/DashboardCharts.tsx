'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardChartsProps {
  revenueChart: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { name: string; value: number; color: string }[];
}

export function DashboardCharts({ revenueChart, ordersByStatus }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 30-Day Revenue & Volume Curve */}
      <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              TELEMETRY // REVENUE & DEMAND
            </h3>
            <p className="text-sm font-bold text-[#F5F1E8]">Drop 001 Velocity Curve</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF00]" />
            <span className="text-[11px] font-mono text-[#8A8A8A]">Gross (INR)</span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="menaceRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6FF00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#444444"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#444444"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  borderColor: '#262626',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#F5F1E8',
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C6FF00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#menaceRevenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders By Status Distribution */}
      <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
            PIPELINE // FULFILLMENT RATIO
          </h3>
          <p className="text-sm font-bold text-[#F5F1E8]">Order Status Breakdown</p>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#121212" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {ordersByStatus.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#8A8A8A] text-[11px] truncate">{item.name}:</span>
              <span className="text-[#F5F1E8] font-bold tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

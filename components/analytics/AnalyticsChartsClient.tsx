'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface AnalyticsChartsClientProps {
  stats: any;
}

export function AnalyticsChartsClient({ stats }: AnalyticsChartsClientProps) {
  const sizeDistribution = [
    { size: 'XS', units: 14, fill: '#444444' },
    { size: 'S', units: 48, fill: '#666666' },
    { size: 'M', units: 182, fill: '#C6FF00' },
    { size: 'L', units: 145, fill: '#A3D900' },
    { size: 'XL', units: 76, fill: '#80B300' },
    { size: '2XL', units: 28, fill: '#5C8C00' },
    { size: '3XL', units: 12, fill: '#3E6100' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Volume Telemetry */}
      <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              DISPATCH VELOCITY
            </h3>
            <p className="text-sm font-bold text-[#F5F1E8]">Daily Order Volume (30D)</p>
          </div>
          <span className="text-xs font-mono text-[#C6FF00]">Drop 001 Cohort</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#444444" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#444444" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  borderColor: '#262626',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#F5F1E8',
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#C6FF00"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Size Distribution */}
      <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              SILHOUETTE SIZING RATIO
            </h3>
            <p className="text-sm font-bold text-[#F5F1E8]">Units Purchased by Size</p>
          </div>
          <span className="text-xs font-mono text-[#8A8A8A]">M & L = 68%</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sizeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="size" stroke="#444444" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#444444" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  borderColor: '#262626',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#F5F1E8',
                }}
              />
              <Bar dataKey="units" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

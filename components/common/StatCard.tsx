import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs last drop',
  icon,
  highlight = false,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-150 ${
        highlight
          ? 'bg-[#14180A] border-[#C6FF00]/30 shadow-lg shadow-[#C6FF00]/5'
          : 'bg-[#121212] border-[#222222] hover:border-[#2E2E2E]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-[#8A8A8A]">
          {title}
        </span>
        {icon && (
          <div className="text-[#8A8A8A] w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-[#F5F1E8]">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-[#8A8A8A] font-mono">{subtitle}</span>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-mono">
          <div
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
              isPositive
                ? 'bg-[#C6FF00]/10 text-[#C6FF00]'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-[#222222] text-[#8A8A8A]'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : isNegative ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span className="tabular-nums">
              {Math.abs(trend)}%
            </span>
          </div>
          <span className="text-[11px] text-[#8A8A8A] truncate">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

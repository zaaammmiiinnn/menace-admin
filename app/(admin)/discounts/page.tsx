import React from 'react';
import { getDiscounts } from '@/lib/admin/queries';
import { DiscountsClient } from '@/components/discounts/DiscountsClient';
import { TicketPercent } from 'lucide-react';

export const metadata = {
  title: 'Discounts & Promos',
  description: 'Manage brand coupon codes, percentage thresholds, and redemptions',
};

export default async function DiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <TicketPercent className="w-5 h-5 text-[#C6FF00]" />
            DISCOUNTS & PROMOS
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            COUPONS // REDEMPTION THRESHOLDS // VIP CODES
          </p>
        </div>
      </div>

      <DiscountsClient initialDiscounts={discounts} />
    </div>
  );
}

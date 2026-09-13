import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/admin/queries';
import { ArrowLeft, Mail, ShoppingBag, ExternalLink, User } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  return {
    title: customer ? `${customer.name} — Customer Profile` : 'Customer Profile',
  };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#1C1C1C]">
        <Link
          href="/customers"
          className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#222222] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#F5F1E8]">{customer.name}</h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            ID: {customer.id} {customer.clerk_user_id ? `• Clerk: ${customer.clerk_user_id}` : ''}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#222222] bg-[#121212] p-4">
          <div className="text-[11px] font-mono uppercase text-[#8A8A8A]">Total LTV</div>
          <div className="text-2xl font-black tabular-nums text-[#C6FF00] mt-1">
            ₹{customer.total_spent.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#121212] p-4">
          <div className="text-[11px] font-mono uppercase text-[#8A8A8A]">Orders Placed</div>
          <div className="text-2xl font-black tabular-nums text-[#F5F1E8] mt-1">
            {customer.orders.length}
          </div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#121212] p-4">
          <div className="text-[11px] font-mono uppercase text-[#8A8A8A]">Contact Email</div>
          <div className="text-sm font-medium text-[#F5F1E8] mt-1 truncate flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#8A8A8A]" />
            {customer.email}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="rounded-xl border border-[#222222] bg-[#121212] overflow-hidden">
        <div className="p-3 bg-[#161616] border-b border-[#202020] text-xs font-mono uppercase tracking-wider text-[#8A8A8A] flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5 text-[#C6FF00]" />
          ORDER HISTORY ({customer.orders.length})
        </div>

        <div className="divide-y divide-[#1D1D1D]">
          {customer.orders.length > 0 ? (
            customer.orders.map((o: any) => (
              <div key={o.id} className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${o.id}`}
                      className="text-xs font-mono font-bold text-[#F5F1E8] hover:text-[#C6FF00] transition-colors flex items-center gap-1"
                    >
                      {o.id}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-[#8A8A8A] uppercase">
                      {o.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8A8A8A]">
                    {new Date(o.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono tabular-nums text-[#F5F1E8]">
                    ₹{o.total_inr.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-mono text-[#8A8A8A]">
              NO COMPLETED PURCHASES YET
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

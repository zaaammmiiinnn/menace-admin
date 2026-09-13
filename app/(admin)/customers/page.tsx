import React from 'react';
import { getCustomers } from '@/lib/admin/queries';
import { CustomersListClient } from '@/components/customers/CustomersListClient';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Customers Directory',
  description: 'Manage brand community members and lifetime order value',
};

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#C6FF00]" />
            CUSTOMERS DIRECTORY
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            COMMUNITY PROFILES // LIFETIME VALUE // ORDER HISTORY
          </p>
        </div>
      </div>

      <CustomersListClient initialCustomers={customers} />
    </div>
  );
}

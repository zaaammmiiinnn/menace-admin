import React from 'react';
import { getInventory } from '@/lib/admin/queries';
import { InventoryClient } from '@/components/inventory/InventoryClient';
import { Boxes } from 'lucide-react';

export const metadata = {
  title: 'Inventory & Stock Allocation',
  description: 'Manage garment SKU counts, low stock alerts, and optical barcode scanning',
};

export default async function InventoryPage() {
  const inventory = await getInventory();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-[#C6FF00]" />
            INVENTORY MATRIX
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            SKU STOCK ALLOCATION // BARCODE AUDITS // STEPPERS
          </p>
        </div>
      </div>

      <InventoryClient initialVariants={inventory} />
    </div>
  );
}

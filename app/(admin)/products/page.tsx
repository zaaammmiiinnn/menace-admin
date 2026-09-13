import React from 'react';
import { getProducts } from '@/lib/admin/queries';
import { ProductsListClient } from '@/components/products/ProductsListClient';
import { Shirt } from 'lucide-react';

export const metadata = {
  title: 'Products Catalog',
  description: 'Manage apparel drops, silhouettes, variants, and pricing',
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C1C1C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F1E8] flex items-center gap-2.5">
            <Shirt className="w-5 h-5 text-[#C6FF00]" />
            CATALOG & DROPS
          </h1>
          <p className="text-xs text-[#8A8A8A] font-mono">
            SILHOUETTES // VARIANT MATRICES // PRICING
          </p>
        </div>
      </div>

      <ProductsListClient initialProducts={products} />
    </div>
  );
}

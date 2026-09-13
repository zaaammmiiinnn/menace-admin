import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/admin/queries';
import { ProductFormClient } from '@/components/products/ProductFormClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product ? `Edit ${product.name}` : 'Product Details',
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductFormClient initialProduct={product} isNew={false} />;
}

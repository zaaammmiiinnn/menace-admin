import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/admin/queries';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Order ${id} — Fulfillment`,
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}

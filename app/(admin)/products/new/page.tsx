import React from 'react';
import { ProductFormClient } from '@/components/products/ProductFormClient';

export const metadata = {
  title: 'New Product Silhouette',
  description: 'Create a new garment silhouette and variant matrix',
};

export default function NewProductPage() {
  return <ProductFormClient isNew={true} />;
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Camera,
  Layers,
  DollarSign,
  Info,
} from 'lucide-react';
import { createProductAction, updateProductAction } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(5, 'Description is required'),
  priceInr: z.coerce.number().min(1, 'Price in INR required'),
  priceUsd: z.coerce.number().min(1, 'Price in USD required'),
  category: z.string().default('tees'),
  dropId: z.string().default('drop_001'),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  backQuote: z.string().optional().default(''),
  frontLogo: z.string().optional().default('MENANCE®'),
  fabricGsm: z.coerce.number().optional().default(240),
  fabricType: z.string().optional().default('Waffle Knit'),
  fit: z.string().optional().default('Boxy Oversized'),
  sleeveType: z.string().optional().default('Half Sleeve'),
  variants: z.array(
    z.object({
      size: z.string(),
      color: z.string(),
      sku: z.string(),
      stock: z.coerce.number().min(0),
      priceOverride: z.coerce.number().nullable().optional(),
    })
  ),
  images: z.array(z.string()).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormClientProps {
  initialProduct?: any;
  isNew?: boolean;
}

export function ProductFormClient({ initialProduct, isNew = false }: ProductFormClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const defaultVariants = initialProduct?.variants?.length
    ? initialProduct.variants.map((v: any) => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
        priceOverride: v.price_override || null,
      }))
    : [
        { size: 'S', color: 'Black', sku: 'MNC-NEW-S', stock: 25, priceOverride: null },
        { size: 'M', color: 'Black', sku: 'MNC-NEW-M', stock: 50, priceOverride: null },
        { size: 'L', color: 'Black', sku: 'MNC-NEW-L', stock: 40, priceOverride: null },
        { size: 'XL', color: 'Black', sku: 'MNC-NEW-XL', stock: 20, priceOverride: null },
      ];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialProduct?.name || '',
      slug: initialProduct?.slug || '',
      description: initialProduct?.description || '',
      priceInr: initialProduct?.price_inr ?? initialProduct?.priceInr ?? 1499,
      priceUsd: initialProduct?.price_usd ?? initialProduct?.priceUsd ?? 45,
      category: initialProduct?.category || 'tees',
      dropId: initialProduct?.drop_id || initialProduct?.dropId || 'drop_001',
      status: initialProduct?.status || 'active',
      backQuote: initialProduct?.back_quote || initialProduct?.backQuote || '',
      frontLogo: initialProduct?.front_logo || initialProduct?.frontLogo || 'MENANCE®',
      fabricGsm: initialProduct?.fabric_gsm || initialProduct?.fabricGsm || 240,
      fabricType: initialProduct?.fabric_type || initialProduct?.fabricType || 'Waffle Knit',
      fit: initialProduct?.fit || 'Boxy Oversized',
      sleeveType: initialProduct?.sleeve_type || initialProduct?.sleeveType || 'Half Sleeve',
      variants: defaultVariants,
      images: Array.isArray(initialProduct?.images)
        ? initialProduct.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSaving(true);
    try {
      if (isNew) {
        const res: any = await createProductAction(values);
        if (res && res.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Product created successfully');
        if (res?.id) {
          router.push(`/products/${res.id}`);
        } else {
          router.push('/products');
        }
      } else {
        const res: any = await updateProductAction(initialProduct.id, values);
        if (res && res.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Product updated successfully');
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCameraUpload = () => {
    setIsUploadingPhoto(true);
    toast.info('Accessing camera to photograph product sample...');
    setTimeout(() => {
      const mockR2Url = `https://assets.menance.store/products/sample_${Date.now()}.png`;
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, mockR2Url]);
      setIsUploadingPhoto(false);
      toast.success('Sample photographed and uploaded to Cloudflare R2 bucket.');
    }, 1500);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C1C]">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#F5F1E8]">
              {isNew ? 'NEW PRODUCT SILHOUETTE' : `EDIT // ${initialProduct?.name}`}
            </h1>
            <p className="text-xs text-[#8A8A8A] font-mono">
              SPECIFICATIONS & VARIANT MATRIX
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="h-9 px-4 bg-[#C6FF00] hover:bg-[#b5eb00] active:scale-95 text-[#0A0A0A] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Silhouette'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              BASIC SPECIFICATIONS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Product Name</label>
                <input
                  {...form.register('name')}
                  placeholder="The Acid Menance Tee"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">URL Slug</label>
                <input
                  {...form.register('slug')}
                  placeholder="acid-menance"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F5F1E8]">Product Description</label>
              <textarea
                {...form.register('description')}
                rows={3}
                placeholder="Drop-shoulder, heavyweight 280 GSM cotton boxy silhouette..."
                className="w-full p-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Price INR (₹)</label>
                <input
                  type="number"
                  {...form.register('priceInr')}
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Price USD ($)</label>
                <input
                  type="number"
                  {...form.register('priceUsd')}
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs font-mono tabular-nums text-[#F5F1E8] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Textile & Design Metadata */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              TEXTILE &amp; BRAND ARCHITECTURE
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Back Quote</label>
                <input
                  {...form.register('backQuote')}
                  placeholder="MIND YOUR BUSINESS."
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Front Logo</label>
                <input
                  {...form.register('frontLogo')}
                  placeholder="MENANCE®"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Fabric GSM</label>
                <input
                  type="number"
                  {...form.register('fabricGsm')}
                  placeholder="240"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Fabric Type</label>
                <input
                  {...form.register('fabricType')}
                  placeholder="Waffle Knit"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Fit</label>
                <input
                  {...form.register('fit')}
                  placeholder="Boxy Oversized"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#F5F1E8]">Sleeve Type</label>
                <input
                  {...form.register('sleeveType')}
                  placeholder="Half Sleeve"
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] focus:border-[#C6FF00] rounded-lg text-xs text-[#F5F1E8] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Variant Matrix Generator */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
                  VARIANT & INVENTORY MATRIX
                </span>
                <p className="text-xs text-[#666666]">Configure sizes, colorways & SKUs</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    size: 'M',
                    color: 'Black',
                    sku: `MNC-${Date.now().toString().slice(-4)}`,
                    stock: 20,
                    priceOverride: null,
                  })
                }
                className="h-7 px-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] text-xs font-medium text-[#F5F1E8] rounded-md flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#C6FF00]" />
                Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 bg-[#161616] border border-[#222222] rounded-lg grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-3 sm:col-span-2">
                    <select
                      {...form.register(`variants.${index}.size`)}
                      className="w-full h-8 px-2 bg-[#1E1E1E] border border-[#2E2E2E] rounded text-xs font-mono text-[#F5F1E8] outline-none"
                    >
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-3">
                    <input
                      {...form.register(`variants.${index}.color`)}
                      placeholder="Color"
                      className="w-full h-8 px-2 bg-[#1E1E1E] border border-[#2E2E2E] rounded text-xs text-[#F5F1E8] outline-none"
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-4">
                    <input
                      {...form.register(`variants.${index}.sku`)}
                      placeholder="SKU"
                      className="w-full h-8 px-2 bg-[#1E1E1E] border border-[#2E2E2E] rounded text-xs font-mono text-[#F5F1E8] outline-none"
                    />
                  </div>

                  <div className="col-span-10 sm:col-span-2">
                    <input
                      type="number"
                      {...form.register(`variants.${index}.stock`)}
                      placeholder="Stock"
                      className="w-full h-8 px-2 bg-[#1E1E1E] border border-[#2E2E2E] rounded text-xs font-mono tabular-nums text-[#C6FF00] outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 text-[#8A8A8A] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls (1 Col) */}
        <div className="space-y-6">
          {/* Status & Drop Association */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
              RELEASE STATUS
            </span>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F1E8]">Lifecycle Stage</label>
                <select
                  {...form.register('status')}
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
                >
                  <option value="active">Active (Available on Storefront)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F1E8]">Assigned Drop</label>
                <select
                  {...form.register('dropId')}
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
                >
                  <option value="drop_001">DROP 001 — NOT FOR EVERYONE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#F5F1E8]">Category</label>
                <select
                  {...form.register('category')}
                  className="w-full h-9 px-3 bg-[#181818] border border-[#262626] rounded-lg text-xs font-mono text-[#F5F1E8] outline-none"
                >
                  <option value="tees">Heavyweight Tees</option>
                  <option value="hoodies">Oversized Hoodies</option>
                  <option value="bottoms">Pants & Bottoms</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Imagery */}
          <div className="rounded-xl border border-[#222222] bg-[#121212] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
                PRODUCT IMAGERY & MEDIA
              </span>
              <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 rounded">
                {(form.watch('images') || []).length} IMAGES
              </span>
            </div>

            <ImageUploader
              images={form.watch('images') || []}
              onChange={(updatedImages) => {
                form.setValue('images', updatedImages, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              maxImages={8}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

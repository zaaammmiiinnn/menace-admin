'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, requireStaff, getAdminUser } from '@/lib/auth/roles';
import { getLocalStore } from '@/lib/db';
import { invalidateAdminCache } from './queries';
import { z } from 'zod';

export async function logAuditAction(params: {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}): Promise<void> {
  try {
    const user = await getAdminUser();
    const entry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.id || 'system',
      userEmail: user?.email || 'admin@menace.store',
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      details: params.details || null,
      createdAt: Date.now(),
    };

    const store = getLocalStore();
    store.getTable('audit_log').unshift({
      id: entry.id,
      user_id: entry.userId,
      user_email: entry.userEmail,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId,
      details: entry.details,
      created_at: entry.createdAt,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record action:', err);
  }
}

// --- ORDER MUTATIONS (Staff & Admin) ---

export async function updateOrderStatusAction(orderId: string, status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled', trackingNumber?: string) {
  await requireStaff();
  const store = getLocalStore();
  const orders = store.getTable('orders');
  const index = orders.findIndex((o: any) => o.id === orderId);

  if (index === -1) {
    throw new Error('Order not found');
  }

  const prevStatus = orders[index].status;
  orders[index] = {
    ...orders[index],
    status,
    tracking_number: trackingNumber !== undefined ? trackingNumber : orders[index].tracking_number,
    fulfilled_at: status === 'shipped' || status === 'delivered' ? Date.now() : orders[index].fulfilled_at,
  };

  await logAuditAction({
    action: 'UPDATE_ORDER_STATUS',
    entity: 'orders',
    entityId: orderId,
    details: `Transitioned order ${orderId} from ${prevStatus} to ${status}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}`,
  });

  invalidateAdminCache();
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/dashboard');
  return { success: true, order: orders[index] };
}

export async function markOrderPackedAction(orderId: string) {
  return await updateOrderStatusAction(orderId, 'paid');
}

export async function markOrderShippedAction(orderId: string, trackingNumber?: string) {
  return await updateOrderStatusAction(orderId, 'shipped', trackingNumber);
}

// --- PRODUCT MUTATIONS (Admin Only) ---

const productFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(5, 'Description is required'),
  priceInr: z.coerce.number().min(1, 'Price in INR required'),
  priceUsd: z.coerce.number().min(1, 'Price in USD required'),
  category: z.string().default('tees'),
  dropId: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
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

// Sync product mutations from Admin to Storefront
async function syncProductToStorefront(action: 'upsert' | 'delete', product: any) {
  try {
    const urls = [
      process.env.NEXT_PUBLIC_STORE_URL,
      'http://localhost:3005',
      'http://localhost:3000',
    ].filter(Boolean);

    for (const baseUrl of urls) {
      fetch(`${baseUrl}/api/products/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, product }),
      }).catch(() => {});
    }
  } catch (err) {
    // Non-blocking sync
  }
}

export async function createProductAction(formData: any) {
  await requireAdmin();
  const parsed = productFormSchema.parse(formData);
  const store = getLocalStore();

  const id = `prod_${Date.now()}`;
  const now = Date.now();

  const newProduct = {
    id,
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    price_inr: parsed.priceInr,
    price_usd: parsed.priceUsd,
    category: parsed.category,
    drop_id: parsed.dropId || 'drop_001',
    status: parsed.status,
    created_at: now,
    updated_at: now,
  };

  store.getTable('products').unshift(newProduct);

  parsed.variants.forEach((v, index) => {
    store.getTable('product_variants').push({
      id: `var_${id}_${index}`,
      product_id: id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      price_override: v.priceOverride || null,
      image_url: null,
    });
  });

  parsed.images.forEach((url, index) => {
    store.getTable('product_images').push({
      id: `img_${id}_${index}`,
      product_id: id,
      url,
      alt: `${parsed.name} Image ${index + 1}`,
      sort_order: index,
    });
  });

  await logAuditAction({
    action: 'CREATE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Created product "${parsed.name}" (${parsed.slug}) with ${parsed.variants.length} variants`,
  });

  // Sync to Storefront
  await syncProductToStorefront('upsert', {
    ...newProduct,
    images: parsed.images,
  });

  invalidateAdminCache();
  revalidatePath('/products');
  revalidatePath('/inventory');
  revalidatePath('/dashboard');
  return { success: true, id };
}

export async function updateProductAction(id: string, formData: any) {
  await requireAdmin();
  const parsed = productFormSchema.parse(formData);
  const store = getLocalStore();
  const products = store.getTable('products');
  const index = products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    throw new Error('Product not found');
  }

  products[index] = {
    ...products[index],
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    price_inr: parsed.priceInr,
    price_usd: parsed.priceUsd,
    category: parsed.category,
    drop_id: parsed.dropId || 'drop_001',
    status: parsed.status,
    updated_at: Date.now(),
  };

  // Replace variants
  const variantsTable = store.getTable('product_variants');
  const otherVariants = variantsTable.filter((v: any) => v.product_id !== id);
  const updatedVariants = parsed.variants.map((v, idx) => ({
    id: `var_${id}_${idx}`,
    product_id: id,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
    price_override: v.priceOverride || null,
    image_url: null,
  }));
  store.tables.product_variants = [...otherVariants, ...updatedVariants];

  await logAuditAction({
    action: 'UPDATE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Updated catalog specs for "${parsed.name}"`,
  });

  // Sync to Storefront
  await syncProductToStorefront('upsert', {
    ...products[index],
    images: parsed.images,
  });

  invalidateAdminCache();
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/inventory');
  return { success: true };
}

export async function toggleProductStatusAction(id: string, status: 'draft' | 'active' | 'archived') {
  await requireAdmin();
  const store = getLocalStore();
  const products = store.getTable('products');
  const product = products.find((p: any) => p.id === id);
  if (!product) throw new Error('Product not found');

  product.status = status;
  product.updated_at = Date.now();

  await logAuditAction({
    action: 'TOGGLE_PRODUCT_STATUS',
    entity: 'products',
    entityId: id,
    details: `Updated status to ${status} for "${product.name}"`,
  });

  // Sync to Storefront
  await syncProductToStorefront('upsert', product);

  invalidateAdminCache();
  revalidatePath('/products');
  return { success: true };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const store = getLocalStore();
  const products = store.getTable('products');
  const product = products.find((p: any) => p.id === id);

  store.tables.products = products.filter((p: any) => p.id !== id);
  store.tables.product_variants = store.getTable('product_variants').filter((v: any) => v.product_id !== id);

  await logAuditAction({
    action: 'DELETE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Deleted product "${product?.name || id}" and associated variant matrix`,
  });

  // Sync delete to Storefront
  await syncProductToStorefront('delete', { id });

  invalidateAdminCache();
  revalidatePath('/products');
  revalidatePath('/inventory');
  return { success: true };
}

// --- INVENTORY MUTATIONS (Admin Only) ---

export async function updateStockAction(variantId: string, change: number, reason: string) {
  await requireAdmin();
  const store = getLocalStore();
  const variants = store.getTable('product_variants');
  const variant = variants.find((v: any) => v.id === variantId);

  if (!variant) throw new Error('Variant not found');

  const oldStock = variant.stock;
  const newStock = Math.max(0, oldStock + change);
  variant.stock = newStock;

  store.getTable('inventory_log').unshift({
    id: `inv_${Date.now()}`,
    variant_id: variantId,
    change,
    reason: reason || 'Manual stock adjustment via Admin Console',
    created_at: Date.now(),
  });

  await logAuditAction({
    action: 'UPDATE_INVENTORY',
    entity: 'product_variants',
    entityId: variantId,
    details: `Adjusted stock on SKU ${variant.sku} from ${oldStock} to ${newStock} (${change >= 0 ? '+' : ''}${change}). Reason: ${reason}`,
  });

  invalidateAdminCache();
  revalidatePath('/inventory');
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { success: true, newStock };
}

// --- DISCOUNT MUTATIONS (Admin Only) ---

export async function createDiscountAction(data: {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses?: number;
  expiresAt?: number;
}) {
  await requireAdmin();
  const store = getLocalStore();
  const discounts = store.getTable('discount_codes');

  const id = `disc_${Date.now()}`;
  discounts.unshift({
    id,
    code: data.code.toUpperCase().trim(),
    type: data.type,
    value: data.value,
    min_order: data.minOrder,
    max_uses: data.maxUses || null,
    uses: 0,
    expires_at: data.expiresAt || null,
    active: 1,
  });

  await logAuditAction({
    action: 'CREATE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Created coupon ${data.code.toUpperCase()} (${data.value}${data.type === 'percentage' ? '%' : ' INR'} off)`,
  });

  revalidatePath('/discounts');
  return { success: true, id };
}

export async function toggleDiscountActiveAction(id: string) {
  await requireAdmin();
  const store = getLocalStore();
  const discount = store.getTable('discount_codes').find((d: any) => d.id === id);
  if (!discount) throw new Error('Discount not found');

  discount.active = discount.active ? 0 : 1;

  await logAuditAction({
    action: 'TOGGLE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Toggled promo ${discount.code} active state to ${discount.active ? 'ACTIVE' : 'DISABLED'}`,
  });

  revalidatePath('/discounts');
  return { success: true, active: Boolean(discount.active) };
}

export async function deleteDiscountAction(id: string) {
  await requireAdmin();
  const store = getLocalStore();
  const discounts = store.getTable('discount_codes');
  const code = discounts.find((d: any) => d.id === id)?.code;

  store.tables.discount_codes = discounts.filter((d: any) => d.id !== id);

  await logAuditAction({
    action: 'DELETE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Deleted discount code ${code || id}`,
  });

  revalidatePath('/discounts');
  return { success: true };
}

// --- STORE SETTINGS & STAFF RBAC (Admin Only) ---

export async function updateStoreSettingsAction(newSettings: Record<string, string>) {
  await requireAdmin();
  const store = getLocalStore();
  const settings = store.getTable('settings');
  const now = Date.now();

  for (const [key, value] of Object.entries(newSettings)) {
    const existing = settings.find((s: any) => s.key === key);
    if (existing) {
      existing.value = value;
      existing.updated_at = now;
    } else {
      settings.push({ key, value, updated_at: now });
    }
  }

  await logAuditAction({
    action: 'UPDATE_SETTINGS',
    entity: 'settings',
    details: `Updated store configuration values: ${Object.keys(newSettings).join(', ')}`,
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateStaffRoleAction(email: string, role: 'staff' | 'admin', name: string) {
  await requireAdmin();
  const store = getLocalStore();
  const settings = store.getTable('settings');
  const staffRow = settings.find((s: any) => s.key === 'staff_roles');

  let list: any[] = [];
  try {
    list = staffRow?.value ? JSON.parse(staffRow.value) : [];
  } catch {
    list = [];
  }

  const existingIdx = list.findIndex((m: any) => m.email.toLowerCase() === email.toLowerCase());
  if (existingIdx !== -1) {
    list[existingIdx] = { email: email.toLowerCase(), role, name };
  } else {
    list.push({ email: email.toLowerCase(), role, name });
  }

  if (staffRow) {
    staffRow.value = JSON.stringify(list);
    staffRow.updated_at = Date.now();
  } else {
    settings.push({ key: 'staff_roles', value: JSON.stringify(list), updated_at: Date.now() });
  }

  await logAuditAction({
    action: 'UPDATE_STAFF_ROLE',
    entity: 'settings',
    details: `Assigned role "${role}" to ${email} (${name})`,
  });

  revalidatePath('/settings');
  return { success: true, list };
}

export async function removeStaffRoleAction(email: string) {
  await requireAdmin();
  const store = getLocalStore();
  const settings = store.getTable('settings');
  const staffRow = settings.find((s: any) => s.key === 'staff_roles');

  if (staffRow?.value) {
    const list = JSON.parse(staffRow.value).filter((m: any) => m.email.toLowerCase() !== email.toLowerCase());
    staffRow.value = JSON.stringify(list);
    staffRow.updated_at = Date.now();
  }

  await logAuditAction({
    action: 'REMOVE_STAFF_ROLE',
    entity: 'settings',
    details: `Revoked operator privileges for ${email}`,
  });

  revalidatePath('/settings');
  return { success: true };
}

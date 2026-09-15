'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, requireStaff, getAdminUser } from '@/lib/auth/roles';
import { getDb, getLocalStore } from '@/lib/db';
import {
  products,
  productVariants,
  productImages,
  orders,
  orderItems,
  customers,
  discountCodes,
  inventoryLog,
  settings,
  auditLog,
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
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
      userEmail: user?.email || 'admin@menance.store',
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      details: params.details || null,
      createdAt: Date.now(),
    };

    try {
      const db = getDb();
      await db.insert(auditLog).values(entry);
    } catch {
      // Fallback to local store during build/dev
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
    }
  } catch (err) {
    console.error('[AuditLog] Failed to record action:', err);
  }
}

// --- ORDER MUTATIONS (Staff & Admin) ---

export async function updateOrderStatusAction(orderId: string, status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled', trackingNumber?: string) {
  await requireStaff();

  try {
    const db = getDb();

    // Get current order for audit log
    const existing = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!existing.length) {
      throw new Error('Order not found');
    }
    const prevStatus = existing[0].status;

    const updateData: Record<string, any> = {
      status,
    };
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }
    if (status === 'shipped' || status === 'delivered') {
      updateData.fulfilledAt = Date.now();
    }

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

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

    const updated = await db.select().from(orders).where(eq(orders.id, orderId));
    return { success: true, order: updated[0] };
  } catch (err: any) {
    if (err.message === 'Order not found') throw err;
    console.error('[updateOrderStatus] D1 failed, falling back:', err);
    return updateOrderStatusFallback(orderId, status, trackingNumber);
  }
}

async function updateOrderStatusFallback(orderId: string, status: string, trackingNumber?: string) {
  const store = getLocalStore();
  const ordersData = store.getTable('orders');
  const index = ordersData.findIndex((o: any) => o.id === orderId);
  if (index === -1) throw new Error('Order not found');

  ordersData[index] = {
    ...ordersData[index],
    status,
    tracking_number: trackingNumber !== undefined ? trackingNumber : ordersData[index].tracking_number,
    fulfilled_at: status === 'shipped' || status === 'delivered' ? Date.now() : ordersData[index].fulfilled_at,
  };

  invalidateAdminCache();
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/dashboard');
  return { success: true, order: ordersData[index] };
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

// Sync product mutations from Admin to Storefront
async function syncProductToStorefront(action: 'upsert' | 'delete', product: any) {
  try {
    const rawUrls = [
      process.env.STOREFRONT_URL,
      process.env.NEXT_PUBLIC_STOREFRONT_URL,
      process.env.STORE_URL,
      process.env.NEXT_PUBLIC_STORE_URL,
      'http://localhost:3005',
      'http://localhost:3000',
    ].filter(Boolean) as string[];

    const urls = Array.from(new Set(rawUrls));

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

  const id = `prod_${Date.now()}`;
  const now = Date.now();

  try {
    const db = getDb();

    // Insert product
    await db.insert(products).values({
      id,
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      priceInr: parsed.priceInr,
      priceUsd: parsed.priceUsd,
      category: parsed.category,
      dropId: parsed.dropId || 'drop_001',
      status: parsed.status,
      backQuote: parsed.backQuote || null,
      frontLogo: parsed.frontLogo || 'MENANCE®',
      fabricGsm: parsed.fabricGsm ? Number(parsed.fabricGsm) : 240,
      fabricType: parsed.fabricType || null,
      fit: parsed.fit || 'Boxy Oversized',
      sleeveType: parsed.sleeveType || null,
      createdAt: now,
      updatedAt: now,
    });

    // Insert variants
    for (let i = 0; i < parsed.variants.length; i++) {
      const v = parsed.variants[i];
      await db.insert(productVariants).values({
        id: `var_${id}_${i}`,
        productId: id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
        priceOverride: v.priceOverride || null,
        imageUrl: null,
      });
    }

    // Insert images
    for (let i = 0; i < parsed.images.length; i++) {
      await db.insert(productImages).values({
        id: `img_${id}_${i}`,
        productId: id,
        url: parsed.images[i],
        alt: `${parsed.name} Image ${i + 1}`,
        sortOrder: i,
      });
    }

    await logAuditAction({
      action: 'CREATE_PRODUCT',
      entity: 'products',
      entityId: id,
      details: `Created product "${parsed.name}" (${parsed.slug}) with ${parsed.variants.length} variants`,
    });

    // Sync to Storefront
    await syncProductToStorefront('upsert', {
      id, slug: parsed.slug, name: parsed.name, description: parsed.description,
      price_inr: parsed.priceInr, price_usd: parsed.priceUsd, category: parsed.category,
      drop_id: parsed.dropId || 'drop_001', status: parsed.status,
      created_at: now, updated_at: now, images: parsed.images,
    });

    invalidateAdminCache();
    revalidatePath('/products');
    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (err) {
    console.error('[createProduct] D1 failed, falling back:', err);
    return createProductFallback(id, now, parsed);
  }
}

function createProductFallback(id: string, now: number, parsed: any) {
  const store = getLocalStore();
  const newProduct = {
    id, slug: parsed.slug, name: parsed.name, description: parsed.description,
    price_inr: parsed.priceInr, price_usd: parsed.priceUsd, category: parsed.category,
    drop_id: parsed.dropId || 'drop_001', status: parsed.status,
    created_at: now, updated_at: now,
  };
  store.getTable('products').unshift(newProduct);
  parsed.variants.forEach((v: any, index: number) => {
    store.getTable('product_variants').push({
      id: `var_${id}_${index}`, product_id: id, size: v.size, color: v.color,
      sku: v.sku, stock: v.stock, price_override: v.priceOverride || null, image_url: null,
    });
  });
  parsed.images.forEach((url: string, index: number) => {
    store.getTable('product_images').push({
      id: `img_${id}_${index}`, product_id: id, url, alt: `${parsed.name} Image ${index + 1}`, sort_order: index,
    });
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

  try {
    const db = getDb();

    // Verify product exists
    const existing = await db.select().from(products).where(eq(products.id, id));
    if (!existing.length) {
      throw new Error('Product not found');
    }

    // Update product
    await db.update(products).set({
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      priceInr: parsed.priceInr,
      priceUsd: parsed.priceUsd,
      category: parsed.category,
      dropId: parsed.dropId || 'drop_001',
      status: parsed.status,
      backQuote: parsed.backQuote || null,
      frontLogo: parsed.frontLogo || 'MENANCE®',
      fabricGsm: parsed.fabricGsm ? Number(parsed.fabricGsm) : 240,
      fabricType: parsed.fabricType || null,
      fit: parsed.fit || 'Boxy Oversized',
      sleeveType: parsed.sleeveType || null,
      updatedAt: Date.now(),
    }).where(eq(products.id, id));

    // Delete old variants and re-insert
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    for (let i = 0; i < parsed.variants.length; i++) {
      const v = parsed.variants[i];
      await db.insert(productVariants).values({
        id: `var_${id}_${i}`,
        productId: id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: v.stock,
        priceOverride: v.priceOverride || null,
        imageUrl: null,
      });
    }

    await logAuditAction({
      action: 'UPDATE_PRODUCT',
      entity: 'products',
      entityId: id,
      details: `Updated catalog specs for "${parsed.name}"`,
    });

    // Sync to Storefront
    await syncProductToStorefront('upsert', {
      id, slug: parsed.slug, name: parsed.name, description: parsed.description,
      price_inr: parsed.priceInr, price_usd: parsed.priceUsd,
      images: parsed.images,
    });

    invalidateAdminCache();
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    revalidatePath('/inventory');
    return { success: true };
  } catch (err: any) {
    if (err.message === 'Product not found') throw err;
    console.error('[updateProduct] D1 failed, falling back:', err);
    return updateProductFallback(id, parsed);
  }
}

function updateProductFallback(id: string, parsed: any) {
  const store = getLocalStore();
  const productsData = store.getTable('products');
  const index = productsData.findIndex((p: any) => p.id === id);
  if (index === -1) throw new Error('Product not found');

  productsData[index] = {
    ...productsData[index], slug: parsed.slug, name: parsed.name, description: parsed.description,
    price_inr: parsed.priceInr, price_usd: parsed.priceUsd, category: parsed.category,
    drop_id: parsed.dropId || 'drop_001', status: parsed.status, updated_at: Date.now(),
  };

  const variantsTable = store.getTable('product_variants');
  const otherVariants = variantsTable.filter((v: any) => v.product_id !== id);
  const updatedVariants = parsed.variants.map((v: any, idx: number) => ({
    id: `var_${id}_${idx}`, product_id: id, size: v.size, color: v.color,
    sku: v.sku, stock: v.stock, price_override: v.priceOverride || null, image_url: null,
  }));
  store.tables.product_variants = [...otherVariants, ...updatedVariants];

  invalidateAdminCache();
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/inventory');
  return { success: true };
}

export async function toggleProductStatusAction(id: string, status: 'draft' | 'active' | 'archived') {
  await requireAdmin();

  try {
    const db = getDb();
    const existing = await db.select().from(products).where(eq(products.id, id));
    if (!existing.length) throw new Error('Product not found');

    await db.update(products).set({
      status,
      updatedAt: Date.now(),
    }).where(eq(products.id, id));

    await logAuditAction({
      action: 'TOGGLE_PRODUCT_STATUS',
      entity: 'products',
      entityId: id,
      details: `Updated status to ${status} for "${existing[0].name}"`,
    });

    // Sync to Storefront
    await syncProductToStorefront('upsert', { ...existing[0], status });

    invalidateAdminCache();
    revalidatePath('/products');
    return { success: true };
  } catch (err: any) {
    if (err.message === 'Product not found') throw err;
    console.error('[toggleProductStatus] D1 failed, falling back:', err);

    const store = getLocalStore();
    const productsData = store.getTable('products');
    const product = productsData.find((p: any) => p.id === id);
    if (!product) throw new Error('Product not found');
    product.status = status;
    product.updated_at = Date.now();
    invalidateAdminCache();
    revalidatePath('/products');
    return { success: true };
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const existing = await db.select().from(products).where(eq(products.id, id));

    // Delete product (cascade handles variants via FK)
    await db.delete(products).where(eq(products.id, id));
    // Explicitly delete variants and images in case cascade isn't supported
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    await db.delete(productImages).where(eq(productImages.productId, id));

    await logAuditAction({
      action: 'DELETE_PRODUCT',
      entity: 'products',
      entityId: id,
      details: `Deleted product "${existing[0]?.name || id}" and associated variant matrix`,
    });

    // Sync delete to Storefront
    await syncProductToStorefront('delete', { id });

    invalidateAdminCache();
    revalidatePath('/products');
    revalidatePath('/inventory');
    return { success: true };
  } catch (err) {
    console.error('[deleteProduct] D1 failed, falling back:', err);

    const store = getLocalStore();
    const productsData = store.getTable('products');
    store.tables.products = productsData.filter((p: any) => p.id !== id);
    store.tables.product_variants = store.getTable('product_variants').filter((v: any) => v.product_id !== id);
    store.tables.product_images = (store.tables.product_images || []).filter((img: any) => img.product_id !== id);
    invalidateAdminCache();
    revalidatePath('/products');
    revalidatePath('/inventory');
    return { success: true };
  }
}

// --- INVENTORY MUTATIONS (Admin Only) ---

export async function updateStockAction(variantId: string, change: number, reason: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const existing = await db.select().from(productVariants).where(eq(productVariants.id, variantId));
    if (!existing.length) throw new Error('Variant not found');

    const variant = existing[0];
    const oldStock = variant.stock;
    const newStock = Math.max(0, oldStock + change);

    await db.update(productVariants).set({ stock: newStock }).where(eq(productVariants.id, variantId));

    await db.insert(inventoryLog).values({
      id: `inv_${Date.now()}`,
      variantId,
      change,
      reason: reason || 'Manual stock adjustment via Admin Console',
      createdAt: Date.now(),
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
  } catch (err: any) {
    if (err.message === 'Variant not found') throw err;
    console.error('[updateStock] D1 failed, falling back:', err);

    const store = getLocalStore();
    const variants = store.getTable('product_variants');
    const variant = variants.find((v: any) => v.id === variantId);
    if (!variant) throw new Error('Variant not found');

    const oldStock = variant.stock;
    const newStock = Math.max(0, oldStock + change);
    variant.stock = newStock;

    store.getTable('inventory_log').unshift({
      id: `inv_${Date.now()}`, variant_id: variantId, change,
      reason: reason || 'Manual stock adjustment via Admin Console', created_at: Date.now(),
    });

    invalidateAdminCache();
    revalidatePath('/inventory');
    revalidatePath('/products');
    revalidatePath('/dashboard');
    return { success: true, newStock };
  }
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

  const id = `disc_${Date.now()}`;

  try {
    const db = getDb();
    await db.insert(discountCodes).values({
      id,
      code: data.code.toUpperCase().trim(),
      type: data.type,
      value: data.value,
      minOrder: data.minOrder,
      maxUses: data.maxUses || null,
      uses: 0,
      expiresAt: data.expiresAt || null,
      active: true,
    });

    await logAuditAction({
      action: 'CREATE_DISCOUNT',
      entity: 'discount_codes',
      entityId: id,
      details: `Created coupon ${data.code.toUpperCase()} (${data.value}${data.type === 'percentage' ? '%' : ' INR'} off)`,
    });

    revalidatePath('/discounts');
    return { success: true, id };
  } catch (err) {
    console.error('[createDiscount] D1 failed, falling back:', err);

    const store = getLocalStore();
    store.getTable('discount_codes').unshift({
      id, code: data.code.toUpperCase().trim(), type: data.type, value: data.value,
      min_order: data.minOrder, max_uses: data.maxUses || null, uses: 0,
      expires_at: data.expiresAt || null, active: 1,
    });
    revalidatePath('/discounts');
    return { success: true, id };
  }
}

export async function toggleDiscountActiveAction(id: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const existing = await db.select().from(discountCodes).where(eq(discountCodes.id, id));
    if (!existing.length) throw new Error('Discount not found');

    const newActive = !existing[0].active;
    await db.update(discountCodes).set({ active: newActive }).where(eq(discountCodes.id, id));

    await logAuditAction({
      action: 'TOGGLE_DISCOUNT',
      entity: 'discount_codes',
      entityId: id,
      details: `Toggled promo ${existing[0].code} active state to ${newActive ? 'ACTIVE' : 'DISABLED'}`,
    });

    revalidatePath('/discounts');
    return { success: true, active: newActive };
  } catch (err: any) {
    if (err.message === 'Discount not found') throw err;
    console.error('[toggleDiscount] D1 failed, falling back:', err);

    const store = getLocalStore();
    const discount = store.getTable('discount_codes').find((d: any) => d.id === id);
    if (!discount) throw new Error('Discount not found');
    discount.active = discount.active ? 0 : 1;
    revalidatePath('/discounts');
    return { success: true, active: Boolean(discount.active) };
  }
}

export async function deleteDiscountAction(id: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const existing = await db.select().from(discountCodes).where(eq(discountCodes.id, id));

    await db.delete(discountCodes).where(eq(discountCodes.id, id));

    await logAuditAction({
      action: 'DELETE_DISCOUNT',
      entity: 'discount_codes',
      entityId: id,
      details: `Deleted discount code ${existing[0]?.code || id}`,
    });

    revalidatePath('/discounts');
    return { success: true };
  } catch (err) {
    console.error('[deleteDiscount] D1 failed, falling back:', err);

    const store = getLocalStore();
    const discounts = store.getTable('discount_codes');
    store.tables.discount_codes = discounts.filter((d: any) => d.id !== id);
    revalidatePath('/discounts');
    return { success: true };
  }
}

// --- STORE SETTINGS & STAFF RBAC (Admin Only) ---

export async function updateStoreSettingsAction(newSettings: Record<string, string>) {
  await requireAdmin();

  try {
    const db = getDb();
    const now = Date.now();

    for (const [key, value] of Object.entries(newSettings)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key));
      if (existing.length) {
        await db.update(settings).set({ value, updatedAt: now }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value, updatedAt: now });
      }
    }

    await logAuditAction({
      action: 'UPDATE_SETTINGS',
      entity: 'settings',
      details: `Updated store configuration values: ${Object.keys(newSettings).join(', ')}`,
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (err) {
    console.error('[updateSettings] D1 failed, falling back:', err);

    const store = getLocalStore();
    const settingsData = store.getTable('settings');
    const now = Date.now();
    for (const [key, value] of Object.entries(newSettings)) {
      const existing = settingsData.find((s: any) => s.key === key);
      if (existing) { existing.value = value; existing.updated_at = now; }
      else { settingsData.push({ key, value, updated_at: now }); }
    }
    revalidatePath('/settings');
    return { success: true };
  }
}

export async function updateStaffRoleAction(email: string, role: 'staff' | 'admin', name: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const staffRow = await db.select().from(settings).where(eq(settings.key, 'staff_roles'));

    let list: any[] = [];
    try {
      list = staffRow.length && staffRow[0].value ? JSON.parse(staffRow[0].value) : [];
    } catch { list = []; }

    const existingIdx = list.findIndex((m: any) => m.email.toLowerCase() === email.toLowerCase());
    if (existingIdx !== -1) {
      list[existingIdx] = { email: email.toLowerCase(), role, name };
    } else {
      list.push({ email: email.toLowerCase(), role, name });
    }

    if (staffRow.length) {
      await db.update(settings).set({ value: JSON.stringify(list), updatedAt: Date.now() }).where(eq(settings.key, 'staff_roles'));
    } else {
      await db.insert(settings).values({ key: 'staff_roles', value: JSON.stringify(list), updatedAt: Date.now() });
    }

    await logAuditAction({
      action: 'UPDATE_STAFF_ROLE',
      entity: 'settings',
      details: `Assigned role "${role}" to ${email} (${name})`,
    });

    revalidatePath('/settings');
    return { success: true, list };
  } catch (err) {
    console.error('[updateStaffRole] D1 failed, falling back:', err);

    const store = getLocalStore();
    const settingsData = store.getTable('settings');
    const staffRow = settingsData.find((s: any) => s.key === 'staff_roles');
    let list: any[] = [];
    try { list = staffRow?.value ? JSON.parse(staffRow.value) : []; } catch { list = []; }

    const existingIdx = list.findIndex((m: any) => m.email.toLowerCase() === email.toLowerCase());
    if (existingIdx !== -1) { list[existingIdx] = { email: email.toLowerCase(), role, name }; }
    else { list.push({ email: email.toLowerCase(), role, name }); }

    if (staffRow) { staffRow.value = JSON.stringify(list); staffRow.updated_at = Date.now(); }
    else { settingsData.push({ key: 'staff_roles', value: JSON.stringify(list), updated_at: Date.now() }); }

    revalidatePath('/settings');
    return { success: true, list };
  }
}

export async function removeStaffRoleAction(email: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const staffRow = await db.select().from(settings).where(eq(settings.key, 'staff_roles'));

    if (staffRow.length && staffRow[0].value) {
      const list = JSON.parse(staffRow[0].value).filter((m: any) => m.email.toLowerCase() !== email.toLowerCase());
      await db.update(settings).set({ value: JSON.stringify(list), updatedAt: Date.now() }).where(eq(settings.key, 'staff_roles'));
    }

    await logAuditAction({
      action: 'REMOVE_STAFF_ROLE',
      entity: 'settings',
      details: `Revoked operator privileges for ${email}`,
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (err) {
    console.error('[removeStaffRole] D1 failed, falling back:', err);

    const store = getLocalStore();
    const settingsData = store.getTable('settings');
    const staffRow = settingsData.find((s: any) => s.key === 'staff_roles');
    if (staffRow?.value) {
      const list = JSON.parse(staffRow.value).filter((m: any) => m.email.toLowerCase() !== email.toLowerCase());
      staffRow.value = JSON.stringify(list);
      staffRow.updated_at = Date.now();
    }
    revalidatePath('/settings');
    return { success: true };
  }
}

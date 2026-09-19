import { NextRequest, NextResponse } from 'next/server';
import { getLocalStore } from '@/lib/db';
import { invalidateAdminCache } from '@/lib/admin/queries';
import { logAuditAction } from '@/lib/admin/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order, items, customer } = body;

    if (!order || !order.id) {
      return NextResponse.json(
        { success: false, error: 'Missing required order payload' },
        { status: 400 }
      );
    }

    const store = getLocalStore();
    const customers = store.getTable('customers');
    const orders = store.getTable('orders');
    const orderItems = store.getTable('order_items');
    const variants = store.getTable('product_variants');

    // 1. Upsert Customer
    let customerId = order.customerId || order.customer_id;
    if (customer && customer.email) {
      const existingCust = customers.find((c: any) => c.email?.toLowerCase() === customer.email.toLowerCase());
      if (existingCust) {
        customerId = existingCust.id;
        existingCust.total_spent = (existingCust.total_spent || 0) + (order.totalInr || order.total_inr || 0);
      } else {
        customerId = customerId || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        customers.push({
          id: customerId,
          clerk_user_id: customer.clerkUserId || null,
          email: customer.email,
          name: customer.name || 'Menance Customer',
          created_at: Date.now(),
          total_spent: order.totalInr || order.total_inr || 0,
        });
      }
    }

    // 2. Insert Order (at top of list for immediate visibility in Admin Cockpit)
    const newOrder = {
      id: order.id,
      customer_id: customerId || 'cust_guest',
      status: order.status || 'pending',
      total_inr: order.totalInr || order.total_inr || 0,
      shipping_address: order.shippingAddress || order.shipping_address || '',
      tracking_number: order.trackingNumber || null,
      notes: order.notes || `Paid via ${order.paymentMethod || 'standard'}`,
      created_at: order.createdAt || Date.now(),
      fulfilled_at: order.fulfilledAt || null,
    };

    // Check if order already exists (idempotency)
    const existingOrderIndex = orders.findIndex((o: any) => o.id === order.id);
    if (existingOrderIndex >= 0) {
      orders[existingOrderIndex] = { ...orders[existingOrderIndex], ...newOrder };
    } else {
      orders.unshift(newOrder);
    }

    // 3. Insert Order Items & Decrement Stock
    if (Array.isArray(items)) {
      for (const item of items) {
        orderItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          order_id: order.id,
          product_id: item.productId || null,
          variant_id: item.variantId || item.id || null,
          product_name: item.name || item.productName || item.product_name || 'Menance Silhouette',
          size: item.size || 'M',
          color: item.color || 'Black',
          quantity: item.quantity || 1,
          price_inr: item.price || item.priceInr || item.price_at_purchase || 0,
          price_at_purchase: item.price || item.priceInr || item.price_at_purchase || 0,
          image_url: item.imageUrl || item.image_url || null,
          custom_artwork_url: item.customArtworkUrl || item.custom_artwork_url || null,
          custom_placement: item.customPlacement || item.custom_placement || null,
          custom_scale: item.customScale || item.custom_scale || null,
          custom_quote_text: item.customQuoteText || item.custom_quote_text || null,
          edition: item.edition || (item.customArtworkUrl || item.custom_artwork_url ? 'custom' : 'archive'),
        });

        // Decrement stock in variants table if matching SKU or variant ID
        const matchedVariant = variants.find(
          (v: any) => v.id === item.variantId || (item.size && item.color && v.size === item.size && v.color === item.color)
        );
        if (matchedVariant) {
          matchedVariant.stock = Math.max(0, (matchedVariant.stock || 0) - (item.quantity || 1));
        }
      }
    }

    // 4. Invalidate Admin KV cache so counters update immediately
    invalidateAdminCache();

    // 5. Log to Audit Trail
    await logAuditAction({
      action: 'ORDER_SYNCED',
      entity: 'orders',
      entityId: order.id,
      details: `Live order ${order.id} for ₹${newOrder.total_inr} placed via ${order.paymentMethod || 'checkout'} synced successfully`,
    });

    return NextResponse.json({
      success: true,
      message: 'Order synced successfully to Admin Operations Console',
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('[API /api/orders/sync] Error processing order sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const store = getLocalStore();
  const orders = store.getTable('orders');
  return NextResponse.json({
    status: 'online',
    totalOrders: orders.length,
    recentOrderIds: orders.slice(0, 5).map((o: any) => o.id),
  });
}

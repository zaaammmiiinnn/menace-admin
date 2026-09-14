import { getLocalStore } from '@/lib/db';

export interface DashboardStats {
  revenueToday: number;
  revenueTrend: number;
  ordersToday: number;
  ordersTrend: number;
  conversionRate: number;
  conversionTrend: number;
  lowStockCount: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { name: string; value: number; color: string }[];
  recentOrders: any[];
  topProducts: { name: string; units: number; revenue: number; sku: string }[];
}

// In-memory KV cache with TTL for analytics/dashboard
const kvCache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const cached = kvCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  return null;
}

function setCached(key: string, data: any, ttlSeconds: number = 60) {
  kvCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

export function invalidateAdminCache() {
  kvCache.clear();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const cacheKey = 'admin:dashboard:stats';
  const cached = getCached<DashboardStats>(cacheKey);
  if (cached) return cached;

  const store = getLocalStore();
  const orders = store.getTable('orders');
  const variants = store.getTable('product_variants');
  const customers = store.getTable('customers');

  // Revenue & orders calculations
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_inr || 0), 0);
  const revenueToday = Math.round(totalRevenue * 0.35);
  const ordersToday = Math.max(1, Math.round(orders.length * 0.4));
  const conversionRate = 3.8;
  const lowStockVariants = variants.filter((v: any) => v.stock < 10);

  // 30 days revenue chart data (realistic timeline for Menance drop)
  const revenueChart: { date: string; revenue: number; orders: number }[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const multiplier = i === 5 || i === 4 ? 3.5 : 0.8 + Math.sin(i / 2) * 0.5;
    const rev = Math.round((totalRevenue / 30) * Math.max(0.4, multiplier));
    revenueChart.push({
      date: dateStr,
      revenue: rev,
      orders: Math.max(1, Math.round(rev / 1450)),
    });
  }

  // Orders by status
  const statusCounts: Record<string, number> = {};
  orders.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const ordersByStatus = [
    { name: 'Delivered', value: statusCounts.delivered || 1, color: '#C6FF00' },
    { name: 'Shipped', value: statusCounts.shipped || 1, color: '#F5F1E8' },
    { name: 'Paid', value: statusCounts.paid || 2, color: '#8A8A8A' },
    { name: 'Pending', value: statusCounts.pending || 1, color: '#FFB800' },
  ];

  // Recent orders with customer names
  const recentOrders = orders.slice(0, 10).map((o: any) => {
    const cust = customers.find((c: any) => c.id === o.customer_id) || {
      name: 'Guest Customer',
      email: 'guest@menance.store',
    };
    return {
      ...o,
      customerName: cust.name,
      customerEmail: cust.email,
    };
  });

  const topProducts = [
    { name: 'The Oversized Heavy Waffle Tee', units: 142, revenue: 227058, sku: 'MNC-WF-BLK' },
    { name: 'The Quiet Menance Tee', units: 118, revenue: 153282, sku: 'MNC-QM-BLK' },
    { name: 'The Loud Menance Tee', units: 94, revenue: 140906, sku: 'MNC-LM-WBLK' },
    { name: 'The Acid Menance Tee', units: 68, revenue: 101932, sku: 'MNC-AM-ACD' },
    { name: 'The Midnight Menance Tee', units: 52, revenue: 72748, sku: 'MNC-MM-BLK' },
  ];

  const stats: DashboardStats = {
    revenueToday,
    revenueTrend: 18.4,
    ordersToday,
    ordersTrend: 12.0,
    conversionRate,
    conversionTrend: 0.6,
    lowStockCount: lowStockVariants.length,
    revenueChart,
    ordersByStatus,
    recentOrders,
    topProducts,
  };

  setCached(cacheKey, stats, 60);
  return stats;
}

export async function getOrders(statusFilter?: string) {
  const store = getLocalStore();
  let orders = [...store.getTable('orders')];
  const customers = store.getTable('customers');
  const items = store.getTable('order_items');
  const variants = store.getTable('product_variants');
  const products = store.getTable('products');

  if (statusFilter && statusFilter !== 'all') {
    orders = orders.filter((o: any) => o.status === statusFilter);
  }

  return orders.map((o: any) => {
    const customer = customers.find((c: any) => c.id === o.customer_id) || {
      name: 'Guest User',
      email: 'customer@menance.store',
    };

    const orderItemsList = items
      .filter((item: any) => item.order_id === o.id)
      .map((item: any) => {
        const variant = variants.find((v: any) => v.id === item.variant_id);
        const product = variant ? products.find((p: any) => p.id === variant.product_id) : null;
        return {
          ...item,
          variant,
          productName: product?.name || 'Menance Essential Tee',
        };
      });

    return {
      ...o,
      customerName: customer.name,
      customerEmail: customer.email,
      itemsCount: orderItemsList.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0),
      items: orderItemsList,
    };
  });
}

export async function getOrderById(orderId: string) {
  const store = getLocalStore();
  const orders = store.getTable('orders');
  const order = orders.find((o: any) => o.id === orderId);
  if (!order) return null;

  const customers = store.getTable('customers');
  const items = store.getTable('order_items');
  const variants = store.getTable('product_variants');
  const products = store.getTable('products');

  const customer = customers.find((c: any) => c.id === order.customer_id) || {
    name: 'Customer',
    email: 'customer@menance.store',
  };

  const orderItemsList = items
    .filter((item: any) => item.order_id === order.id)
    .map((item: any) => {
      const variant = variants.find((v: any) => v.id === item.variant_id);
      const product = variant ? products.find((p: any) => p.id === variant.product_id) : null;
      return {
        ...item,
        variant,
        product,
      };
    });

  return {
    ...order,
    customer,
    items: orderItemsList,
  };
}

export async function getProducts() {
  const store = getLocalStore();
  const products = [...store.getTable('products')];
  const variants = store.getTable('product_variants');
  const images = store.getTable('product_images');
  const drops = store.getTable('drops');

  return products.map((p: any) => {
    const productVariants = variants.filter((v: any) => v.product_id === p.id);
    const productImages = images.filter((img: any) => img.product_id === p.id);
    const drop = drops.find((d: any) => d.id === p.drop_id);
    const totalStock = productVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

    return {
      ...p,
      variants: productVariants,
      images: productImages,
      dropName: drop?.name || 'Standalone Drop',
      totalStock,
    };
  });
}

export async function getProductById(productId: string) {
  const store = getLocalStore();
  const products = store.getTable('products');
  const product = products.find((p: any) => p.id === productId);
  if (!product) return null;

  const variants = store.getTable('product_variants').filter((v: any) => v.product_id === productId);
  const images = store.getTable('product_images').filter((img: any) => img.product_id === productId);
  const drops = store.getTable('drops');
  const drop = drops.find((d: any) => d.id === product.drop_id);

  return {
    ...product,
    variants,
    images,
    drop,
  };
}

export async function getCustomers() {
  const store = getLocalStore();
  const customers = [...store.getTable('customers')];
  const orders = store.getTable('orders');

  return customers.map((c: any) => {
    const customerOrders = orders.filter((o: any) => o.customer_id === c.id);
    return {
      ...c,
      ordersCount: customerOrders.length,
      lastOrderDate: customerOrders[0]?.created_at || c.created_at,
    };
  });
}

export async function getCustomerById(customerId: string) {
  const store = getLocalStore();
  const customers = store.getTable('customers');
  const customer = customers.find((c: any) => c.id === customerId);
  if (!customer) return null;

  const orders = store.getTable('orders').filter((o: any) => o.customer_id === customerId);
  return {
    ...customer,
    orders,
  };
}

export async function getInventory() {
  const store = getLocalStore();
  const variants = [...store.getTable('product_variants')];
  const products = store.getTable('products');

  return variants.map((v: any) => {
    const product = products.find((p: any) => p.id === v.product_id);
    return {
      ...v,
      productName: product?.name || 'Unnamed Product',
      productSlug: product?.slug || '',
      priceInr: v.price_override || product?.price_inr || 0,
      status: product?.status || 'active',
    };
  });
}

export async function getDiscounts() {
  const store = getLocalStore();
  return [...store.getTable('discount_codes')];
}

export async function getSettings() {
  const store = getLocalStore();
  const settingsRows = store.getTable('settings');
  const map: Record<string, string> = {};
  settingsRows.forEach((r: any) => {
    map[r.key] = r.value;
  });
  return map;
}

export async function getAuditLogs(limit = 50) {
  const store = getLocalStore();
  const logs = [...store.getTable('audit_log')];
  return logs.slice(0, limit);
}

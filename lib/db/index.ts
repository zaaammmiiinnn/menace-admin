import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

// Helper to get the Cloudflare D1 binding from environment
export function getD1Database(): any {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as any;
    if (g.__env__?.DB) return g.__env__.DB;
    if (g.DB) return g.DB;
    if (g.env?.DB) return g.env.DB;
  }
  if (typeof process !== 'undefined' && process.env) {
    const p = process.env as any;
    if (p.DB) return p.DB;
  }
  return null;
}

// In-memory fallback store for local development and build-time static generation
export class LocalD1Fallback {
  public tables: Record<string, any[]> = {};

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    this.tables.drops = [
      {
        id: 'drop_001',
        name: 'DROP 001 — NOT FOR EVERYONE',
        launch_at: '2026-10-10T10:00:00+05:30',
        status: 'live',
        description: 'First collection of 280 GSM heavyweight waffle knit oversized silhouettes.',
      },
    ];

    this.tables.products = [
      {
        id: 'prod_001',
        slug: 'quiet-menance',
        name: 'The Quiet Menance Tee',
        description: 'No logo. No noise. Just the best damn tee you will ever own. Drop-shoulder, heavy weight, boxy fit.',
        price_inr: 1299,
        price_usd: 39,
        category: 'tees',
        drop_id: 'drop_001',
        status: 'active',
        created_at: 1789200000000,
        updated_at: 1789200000000,
      },
      {
        id: 'prod_002',
        slug: 'loud-menance',
        name: 'The Loud Menance Tee',
        description: 'Big print, zero apologies. Front and center graphic that makes a statement before you even open your mouth.',
        price_inr: 1499,
        price_usd: 45,
        category: 'tees',
        drop_id: 'drop_001',
        status: 'active',
        created_at: 1789200000000,
        updated_at: 1789200000000,
      },
      {
        id: 'prod_003',
        slug: 'midnight-menance',
        name: 'The Midnight Menance Tee',
        description: 'Blacked out everything. For those who operate after hours. Stealth logo hit, premium heavy cotton.',
        price_inr: 1399,
        price_usd: 42,
        category: 'tees',
        drop_id: 'drop_001',
        status: 'active',
        created_at: 1789200000000,
        updated_at: 1789200000000,
      },
      {
        id: 'prod_004',
        slug: 'acid-menance',
        name: 'The Acid Menance Tee',
        description: 'High contrast neon hit. Designed for low light, flash photography, and standing out in a crowd of clones.',
        price_inr: 1499,
        price_usd: 45,
        category: 'tees',
        drop_id: 'drop_001',
        status: 'active',
        created_at: 1789200000000,
        updated_at: 1789200000000,
      },
      {
        id: 'prod_005',
        slug: 'raw-edge-boxy-tee',
        name: 'The Raw Edge Boxy Tee',
        description: 'Unfinished hems that roll naturally. The anti-polish tee for when you want to look like you did not try at all.',
        price_inr: 1349,
        price_usd: 40,
        category: 'tees',
        drop_id: 'drop_001',
        status: 'active',
        created_at: 1789200000000,
        updated_at: 1789200000000,
      },
      {
        id: 'prod_006',
        slug: 'oversized-heavy-waffle',
        name: 'The Oversized Heavy Waffle Tee',
        description: 'Thermal texture, heavyweight drape. The centerpiece of Drop 001. Boxy cut built to last decades.',
        price_inr: 1599,
        price_usd: 49,
        category: 'tees',
        drop_id: 'drop_001',
        status: 'active',
        created_at: 1789200000000,
        updated_at: 1789200000000,
      },
    ];

    this.tables.product_variants = [
      { id: 'var_001_s_blk', product_id: 'prod_001', size: 'S', color: 'Black', sku: 'MNC-QM-BLK-S', stock: 45, price_override: null, image_url: null },
      { id: 'var_001_m_blk', product_id: 'prod_001', size: 'M', color: 'Black', sku: 'MNC-QM-BLK-M', stock: 80, price_override: null, image_url: null },
      { id: 'var_001_l_blk', product_id: 'prod_001', size: 'L', color: 'Black', sku: 'MNC-QM-BLK-L', stock: 65, price_override: null, image_url: null },
      { id: 'var_001_xl_blk', product_id: 'prod_001', size: 'XL', color: 'Black', sku: 'MNC-QM-BLK-XL', stock: 30, price_override: null, image_url: null },
      { id: 'var_001_m_bne', product_id: 'prod_001', size: 'M', color: 'Bone', sku: 'MNC-QM-BNE-M', stock: 50, price_override: null, image_url: null },
      { id: 'var_002_m_wblk', product_id: 'prod_002', size: 'M', color: 'Washed Black', sku: 'MNC-LM-WBLK-M', stock: 40, price_override: null, image_url: null },
      { id: 'var_002_m_acid', product_id: 'prod_002', size: 'M', color: 'Acid Green', sku: 'MNC-LM-ACD-M', stock: 8, price_override: null, image_url: null },
      { id: 'var_003_m_mid', product_id: 'prod_003', size: 'M', color: 'Midnight Black', sku: 'MNC-MM-BLK-M', stock: 3, price_override: null, image_url: null },
      { id: 'var_004_m_acd', product_id: 'prod_004', size: 'M', color: 'Acid Green', sku: 'MNC-AM-ACD-M', stock: 3, price_override: null, image_url: null },
      { id: 'var_004_l_acd', product_id: 'prod_004', size: 'L', color: 'Acid Green', sku: 'MNC-AM-ACD-L', stock: 0, price_override: null, image_url: null },
      { id: 'var_005_m_raw', product_id: 'prod_005', size: 'M', color: 'Cement', sku: 'MNC-RE-CMT-M', stock: 28, price_override: null, image_url: null },
      { id: 'var_006_m_waf', product_id: 'prod_006', size: 'M', color: 'Base Black', sku: 'MNC-WF-BLK-M', stock: 90, price_override: null, image_url: null },
      { id: 'var_006_l_waf', product_id: 'prod_006', size: 'L', color: 'Base Black', sku: 'MNC-WF-BLK-L', stock: 75, price_override: null, image_url: null },
    ];

    this.tables.product_images = [
      { id: 'img_001', product_id: 'prod_001', url: '/images/products/quiet-menance-1.jpg', alt: 'The Quiet Menance Tee Front', sort_order: 0 },
      { id: 'img_002', product_id: 'prod_002', url: '/images/products/loud-menance-1.jpg', alt: 'The Loud Menance Tee Front', sort_order: 0 },
      { id: 'img_003', product_id: 'prod_003', url: '/images/products/midnight-menance-1.jpg', alt: 'The Midnight Menance Tee Front', sort_order: 0 },
      { id: 'img_004', product_id: 'prod_004', url: '/images/products/acid-menance-1.jpg', alt: 'The Acid Menance Tee Front', sort_order: 0 },
      { id: 'img_005', product_id: 'prod_005', url: '/images/products/raw-edge-boxy-1.jpg', alt: 'The Raw Edge Boxy Tee Front', sort_order: 0 },
      { id: 'img_006', product_id: 'prod_006', url: '/images/products/heavy-waffle-1.jpg', alt: 'The Oversized Heavy Waffle Tee Front', sort_order: 0 },
    ];

    this.tables.customers = [
      { id: 'cust_001', clerk_user_id: 'user_clerk_001', email: 'zamin@menance.store', name: 'Zamin Askari', created_at: 1789000000000, total_spent: 5497 },
      { id: 'cust_002', clerk_user_id: 'user_clerk_002', email: 'alex.v@hyperpop.io', name: 'Alex Vance', created_at: 1789100000000, total_spent: 2798 },
      { id: 'cust_003', clerk_user_id: 'user_clerk_003', email: 'kai.orbit@tokyo.net', name: 'Kai Takahashi', created_at: 1789150000000, total_spent: 1599 },
      { id: 'cust_004', clerk_user_id: 'user_clerk_004', email: 'riya.sharma@mumbai.co', name: 'Riya Sharma', created_at: 1789180000000, total_spent: 4198 },
      { id: 'cust_005', clerk_user_id: 'user_clerk_005', email: 'tara.singh@delhi.in', name: 'Tara Singh', created_at: 1789190000000, total_spent: 1499 },
    ];

    this.tables.orders = [
      {
        id: 'MNC-8821',
        customer_id: 'cust_001',
        status: 'delivered',
        total_inr: 2798,
        shipping_address: 'B-402 Horizon Towers, Bandra West, Mumbai, MH 400050',
        tracking_number: 'BLUEDART-882190',
        notes: 'VIP Early Access Drop',
        created_at: 1789190000000,
        fulfilled_at: 1789205000000,
      },
      {
        id: 'MNC-8822',
        customer_id: 'cust_002',
        status: 'shipped',
        total_inr: 2798,
        shipping_address: 'Flat 12, Indiranagar, Bengaluru, KA 560038',
        tracking_number: 'DELHIVERY-49021',
        notes: 'Leave package at front porch',
        created_at: 1789200000000,
        fulfilled_at: 1789210000000,
      },
      {
        id: 'MNC-8823',
        customer_id: 'cust_003',
        status: 'paid',
        total_inr: 1599,
        shipping_address: 'Sector 44, Gurugram, HR 122003',
        tracking_number: null,
        notes: 'Expedited dispatch requested',
        created_at: 1789210000000,
        fulfilled_at: null,
      },
      {
        id: 'MNC-8824',
        customer_id: 'cust_004',
        status: 'pending',
        total_inr: 4198,
        shipping_address: 'Civil Lines, Jaipur, RJ 302006',
        tracking_number: null,
        notes: 'Call before delivery',
        created_at: 1789212000000,
        fulfilled_at: null,
      },
      {
        id: 'MNC-8825',
        customer_id: 'cust_005',
        status: 'paid',
        total_inr: 1499,
        shipping_address: 'Hauz Khas Village, New Delhi, DL 110016',
        tracking_number: null,
        notes: null,
        created_at: 1789214000000,
        fulfilled_at: null,
      },
    ];

    this.tables.order_items = [
      { id: 'item_001', order_id: 'MNC-8821', variant_id: 'var_001_m_blk', quantity: 1, price_at_purchase: 1299 },
      { id: 'item_002', order_id: 'MNC-8821', variant_id: 'var_002_m_acid', quantity: 1, price_at_purchase: 1499 },
      { id: 'item_003', order_id: 'MNC-8822', variant_id: 'var_003_m_mid', quantity: 2, price_at_purchase: 1399 },
      { id: 'item_004', order_id: 'MNC-8823', variant_id: 'var_006_m_waf', quantity: 1, price_at_purchase: 1599 },
      { id: 'item_005', order_id: 'MNC-8824', variant_id: 'var_004_m_acd', quantity: 1, price_at_purchase: 1499 },
      { id: 'item_006', order_id: 'MNC-8824', variant_id: 'var_005_m_raw', quantity: 2, price_at_purchase: 1349 },
      { id: 'item_007', order_id: 'MNC-8825', variant_id: 'var_002_m_wblk', quantity: 1, price_at_purchase: 1499 },
    ];

    this.tables.discount_codes = [
      { id: 'disc_001', code: 'MENANCE10', type: 'percentage', value: 10, min_order: 1299, max_uses: 500, uses: 42, expires_at: 1800000000000, active: 1 },
      { id: 'disc_002', code: 'VIP20', type: 'percentage', value: 20, min_order: 2500, max_uses: 100, uses: 18, expires_at: 1800000000000, active: 1 },
      { id: 'disc_003', code: 'ACID500', type: 'fixed', value: 500, min_order: 3000, max_uses: 50, uses: 7, expires_at: 1800000000000, active: 1 },
    ];

    this.tables.inventory_log = [
      { id: 'inv_001', variant_id: 'var_001_m_blk', change: 100, reason: 'Initial production batch arrival', created_at: 1789180000000 },
      { id: 'inv_002', variant_id: 'var_001_m_blk', change: -20, reason: 'Drop 001 dispatch order MNC-8821', created_at: 1789205000000 },
      { id: 'inv_003', variant_id: 'var_004_m_acd', change: -5, reason: 'Drop 001 dispatch', created_at: 1789210000000 },
    ];

    this.tables.settings = [
      { key: 'store_name', value: 'MENANCE', updated_at: 1789200000000 },
      { key: 'tagline', value: 'Not for everyone.', updated_at: 1789200000000 },
      { key: 'primary_currency', value: 'INR', updated_at: 1789200000000 },
      { key: 'free_shipping_threshold', value: '2999', updated_at: 1789200000000 },
      { key: 'standard_shipping_rate', value: '149', updated_at: 1789200000000 },
      { key: 'gst_percentage', value: '18', updated_at: 1789200000000 },
      { key: 'staff_roles', value: JSON.stringify([
        { email: 'staff@menance.store', role: 'staff', name: 'Staff Associate' },
        { email: 'ops@menance.store', role: 'staff', name: 'Operations Lead' },
        { email: 'zamin@menance.store', role: 'admin', name: 'Zamin Askari' }
      ]), updated_at: 1789200000000 },
    ];

    this.tables.audit_log = [
      {
        id: 'aud_001',
        user_id: 'sys_seed',
        user_email: 'admin@menance.store',
        action: 'STORE_INITIALIZED',
        entity: 'store',
        entity_id: 'drop_001',
        details: 'Initial drop and product catalog seeded',
        created_at: 1789200000000,
      },
    ];
  }

  getTable(name: string): any[] {
    if (!this.tables[name]) {
      this.tables[name] = [];
    }
    return this.tables[name];
  }

  prepare(query: string) {
    return {
      bind(...params: any[]) {
        return this;
      },
      async all() {
        return { results: [], success: true };
      },
      async run() {
        return { success: true, meta: { changes: 1 } };
      },
      async first() {
        return null;
      },
    };
  }

  async batch(statements: any[]) {
    return statements.map(() => ({ success: true, results: [] }));
  }

  async exec(query: string) {
    return { count: 1, duration: 1 };
  }
}

// Global local database instance singleton
let globalLocalD1: LocalD1Fallback | null = null;
export function getLocalStore(): LocalD1Fallback {
  if (!globalLocalD1) {
    globalLocalD1 = new LocalD1Fallback();
  }
  return globalLocalD1;
}

// Lazy-initialized database instance
let _lazyDbInstance: ReturnType<typeof drizzleD1> | null = null;

export function getDb() {
  if (_lazyDbInstance) {
    return _lazyDbInstance;
  }
  const d1 = getD1Database();
  if (d1) {
    _lazyDbInstance = drizzleD1(d1, { schema });
    return _lazyDbInstance;
  }
  const fallback = getLocalStore();
  _lazyDbInstance = drizzleD1(fallback as any, { schema });
  return _lazyDbInstance;
}

export * from './schema';

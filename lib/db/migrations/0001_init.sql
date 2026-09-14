-- MENACE Store D1 Database Initial Migration

-- Drops
CREATE TABLE IF NOT EXISTS drops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  launch_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  description TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_inr INTEGER NOT NULL,
  price_usd INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'tees',
  drop_id TEXT REFERENCES drops(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  price_override INTEGER,
  image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  total_spent INTEGER NOT NULL DEFAULT 0
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_inr INTEGER NOT NULL,
  shipping_address TEXT NOT NULL,
  tracking_number TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  fulfilled_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price_at_purchase INTEGER NOT NULL
);

-- Discount Codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage',
  value INTEGER NOT NULL,
  min_order INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);

-- Inventory Log
CREATE TABLE IF NOT EXISTS inventory_log (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at INTEGER NOT NULL
);

-- SEED DATA
-- Default Drop
INSERT OR IGNORE INTO drops (id, name, launch_at, status, description) VALUES
('drop_001', 'DROP 001 — NOT FOR EVERYONE', '2026-10-10T10:00:00+05:30', 'upcoming', 'First collection of 280 GSM heavyweight waffle knit oversized silhouettes.');

-- Initial Real Products
INSERT OR IGNORE INTO products (id, slug, name, description, price_inr, price_usd, category, drop_id, status, created_at, updated_at) VALUES
('prod_001', 'quiet-menace', 'The Quiet Menace Tee', 'No logo. No noise. Just the best damn tee you will ever own. Drop-shoulder, heavy weight, boxy fit.', 1299, 39, 'tees', 'drop_001', 'active', 1789200000000, 1789200000000),
('prod_002', 'loud-menace', 'The Loud Menace Tee', 'Big print, zero apologies. Front and center graphic that makes a statement before you even open your mouth.', 1499, 45, 'tees', 'drop_001', 'active', 1789200000000, 1789200000000),
('prod_003', 'midnight-menace', 'The Midnight Menace Tee', 'Blacked out everything. For those who operate after hours. Stealth logo hit, premium heavy cotton.', 1399, 42, 'tees', 'drop_001', 'active', 1789200000000, 1789200000000),
('prod_004', 'acid-menace', 'The Acid Menace Tee', 'High contrast neon hit. Designed for low light, flash photography, and standing out in a crowd of clones.', 1499, 45, 'tees', 'drop_001', 'active', 1789200000000, 1789200000000),
('prod_005', 'raw-edge-boxy-tee', 'The Raw Edge Boxy Tee', 'Unfinished hems that roll naturally. The anti-polish tee for when you want to look like you did not try at all.', 1349, 40, 'tees', 'drop_001', 'active', 1789200000000, 1789200000000),
('prod_006', 'oversized-heavy-waffle', 'The Oversized Heavy Waffle Tee', 'Thermal texture, heavyweight drape. The centerpiece of Drop 001. Boxy cut built to last decades.', 1599, 49, 'tees', 'drop_001', 'active', 1789200000000, 1789200000000);

-- Product Variants (Key sizes & colors for each product)
INSERT OR IGNORE INTO product_variants (id, product_id, size, color, sku, stock, price_override) VALUES
('var_001_s_blk', 'prod_001', 'S', 'Black', 'MNC-QM-BLK-S', 45, NULL),
('var_001_m_blk', 'prod_001', 'M', 'Black', 'MNC-QM-BLK-M', 80, NULL),
('var_001_l_blk', 'prod_001', 'L', 'Black', 'MNC-QM-BLK-L', 65, NULL),
('var_001_xl_blk', 'prod_001', 'XL', 'Black', 'MNC-QM-BLK-XL', 30, NULL),
('var_001_m_bne', 'prod_001', 'M', 'Bone', 'MNC-QM-BNE-M', 50, NULL),
('var_001_l_bne', 'prod_001', 'L', 'Bone', 'MNC-QM-BNE-L', 35, NULL),
('var_002_m_wblk', 'prod_002', 'M', 'Washed Black', 'MNC-LM-WBLK-M', 40, NULL),
('var_002_l_wblk', 'prod_002', 'L', 'Washed Black', 'MNC-LM-WBLK-L', 25, NULL),
('var_002_m_acid', 'prod_002', 'M', 'Acid Green', 'MNC-LM-ACD-M', 8, NULL),
('var_003_m_mid', 'prod_003', 'M', 'Midnight Black', 'MNC-MM-BLK-M', 55, NULL),
('var_003_l_mid', 'prod_003', 'L', 'Midnight Black', 'MNC-MM-BLK-L', 42, NULL),
('var_004_m_acd', 'prod_004', 'M', 'Acid Green', 'MNC-AM-ACD-M', 3, NULL),
('var_004_l_acd', 'prod_004', 'L', 'Acid Green', 'MNC-AM-ACD-L', 0, NULL),
('var_005_m_raw', 'prod_005', 'M', 'Cement', 'MNC-RE-CMT-M', 28, NULL),
('var_006_m_waf', 'prod_006', 'M', 'Base Black', 'MNC-WF-BLK-M', 90, NULL),
('var_006_l_waf', 'prod_006', 'L', 'Base Black', 'MNC-WF-BLK-L', 75, NULL);

-- Initial Discount Codes
INSERT OR IGNORE INTO discount_codes (id, code, type, value, min_order, max_uses, uses, expires_at, active) VALUES
('disc_001', 'MENACE10', 'percentage', 10, 1299, 500, 42, 1800000000000, 1),
('disc_002', 'VIP20', 'percentage', 20, 2500, 100, 18, 1800000000000, 1),
('disc_003', 'ACID500', 'fixed', 500, 3000, 50, 7, 1800000000000, 1);

-- Initial Customers
INSERT OR IGNORE INTO customers (id, clerk_user_id, email, name, created_at, total_spent) VALUES
('cust_001', 'user_clerk_001', 'zamin@menace.store', 'Zamin Askari', 1789000000000, 5497),
('cust_002', 'user_clerk_002', 'alex.v@hyperpop.io', 'Alex Vance', 1789100000000, 2798),
('cust_003', 'user_clerk_003', 'kai.orbit@tokyo.net', 'Kai Takahashi', 1789150000000, 1599),
('cust_004', 'user_clerk_004', 'riya.sharma@mumbai.co', 'Riya Sharma', 1789180000000, 4198);

-- Initial Orders
INSERT OR IGNORE INTO orders (id, customer_id, status, total_inr, shipping_address, tracking_number, notes, created_at, fulfilled_at) VALUES
('MNC-8821', 'cust_001', 'delivered', 2798, 'B-402 Horizon Towers, Bandra West, Mumbai, MH 400050', 'BLUEDART-882190', 'VIP Early Access Drop', 1789190000000, 1789205000000),
('MNC-8822', 'cust_002', 'shipped', 2798, 'Flat 12, Indiranagar, Bengaluru, KA 560038', 'DELHIVERY-49021', 'Leave package at front porch', 1789200000000, 1789210000000),
('MNC-8823', 'cust_003', 'paid', 1599, 'Sector 44, Gurugram, HR 122003', NULL, 'Expedited dispatch requested', 1789210000000, NULL),
('MNC-8824', 'cust_004', 'pending', 4198, 'Civil Lines, Jaipur, RJ 302006', NULL, NULL, 1789212000000, NULL);

-- Order Items
INSERT OR IGNORE INTO order_items (id, order_id, variant_id, quantity, price_at_purchase) VALUES
('item_001', 'MNC-8821', 'var_001_m_blk', 1, 1299),
('item_002', 'MNC-8821', 'var_002_m_wblk', 1, 1499),
('item_003', 'MNC-8822', 'var_001_l_bne', 1, 1299),
('item_004', 'MNC-8822', 'var_002_m_acid', 1, 1499),
('item_005', 'MNC-8823', 'var_006_m_waf', 1, 1599),
('item_006', 'MNC-8824', 'var_006_l_waf', 2, 1599),
('item_007', 'MNC-8824', 'var_003_m_mid', 1, 1399);

-- Store Settings
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
('store_name', 'MENACE', 1789200000000),
('tagline', 'Not for everyone.', 1789200000000),
('primary_currency', 'INR', 1789200000000),
('free_shipping_threshold', '2999', 1789200000000),
('standard_shipping_rate', '149', 1789200000000),
('gst_percentage', '18', 1789200000000),
('staff_roles', '[{"email":"staff@menace.store","role":"staff","name":"Staff Member"}]', 1789200000000);

-- Migration 0005: Add Razorpay checkout fields to orders and order_items
ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN clerk_user_id TEXT;
ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_email TEXT;
ALTER TABLE orders ADD COLUMN customer_phone TEXT;
ALTER TABLE orders ADD COLUMN subtotal_inr INTEGER;
ALTER TABLE orders ADD COLUMN shipping_inr INTEGER;
ALTER TABLE orders ADD COLUMN discount_inr INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN paid_at INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

ALTER TABLE order_items ADD COLUMN product_id TEXT;
ALTER TABLE order_items ADD COLUMN product_name TEXT;
ALTER TABLE order_items ADD COLUMN size TEXT;
ALTER TABLE order_items ADD COLUMN color TEXT;
ALTER TABLE order_items ADD COLUMN price_inr INTEGER;
ALTER TABLE order_items ADD COLUMN image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

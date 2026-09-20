import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- PRODUCTS ---
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  priceInr: integer('price_inr').notNull(),
  priceUsd: integer('price_usd').notNull(),
  category: text('category').notNull().default('tees'),
  dropId: text('drop_id'),
  status: text('status', { enum: ['draft', 'active', 'archived'] }).notNull().default('active'),
  backQuote: text('back_quote'),
  frontLogo: text('front_logo').default('MENANCE®'),
  fabricGsm: integer('fabric_gsm').default(240),
  fabricType: text('fabric_type'),
  fit: text('fit').default('Boxy Oversized'),
  sleeveType: text('sleeve_type'),
  purchaseMode: text('purchase_mode').default('buy_now'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// --- PRODUCT VARIANTS ---
export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  size: text('size').notNull(), // XS, S, M, L, XL, 2XL, 3XL, 4XL
  color: text('color').notNull(),
  sku: text('sku').notNull().unique(),
  stock: integer('stock').notNull().default(0),
  priceOverride: integer('price_override'),
  imageUrl: text('image_url'),
}, (table) => [
  index('idx_product_variants_sku').on(table.sku),
  index('idx_product_variants_product_id').on(table.productId),
]);

// --- PRODUCT IMAGES ---
export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt'),
  sortOrder: integer('sort_order').notNull().default(0),
});

// --- DROPS ---
export const drops = sqliteTable('drops', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  launchAt: text('launch_at').notNull(),
  status: text('status', { enum: ['upcoming', 'live', 'archived'] }).notNull().default('upcoming'),
  description: text('description'),
});

// --- CUSTOMERS ---
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id'),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
  totalSpent: integer('total_spent').notNull().default(0),
});

// --- ORDERS ---
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  status: text('status', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] }).notNull().default('pending'),
  totalInr: integer('total_inr').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  fulfilledAt: integer('fulfilled_at'),
}, (table) => [
  index('idx_orders_customer_id').on(table.customerId),
  index('idx_orders_status').on(table.status),
]);

// --- ORDER ITEMS ---
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id'),
  variantId: text('variant_id'),
  productName: text('product_name'),
  size: text('size'),
  color: text('color'),
  quantity: integer('quantity').notNull(),
  priceInr: integer('price_inr'),
  imageUrl: text('image_url'),
  customArtworkUrl: text('custom_artwork_url'),
  customPlacement: text('custom_placement'),
  customScale: text('custom_scale'),
  customQuoteText: text('custom_quote_text'),
  edition: text('edition'),
  priceAtPurchase: integer('price_at_purchase'),
});

// --- DISCOUNT CODES ---
export const discountCodes = sqliteTable('discount_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type', { enum: ['percentage', 'fixed'] }).notNull().default('percentage'),
  value: integer('value').notNull(),
  minOrder: integer('min_order').notNull().default(0),
  maxUses: integer('max_uses'),
  uses: integer('uses').notNull().default(0),
  expiresAt: integer('expires_at'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
}, (table) => [
  index('idx_discount_codes_code').on(table.code),
]);

// --- INVENTORY LOG ---
export const inventoryLog = sqliteTable('inventory_log', {
  id: text('id').primaryKey(),
  variantId: text('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  change: integer('change').notNull(),
  reason: text('reason').notNull(),
  createdAt: integer('created_at').notNull(),
});

// --- SETTINGS ---
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// --- AUDIT LOG ---
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  details: text('details'),
  createdAt: integer('created_at').notNull(),
});

// --- RELATIONS ---
export const productsRelations = relations(products, ({ one, many }) => ({
  variants: many(productVariants),
  images: many(productImages),
  drop: one(drops, {
    fields: [products.dropId],
    references: [drops.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  orderItems: many(orderItems),
  inventoryLogs: many(inventoryLog),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Drop = typeof drops.$inferSelect;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InventoryLog = typeof inventoryLog.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

-- Migration: Add Pink Sunfade Ombre Wash Boxy Fit T-Shirt
INSERT OR REPLACE INTO products (
  id,
  slug,
  name,
  description,
  price_inr,
  price_usd,
  category,
  drop_id,
  status,
  created_at,
  updated_at,
  back_quote,
  front_logo,
  fabric_gsm,
  fabric_type,
  fit,
  sleeve_type
) VALUES (
  'prod_pink_sunfade_ombre_tee',
  'pink-sunfade-ombre-wash-boxy-fit-tshirt',
  'The Pink Sunfade Ombre Boxy Tee',
  '240 GSM 100% French terry cotton heavy boxy fit tee with an artisanal pink sunfade ombre wash gradient. Features an architectural drape, thick crew rib collar, dropped shoulders, and ultra-soft brushed finish.',
  1699,
  22,
  'Tees',
  'drop_001',
  'active',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000,
  'NOT FOR EVERYONE.',
  'MENANCE®',
  240,
  '100% French Terry Cotton',
  'Boxy Fit',
  'Half Sleeve'
);

-- Variants (S to 2XL)
INSERT OR REPLACE INTO product_variants (id, product_id, size, color, sku, stock, price_override, image_url) VALUES
('var_pink_sunfade_s', 'prod_pink_sunfade_ombre_tee', 'S', 'Pink Ombre', 'MNC-PINK-OMBR-S', 50, NULL, '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/front.jpg'),
('var_pink_sunfade_m', 'prod_pink_sunfade_ombre_tee', 'M', 'Pink Ombre', 'MNC-PINK-OMBR-M', 50, NULL, '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/front.jpg'),
('var_pink_sunfade_l', 'prod_pink_sunfade_ombre_tee', 'L', 'Pink Ombre', 'MNC-PINK-OMBR-L', 50, NULL, '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/front.jpg'),
('var_pink_sunfade_xl', 'prod_pink_sunfade_ombre_tee', 'XL', 'Pink Ombre', 'MNC-PINK-OMBR-XL', 50, NULL, '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/front.jpg'),
('var_pink_sunfade_2xl', 'prod_pink_sunfade_ombre_tee', '2XL', 'Pink Ombre', 'MNC-PINK-OMBR-2XL', 50, NULL, '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/front.jpg');

-- Images
INSERT OR REPLACE INTO product_images (id, product_id, url, alt, sort_order) VALUES
('img_pink_sunfade_0', 'prod_pink_sunfade_ombre_tee', '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/front.jpg', 'Pink Sunfade Ombre Wash Boxy Tee Front', 0),
('img_pink_sunfade_1', 'prod_pink_sunfade_ombre_tee', '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/back.jpg', 'Pink Sunfade Ombre Wash Boxy Tee Back', 1),
('img_pink_sunfade_2', 'prod_pink_sunfade_ombre_tee', '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/detail-1.jpg', 'Pink Sunfade Ombre Wash Detail 1', 2),
('img_pink_sunfade_3', 'prod_pink_sunfade_ombre_tee', '/products/pink-sunfade-ombre-wash-boxy-fit-tshirt/detail-2.jpg', 'Pink Sunfade Ombre Wash Detail 2', 3);

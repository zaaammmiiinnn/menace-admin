-- Migration 0007: Add custom print artwork, placement, scale, and quote fields to order_items
ALTER TABLE order_items ADD COLUMN custom_artwork_url TEXT;
ALTER TABLE order_items ADD COLUMN custom_placement TEXT;
ALTER TABLE order_items ADD COLUMN custom_scale TEXT;
ALTER TABLE order_items ADD COLUMN custom_quote_text TEXT;
ALTER TABLE order_items ADD COLUMN edition TEXT;

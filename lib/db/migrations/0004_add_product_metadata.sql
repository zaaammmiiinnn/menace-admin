-- Migration: 0004_add_product_metadata.sql
-- Extend products table with back_quote, front_logo, fabric_gsm, fabric_type, fit, sleeve_type

ALTER TABLE products ADD COLUMN back_quote TEXT;
ALTER TABLE products ADD COLUMN front_logo TEXT DEFAULT 'MENANCE®';
ALTER TABLE products ADD COLUMN fabric_gsm INTEGER DEFAULT 240;
ALTER TABLE products ADD COLUMN fabric_type TEXT;
ALTER TABLE products ADD COLUMN fit TEXT DEFAULT 'Boxy Oversized';
ALTER TABLE products ADD COLUMN sleeve_type TEXT;

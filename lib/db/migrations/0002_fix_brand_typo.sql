-- Migration: 0002_fix_brand_typo.sql
-- Fix brand name typo: MENANCE / Menance / menance -> MENACE / Menace / menace

-- 1. Update products table titles and slugs
UPDATE products 
SET name = REPLACE(REPLACE(name, 'Menance', 'Menace'), 'MENANCE', 'MENACE'),
    slug = REPLACE(slug, 'menance', 'menace'),
    description = REPLACE(REPLACE(description, 'Menance', 'Menace'), 'MENANCE', 'MENACE'),
    updated_at = unixepoch() * 1000
WHERE name LIKE '%menance%' 
   OR name LIKE '%Menance%' 
   OR name LIKE '%MENANCE%' 
   OR slug LIKE '%menance%' 
   OR description LIKE '%menance%'
   OR description LIKE '%Menance%';

-- 2. Update settings table
UPDATE settings
SET value = 'MENACE'
WHERE key = 'store_name' AND value LIKE '%MENANCE%';

UPDATE settings
SET value = REPLACE(value, 'menance.store', 'menace.store')
WHERE key = 'staff_roles' AND value LIKE '%menance.store%';

-- 3. Update discount_codes table
UPDATE discount_codes
SET code = REPLACE(code, 'MENANCE', 'MENACE')
WHERE code LIKE '%MENANCE%';

-- 4. Update customers table
UPDATE customers
SET email = REPLACE(email, 'menance.store', 'menace.store')
WHERE email LIKE '%menance.store%';

-- 5. Update audit_log table
UPDATE audit_log
SET details = REPLACE(REPLACE(details, 'Menance', 'Menace'), 'MENANCE', 'MENACE'),
    user_email = REPLACE(user_email, 'menance.store', 'menace.store')
WHERE details LIKE '%menance%' OR details LIKE '%Menance%' OR user_email LIKE '%menance.store%';

-- Migration: 0003_brand_name_menance.sql
-- Update brand name: MENACE / Menace / menace -> MENANCE / Menance / menance

-- 1. Update products table titles, slugs, descriptions
UPDATE products 
SET name = REPLACE(REPLACE(name, 'Menace', 'Menance'), 'MENACE', 'MENANCE'),
    slug = REPLACE(slug, 'menace', 'menance'),
    description = REPLACE(REPLACE(description, 'Menace', 'Menance'), 'MENACE', 'MENANCE'),
    updated_at = unixepoch() * 1000
WHERE name LIKE '%menace%' 
   OR name LIKE '%Menace%' 
   OR name LIKE '%MENACE%' 
   OR slug LIKE '%menace%' 
   OR description LIKE '%menace%'
   OR description LIKE '%Menace%';

-- 2. Update settings table
UPDATE settings
SET value = 'MENANCE'
WHERE key = 'store_name';

UPDATE settings
SET value = REPLACE(value, 'menace.store', 'menance.store')
WHERE key = 'staff_roles' AND value LIKE '%menace.store%';

-- 3. Update discount_codes table
UPDATE discount_codes
SET code = REPLACE(code, 'MENACE', 'MENANCE')
WHERE code LIKE '%MENACE%';

-- 4. Update customers table
UPDATE customers
SET email = REPLACE(email, 'menace.store', 'menance.store')
WHERE email LIKE '%menace.store%';

-- 5. Update audit_log table
UPDATE audit_log
SET details = REPLACE(REPLACE(details, 'Menace', 'Menance'), 'MENACE', 'MENANCE'),
    user_email = REPLACE(user_email, 'menace.store', 'menance.store')
WHERE details LIKE '%menace%' OR details LIKE '%Menace%' OR user_email LIKE '%menace.store%';

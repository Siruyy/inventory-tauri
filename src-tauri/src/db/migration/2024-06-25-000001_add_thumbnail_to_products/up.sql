-- Add thumbnailUrl column to products table
ALTER TABLE products ADD COLUMN thumbnailUrl TEXT;

-- Update the migration version
UPDATE sqlite_master SET sql = replace(sql, 'CREATE TABLE products (', 'CREATE TABLE products (
    thumbnailUrl TEXT,')
WHERE type = 'table' AND name = 'products'; 
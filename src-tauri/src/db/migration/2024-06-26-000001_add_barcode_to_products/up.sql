-- Add barcode column to products table
ALTER TABLE products ADD COLUMN barcode TEXT;

-- Update existing products with dummy barcode values
UPDATE products SET barcode = 'BC-' || sku WHERE barcode IS NULL; 
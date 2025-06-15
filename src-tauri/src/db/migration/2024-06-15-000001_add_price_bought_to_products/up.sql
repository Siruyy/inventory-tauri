-- Add price_bought column to products table with a default value of 0
ALTER TABLE products ADD COLUMN price_bought REAL NOT NULL DEFAULT 0;

-- Update existing products with a default value
UPDATE products SET price_bought = unit_price * 0.6 WHERE price_bought = 0; 
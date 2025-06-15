-- SQLite doesn't support dropping columns directly
-- We need to create a new table without the column, copy the data, drop the old table and rename the new one

-- Create a new table without price_bought column
CREATE TABLE temp_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    supplier TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- Copy data from products to temp_products
INSERT INTO temp_products 
    (id, name, description, sku, category_id, unit_price, current_stock, minimum_stock, supplier, created_at, updated_at)
SELECT 
    id, name, description, sku, category_id, unit_price, current_stock, minimum_stock, supplier, created_at, updated_at
FROM products;

-- Drop the old products table
DROP TABLE products;

-- Rename temp_products to products
ALTER TABLE temp_products RENAME TO products; 
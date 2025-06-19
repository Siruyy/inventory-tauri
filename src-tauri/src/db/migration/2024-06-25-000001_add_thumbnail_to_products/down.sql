-- Create a new temporary table without the thumbnailUrl column
CREATE TABLE products_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    unit_price REAL NOT NULL,
    price_bought REAL NOT NULL DEFAULT 0,
    supplier TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Copy data from the original table to the temporary table
INSERT INTO products_temp 
SELECT id, name, description, sku, category_id, current_stock, minimum_stock, unit_price, price_bought, supplier, created_at, updated_at 
FROM products;

-- Drop the original table
DROP TABLE products;

-- Rename the temporary table to the original table name
ALTER TABLE products_temp RENAME TO products; 
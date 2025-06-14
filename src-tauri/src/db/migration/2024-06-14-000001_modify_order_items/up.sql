-- First, store the existing data
CREATE TABLE temp_order_items AS SELECT * FROM order_items;

-- Drop the existing table
DROP TABLE order_items;

-- Recreate the table with the new schema
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    product_name TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Update the product_name field for existing records
INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, product_name)
SELECT 
    oi.id, 
    oi.order_id, 
    oi.product_id, 
    oi.quantity, 
    oi.price, 
    oi.created_at,
    (SELECT name FROM products WHERE id = oi.product_id) as product_name
FROM temp_order_items oi;

-- Drop the temporary table
DROP TABLE temp_order_items; 
-- First, store the existing data
CREATE TABLE temp_order_items AS SELECT id, order_id, product_id, quantity, price, created_at FROM order_items WHERE product_id IS NOT NULL;

-- Drop the existing table
DROP TABLE order_items;

-- Recreate the table with the original schema
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Restore the data
INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
SELECT id, order_id, product_id, quantity, price, created_at FROM temp_order_items;

-- Drop the temporary table
DROP TABLE temp_order_items; 
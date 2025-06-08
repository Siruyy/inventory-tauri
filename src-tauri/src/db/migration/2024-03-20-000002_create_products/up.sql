CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    unit_price REAL NOT NULL,
    supplier TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert sample products
INSERT INTO products (name, description, sku, category_id, unit_price, current_stock, minimum_stock, supplier) VALUES
    ('Dell XPS 13 Laptop', '13-inch business laptop with Intel i7', 'DELL-XPS13-001', 1, 1299.99, 5, 2, 'Dell Inc.'),
    ('HP LaserJet Pro Printer', 'Color laser printer for office use', 'HP-LJ-2022', 1, 399.99, 3, 1, 'HP Inc.'),
    ('Office Desk', 'Adjustable height desk 60x30 inches', 'DESK-ADJ-001', 3, 299.99, 8, 3, 'Office Furniture Co.'),
    ('Ergonomic Chair', 'High-back mesh office chair', 'CHAIR-ERG-001', 3, 199.99, 10, 4, 'Office Furniture Co.'),
    ('Logitech MX Master 3', 'Wireless productivity mouse', 'LOG-MX3-001', 4, 99.99, 15, 5, 'Logitech'),
    ('Paper Clips', 'Box of 100 standard paper clips', 'CLIP-STD-100', 2, 2.99, 50, 20, 'Office Depot'),
    ('Sticky Notes', '3x3 inches, pack of 12', 'NOTE-3X3-012', 5, 8.99, 30, 10, 'Post-it'),
    ('Whiteboard Markers', 'Pack of 4 assorted colors', 'MARK-WB-004', 5, 6.99, 25, 8, 'Expo'),
    ('USB-C Hub', '7-in-1 USB-C adapter', 'HUB-USC-001', 4, 45.99, 12, 4, 'Anker'),
    ('A4 Paper', '500 sheets, 80gsm', 'PPR-A4-500', 2, 4.99, 100, 30, 'Hammermill'); 
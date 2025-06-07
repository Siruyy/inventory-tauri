CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name VARCHAR NOT NULL UNIQUE,
    description VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices and components'),
    ('Office Supplies', 'General office materials and supplies'),
    ('Furniture', 'Office furniture and fixtures'),
    ('IT Equipment', 'Computer hardware and peripherals'),
    ('Stationery', 'Writing materials and paper products'); 
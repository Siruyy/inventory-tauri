-- Remove icon column from categories table
-- SQLite doesn't support dropping columns directly, so we need to recreate the table
CREATE TABLE categories_backup (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name VARCHAR NOT NULL UNIQUE,
    description VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from the original table to the backup table
INSERT INTO categories_backup (id, name, description, created_at, updated_at)
SELECT id, name, description, created_at, updated_at FROM categories;

-- Drop the original table
DROP TABLE categories;

-- Rename the backup table to the original table name
ALTER TABLE categories_backup RENAME TO categories; 
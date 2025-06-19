#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod db;

use rusqlite::Connection;
use commands::{
    auth::{login, register},
    category::{get_all_categories, add_category, delete_category, update_category},
    product::{get_all_products, get_products_by_category, add_product, update_product, delete_product, update_product_stock},
    transaction::*,
};
use crate::db::DbState;
use bcrypt::{hash, DEFAULT_COST};
use r2d2_sqlite::SqliteConnectionManager;

// Function to initialize database with default admin user
fn initialize_database(conn: &Connection) -> Result<(), String> {
    // Create users table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    ).map_err(|e| format!("Failed to create users table: {}", e))?;

    // Create categories table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    ).map_err(|e| format!("Failed to create categories table: {}", e))?;

    // Create products table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            sku TEXT NOT NULL UNIQUE,
            category_id INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            price_bought REAL NOT NULL DEFAULT 0,
            current_stock INTEGER NOT NULL DEFAULT 0,
            minimum_stock INTEGER NOT NULL DEFAULT 0,
            supplier TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        )",
        [],
    ).map_err(|e| format!("Failed to create products table: {}", e))?;

    // Create orders table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            cashier TEXT NOT NULL,
            subtotal REAL NOT NULL,
            tax REAL NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'completed',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| format!("Failed to create orders table: {}", e))?;

    // Create order_items table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        )",
        [],
    ).map_err(|e| format!("Failed to create order_items table: {}", e))?;
    
    // Update the order_items table schema if needed
    update_order_items_schema(conn)?;
    
    // Add price_bought column if needed
    add_price_bought_to_products(conn)?;
    
    // Add icon column to categories if needed
    add_icon_to_categories(conn)?;

    // Check if admin user exists
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let count: i64 = stmt.query_row([], |row| row.get(0))
        .map_err(|e| format!("Failed to check for admin user: {}", e))?;
    
    // If admin doesn't exist, create one
    if count == 0 {
        println!("Creating default admin user...");
        
        // Hash the password (default: 'admin')
        let password_hash = hash("admin", DEFAULT_COST)
            .map_err(|e| format!("Failed to hash password: {}", e))?;
        
        conn.execute(
            "INSERT INTO users (username, email, password_hash, full_name, role, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
            rusqlite::params![
                "admin",
                "admin@example.com",
                password_hash,
                "Administrator",
                "admin"
            ],
        ).map_err(|e| format!("Failed to insert admin user: {}", e))?;
        
        println!("Default admin user created successfully!");
    }

    // Add some sample categories if none exist
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM categories")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let count: i64 = stmt.query_row([], |row| row.get(0))
        .map_err(|e| format!("Failed to check categories count: {}", e))?;

    if count == 0 {
        println!("Adding sample categories...");
        
        // Sample categories
        let sample_categories = [
            ("Electronics", "Electronic devices and components"),
            ("Office Supplies", "Items used in an office environment"),
            ("Furniture", "Desks, chairs, and other furniture"),
            ("Food & Beverages", "Consumable food and drink items"),
            ("Clothing", "Apparel and wearable items")
        ];
        
        for (name, description) in sample_categories.iter() {
            conn.execute(
                "INSERT INTO categories (name, description) VALUES (?, ?)",
                rusqlite::params![name, description],
            ).map_err(|e| format!("Failed to insert category {}: {}", name, e))?;
        }
        
        println!("Sample categories added successfully!");
    }
    
    // Add some sample products if none exist
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM products")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let count: i64 = stmt.query_row([], |row| row.get(0))
        .map_err(|e| format!("Failed to check products count: {}", e))?;

    if count == 0 {
        println!("Adding sample products...");
        
        // Get category IDs
        let mut stmt = conn.prepare("SELECT id, name FROM categories")
            .map_err(|e| format!("Failed to prepare statement: {}", e))?;
        
        let categories = stmt.query_map([], |row| {
            Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?))
        }).map_err(|e| format!("Failed to query categories: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect categories: {}", e))?;
        
        // Find category IDs
        let mut category_ids = std::collections::HashMap::<String, i32>::new();
        for (id, name) in categories {
            category_ids.insert(name, id);
        }
        
        // Add some sample products if none exist
        let sample_products = [
            // Electronics
            ("Dell XPS 13 Laptop", "13-inch business laptop with Intel i7", "DELL-XPS13-001", 
             category_ids.get("Electronics").unwrap_or(&1), 1299.99, 5, 2, "Dell Inc."),
            ("HP LaserJet Pro Printer", "Color laser printer for office use", "HP-LJ-2022", 
             category_ids.get("Electronics").unwrap_or(&1), 399.99, 3, 1, "HP Inc."),
            
            // Office Supplies
            ("Paper Clips", "Box of 100 standard paper clips", "CLIP-STD-100", 
             category_ids.get("Office Supplies").unwrap_or(&2), 2.99, 50, 20, "Office Depot"),
            ("A4 Paper", "500 sheets, 80gsm", "PPR-A4-500", 
             category_ids.get("Office Supplies").unwrap_or(&2), 4.99, 100, 30, "Hammermill"),
            
            // Furniture
            ("Office Desk", "Adjustable height desk 60x30 inches", "DESK-ADJ-001", 
             category_ids.get("Furniture").unwrap_or(&3), 299.99, 8, 3, "Office Furniture Co."),
            ("Ergonomic Chair", "High-back mesh office chair", "CHAIR-ERG-001", 
             category_ids.get("Furniture").unwrap_or(&3), 199.99, 10, 4, "Office Furniture Co."),
            
            // IT Equipment
            ("Logitech MX Master 3", "Wireless productivity mouse", "LOG-MX3-001", 
             category_ids.get("IT Equipment").unwrap_or(&4), 99.99, 15, 5, "Logitech"),
            ("USB-C Hub", "7-in-1 USB-C adapter", "HUB-USC-001", 
             category_ids.get("IT Equipment").unwrap_or(&4), 45.99, 12, 4, "Anker"),
            
            // Stationery
            ("Sticky Notes", "3x3 inches, pack of 12", "NOTE-3X3-012", 
             category_ids.get("Stationery").unwrap_or(&5), 8.99, 30, 10, "Post-it"),
            ("Whiteboard Markers", "Pack of 4 assorted colors", "MARK-WB-004", 
             category_ids.get("Stationery").unwrap_or(&5), 6.99, 25, 8, "Expo"),
            
            // Food & Beverages
            ("Coffee Beans", "Premium arabica coffee beans 1kg", "FB-COFFEE-001", 
             category_ids.get("Food & Beverages").unwrap_or(&4), 19.99, 40, 10, "Starbucks"),
            ("Tea Bags", "Assorted herbal tea, 50 bags", "FB-TEA-002", 
             category_ids.get("Food & Beverages").unwrap_or(&4), 8.99, 25, 8, "Twinings"),
            ("Chocolate Bars", "Box of 24 assorted chocolate bars", "FB-CHOC-003", 
             category_ids.get("Food & Beverages").unwrap_or(&4), 15.99, 35, 12, "Nestle"),
            
            // Clothing
            ("T-Shirt", "Cotton t-shirt, various colors", "C-TSHIRT-001", 
             category_ids.get("Clothing").unwrap_or(&5), 14.99, 60, 15, "Hanes"),
            ("Jeans", "Classic fit denim jeans", "C-JEANS-002", 
             category_ids.get("Clothing").unwrap_or(&5), 34.99, 45, 12, "Levi's"),
            ("Hoodie", "Pullover hoodie sweatshirt", "C-HOODIE-003", 
             category_ids.get("Clothing").unwrap_or(&5), 29.99, 40, 10, "Champion"),
        ];
        
        for (name, description, sku, category_id, price, stock, min_stock, supplier) in sample_products.iter() {
            conn.execute(
                "INSERT INTO products (name, description, sku, category_id, unit_price, current_stock, minimum_stock, supplier) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![name, description, sku, category_id, price, stock, min_stock, supplier],
            ).map_err(|e| format!("Failed to insert product {}: {}", name, e))?;
        }
        
        println!("Sample products added successfully!");
    }
    
    Ok(())
}

// Function to update the order_items table to allow product deletion
fn update_order_items_schema(conn: &Connection) -> Result<(), String> {
    println!("Checking if order_items table needs to be updated...");
    
    // Check if product_name column exists in order_items table
    let has_product_name = conn.query_row(
        "SELECT COUNT(*) FROM pragma_table_info('order_items') WHERE name = 'product_name'",
        [],
        |row| row.get::<_, i64>(0)
    ).map_err(|e| format!("Failed to check schema: {}", e))? > 0;
    
    // Check if product_id is nullable
    let product_id_nullable = conn.query_row(
        "SELECT COUNT(*) FROM pragma_table_info('order_items') WHERE name = 'product_id' AND [notnull] = 0",
        [],
        |row| row.get::<_, i64>(0)
    ).map_err(|e| format!("Failed to check schema: {}", e))? > 0;
    
    if !has_product_name || !product_id_nullable {
        println!("Updating order_items table schema...");
        
        // Create a temporary table with the new schema
        conn.execute(
            "CREATE TABLE temp_order_items AS SELECT * FROM order_items",
            [],
        ).map_err(|e| format!("Failed to create temporary table: {}", e))?;
        
        // Drop the existing table
        conn.execute(
            "DROP TABLE order_items",
            [],
        ).map_err(|e| format!("Failed to drop order_items table: {}", e))?;
        
        // Create the table with the updated schema
        conn.execute(
            "CREATE TABLE order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                product_name TEXT,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            )",
            [],
        ).map_err(|e| format!("Failed to recreate order_items table: {}", e))?;
        
        // Get product names for existing order items
        let mut stmt = conn.prepare(
            "SELECT oi.id, p.name 
             FROM temp_order_items oi
             JOIN products p ON oi.product_id = p.id"
        ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
        
        let product_names = stmt.query_map([], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
        }).map_err(|e| format!("Failed to query product names: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect product names: {}", e))?;
        
        // Create a map of order item IDs to product names
        let mut product_name_map = std::collections::HashMap::<i64, String>::new();
        for (id, name) in product_names {
            product_name_map.insert(id, name);
        }
        
        // Copy data from temporary table to the new table
        let mut stmt = conn.prepare(
            "SELECT id, order_id, product_id, quantity, price, created_at
             FROM temp_order_items"
        ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
        
        let rows = stmt.query_map([], |row| {
            Ok((
                row.get::<_, i64>(0)?, // id
                row.get::<_, i64>(1)?, // order_id
                row.get::<_, i64>(2)?, // product_id
                row.get::<_, i64>(3)?, // quantity
                row.get::<_, f64>(4)?, // price
                row.get::<_, String>(5)?, // created_at
            ))
        }).map_err(|e| format!("Failed to query order items: {}", e))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect order items: {}", e))?;
        
        // Insert data into the new table
        for (id, order_id, product_id, quantity, price, created_at) in rows {
            let product_name = product_name_map.get(&id).cloned().unwrap_or_else(|| "Unknown Product".to_string());
            
            conn.execute(
                "INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, product_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, order_id, product_id, quantity, price, created_at, product_name],
            ).map_err(|e| format!("Failed to insert order item: {}", e))?;
        }
        
        // Drop the temporary table
        conn.execute(
            "DROP TABLE temp_order_items",
            [],
        ).map_err(|e| format!("Failed to drop temporary table: {}", e))?;
        
        println!("Order_items table schema updated successfully!");
    } else {
        println!("Order_items table schema is already up to date.");
    }
    
    Ok(())
}

// Add a new function to run the price_bought migration
fn add_price_bought_to_products(conn: &Connection) -> Result<(), String> {
    // Check if price_bought column exists
    let result = conn.query_row(
        "SELECT COUNT(*) FROM pragma_table_info('products') WHERE name='price_bought'",
        [],
        |row| row.get::<_, i64>(0)
    );

    // If column doesn't exist (count = 0), add it
    if let Ok(0) = result {
        println!("Adding price_bought column to products table...");
        
        // Add the column
        conn.execute(
            "ALTER TABLE products ADD COLUMN price_bought REAL NOT NULL DEFAULT 0",
            [],
        ).map_err(|e| format!("Failed to add price_bought column: {}", e))?;
        
        // Update values with a default (60% of unit_price)
        conn.execute(
            "UPDATE products SET price_bought = unit_price * 0.6 WHERE price_bought = 0",
            [],
        ).map_err(|e| format!("Failed to update price_bought values: {}", e))?;
        
        println!("Successfully added price_bought column!");
    } else if let Err(e) = result {
        return Err(format!("Failed to check for price_bought column: {}", e));
    } else {
        println!("price_bought column already exists, skipping migration");
    }
    
    Ok(())
}

// Add a new function to add the icon column to the categories table
fn add_icon_to_categories(conn: &Connection) -> Result<(), String> {
    // Check if icon column exists
    let result = conn.query_row(
        "SELECT COUNT(*) FROM pragma_table_info('categories') WHERE name='icon'",
        [],
        |row| row.get::<_, i64>(0)
    );

    // If column doesn't exist (count = 0), add it
    if let Ok(0) = result {
        println!("Adding icon column to categories table...");
        
        // Add the column
        conn.execute(
            "ALTER TABLE categories ADD COLUMN icon TEXT",
            [],
        ).map_err(|e| format!("Failed to add icon column: {}", e))?;
        
        println!("Successfully added icon column to categories table!");
    } else if let Err(e) = result {
        return Err(format!("Failed to check for icon column: {}", e));
    } else {
        println!("icon column already exists in categories table, skipping migration");
    }
    
    Ok(())
}

fn main() {
    // Server initialization code
    let db_path = std::path::PathBuf::from("inventory.db");
    println!("Database path: {:?}", db_path);
    
    // Use the r2d2 connection pool
    let manager = SqliteConnectionManager::file(&db_path);
    let pool = r2d2::Pool::new(manager).expect("Failed to create database pool");
    
    // Initialize database with tables and test data
    {
        let conn = pool.get().expect("Failed to get db connection");
        initialize_database(&conn).expect("Failed to initialize database");
    }

    tauri::Builder::default()
        .manage(DbState { pool })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            login,
            register,
            get_all_categories,
            add_category,
            update_category,
            delete_category,
            get_all_products,
            get_products_by_category,
            add_product,
            update_product,
            delete_product,
            update_product_stock,
            create_order,
            get_order_by_id,
            get_order_items,
            get_order_with_items,
            get_recent_orders,
            get_order_history,
            get_order_statistics,
            get_sales_report_data,
            debug_order_dates,
            update_order_dates_to_today
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
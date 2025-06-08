#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod db;

use rusqlite::Connection;
use commands::{
    auth::*,
    category::*,
    product::*,
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
            current_stock INTEGER NOT NULL DEFAULT 0,
            minimum_stock INTEGER NOT NULL DEFAULT 0,
            supplier TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        )",
        [],
    ).map_err(|e| format!("Failed to create products table: {}", e))?;

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

fn main() {
    let db_path = "inventory.db";
    let manager = SqliteConnectionManager::file(db_path)
        .with_init(|conn| {
            // Enable foreign keys for each new connection from the pool
            conn.execute_batch("PRAGMA foreign_keys = ON;")?;
            Ok(())
        });
    let pool = r2d2::Pool::new(manager).expect("Failed to create pool.");
    
    // The initialize_database function needs a connection.
    // I can get one from the pool.
    let conn = pool.get().expect("Failed to get conn for init");
    
    // Initialize database with default admin user
    if let Err(e) = initialize_database(&conn) {
        eprintln!("Error initializing database: {}", e);
    }

    tauri::Builder::default()
        .manage(DbState {
            pool: pool,
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            register,
            verify_auth,
            login,
            get_all_categories,
            add_category,
            delete_category,
            get_all_products,
            get_products_by_category,
            add_product,
            delete_product,
            update_product_stock,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
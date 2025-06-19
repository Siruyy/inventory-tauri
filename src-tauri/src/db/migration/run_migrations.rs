use rusqlite::{Connection, Result};
use std::path::Path;

pub fn run_migrations(db_path: &Path) -> Result<()> {
    let conn = Connection::open(db_path)?;
    
    // Check if the icon column exists in the categories table
    let mut stmt = conn.prepare("PRAGMA table_info(categories)")?;
    let column_names: Vec<String> = stmt.query_map([], |row| {
        Ok(row.get::<_, String>(1)?)
    })?.collect::<Result<Vec<String>>>()?;
    
    // If icon column doesn't exist, add it
    if !column_names.contains(&"icon".to_string()) {
        println!("Adding icon column to categories table");
        conn.execute("ALTER TABLE categories ADD COLUMN icon TEXT;", [])?;
        println!("Migration successful: Added icon column to categories table");
    } else {
        println!("Icon column already exists in categories table, skipping migration");
    }
    
    // Check if the thumbnailUrl column exists in the products table
    let mut stmt = conn.prepare("PRAGMA table_info(products)")?;
    let product_columns: Vec<String> = stmt.query_map([], |row| {
        Ok(row.get::<_, String>(1)?)
    })?.collect::<Result<Vec<String>>>()?;
    
    // If thumbnailUrl column doesn't exist, add it
    if !product_columns.contains(&"thumbnailUrl".to_string()) {
        println!("Adding thumbnailUrl column to products table");
        conn.execute("ALTER TABLE products ADD COLUMN thumbnailUrl TEXT;", [])?;
        println!("Migration successful: Added thumbnailUrl column to products table");
    } else {
        println!("thumbnailUrl column already exists in products table, skipping migration");
    }
    
    Ok(())
} 
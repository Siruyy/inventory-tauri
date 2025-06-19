use rusqlite::{Connection, params};
use std::path::Path;
use std::process::Command;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Starting database fix and application restart...");
    
    // Connect to the database
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize()?);
    
    let conn = Connection::open(db_path)?;
    
    // Check if products table exists
    let table_exists = conn.query_row(
        "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='products'",
        [],
        |row| row.get::<_, i64>(0)
    )? > 0;
    
    if !table_exists {
        println!("Products table doesn't exist!");
        return Ok(());
    }
    
    // Check products count
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0))?;
    println!("Found {} products in the database", count);
    
    // List all products
    let mut stmt = conn.prepare("SELECT id, name, sku FROM products")?;
    let products = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?
        ))
    })?;
    
    println!("Products in database:");
    for product in products {
        match product {
            Ok((id, name, sku)) => {
                println!("  ID: {}, Name: {}, SKU: {}", id, name, sku);
            }
            Err(e) => println!("  Error reading product: {}", e),
        }
    }
    
    // Check if thumbnailUrl column exists
    let mut stmt = conn.prepare("PRAGMA table_info(products)")?;
    let columns: Vec<String> = stmt.query_map([], |row| {
        Ok(row.get::<_, String>(1)?)
    })?.collect::<Result<Vec<String>, _>>()?;
    
    if !columns.contains(&"thumbnailUrl".to_string()) {
        println!("Adding thumbnailUrl column to products table");
        conn.execute("ALTER TABLE products ADD COLUMN thumbnailUrl TEXT;", [])?;
        println!("Added thumbnailUrl column to products table");
    } else {
        println!("thumbnailUrl column already exists");
    }
    
    // Check table schema
    println!("\nCurrent products table schema:");
    let mut stmt = conn.prepare("PRAGMA table_info(products)")?;
    let columns = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // cid
            row.get::<_, String>(1)?, // name
            row.get::<_, String>(2)?, // type
            row.get::<_, bool>(3)?, // notnull
            row.get::<_, Option<String>>(4)?, // dflt_value
            row.get::<_, i32>(5)? // pk
        ))
    })?;
    
    for column in columns {
        match column {
            Ok((cid, name, type_name, not_null, default_value, pk)) => {
                println!("  Column {}: {} (type: {}, not_null: {}, default: {:?}, pk: {})", 
                    cid, name, type_name, not_null, default_value, pk);
            }
            Err(e) => println!("  Error reading column: {}", e),
        }
    }
    
    // Fix any null thumbnailUrl values
    println!("\nFixing null thumbnailUrl values...");
    conn.execute("UPDATE products SET thumbnailUrl = NULL WHERE thumbnailUrl = '';", [])?;
    
    // Check for any issues with the categories table
    println!("\nChecking categories table...");
    let mut stmt = conn.prepare("SELECT id, name, icon FROM categories")?;
    let categories = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, Option<String>>(2)?
        ))
    })?;
    
    println!("Categories in database:");
    for category in categories {
        match category {
            Ok((id, name, icon)) => {
                println!("  ID: {}, Name: {}, Icon: {:?}", id, name, icon);
            }
            Err(e) => println!("  Error reading category: {}", e),
        }
    }
    
    // Fix any null icon values
    println!("\nFixing null icon values...");
    conn.execute("UPDATE categories SET icon = NULL WHERE icon = '';", [])?;
    
    println!("\nDatabase fix completed successfully!");
    
    Ok(())
} 
use rusqlite::{Connection, params};
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to the database
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize()?);
    
    let conn = Connection::open(db_path)?;
    
    // Run the exact query from get_all_products
    println!("Running the get_all_products query...");
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.description, p.sku, p.category_id, c.name as category_name, 
         p.unit_price, p.price_bought, p.current_stock, p.minimum_stock, p.supplier, p.created_at, p.updated_at, p.thumbnailUrl
         FROM products p
         JOIN categories c ON p.category_id = c.id
         ORDER BY p.name"
    )?;

    let products = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // id
            row.get::<_, String>(1)?, // name
            row.get::<_, Option<String>>(2)?, // description
            row.get::<_, String>(3)?, // sku
            row.get::<_, i32>(4)?, // category_id
            row.get::<_, String>(5)?, // category_name
            row.get::<_, f64>(6)?, // unit_price
            row.get::<_, f64>(7)?, // price_bought
            row.get::<_, i32>(8)?, // current_stock
            row.get::<_, i32>(9)?, // minimum_stock
            row.get::<_, Option<String>>(10)?, // supplier
            row.get::<_, String>(11)?, // created_at
            row.get::<_, String>(12)?, // updated_at
            row.get::<_, Option<String>>(13)?, // thumbnailUrl
        ))
    })?;

    println!("Products in database:");
    for product in products {
        match product {
            Ok((id, name, description, sku, category_id, category_name, unit_price, price_bought, 
                current_stock, minimum_stock, supplier, created_at, updated_at, thumbnailUrl)) => {
                println!("  ID: {}, Name: {}, Category: {} ({}), Stock: {}, ThumbnailUrl: {:?}", 
                    id, name, category_name, category_id, current_stock, thumbnailUrl);
            }
            Err(e) => println!("  Error reading product: {}", e),
        }
    }
    
    // Check if there are any products with invalid category_id
    println!("\nChecking for products with invalid category IDs...");
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.category_id 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE c.id IS NULL"
    )?;

    let invalid_products = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // id
            row.get::<_, String>(1)?, // name
            row.get::<_, i32>(2)?, // category_id
        ))
    })?;

    let mut has_invalid = false;
    for product in invalid_products {
        has_invalid = true;
        match product {
            Ok((id, name, category_id)) => {
                println!("  Invalid product: ID: {}, Name: {}, Invalid Category ID: {}", 
                    id, name, category_id);
            }
            Err(e) => println!("  Error reading invalid product: {}", e),
        }
    }

    if !has_invalid {
        println!("  No products with invalid category IDs found");
    }
    
    // Check available categories
    println!("\nAvailable categories:");
    let mut stmt = conn.prepare("SELECT id, name FROM categories")?;
    let categories = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // id
            row.get::<_, String>(1)?, // name
        ))
    })?;

    for category in categories {
        match category {
            Ok((id, name)) => {
                println!("  ID: {}, Name: {}", id, name);
            }
            Err(e) => println!("  Error reading category: {}", e),
        }
    }
    
    Ok(())
} 
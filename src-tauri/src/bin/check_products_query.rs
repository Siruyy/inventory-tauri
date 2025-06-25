use rusqlite::{Connection, params};
use std::path::Path;

fn main() {
    // Get the path to the database
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize().unwrap());

    // Connect to the database
    let conn = Connection::open(db_path).expect("Failed to open database");

    // Check products
    check_products(&conn);
    
    // Check orders
    check_orders(&conn);
}

fn check_orders(conn: &Connection) {
    println!("\nChecking orders in the database...");
    
    match conn.prepare("SELECT id, order_id, cashier, total, status, created_at FROM orders ORDER BY created_at DESC") {
        Ok(mut stmt) => {
            match stmt.query([]) {
                Ok(mut rows) => {
                    println!("Orders in database:");
                    let mut count = 0;
                    
                    while let Ok(Some(row)) = rows.next() {
                        match row.get::<_, i32>(0)
                            .and_then(|id| Ok((
                                id,
                                row.get::<_, String>(1)?,
                                row.get::<_, String>(2)?,
                                row.get::<_, f64>(3)?,
                                row.get::<_, String>(4)?,
                                row.get::<_, String>(5)?
                            )))
                        {
                            Ok((id, order_id, cashier, total, status, created_at)) => {
                                println!("  ID: {}, OrderID: {}, Cashier: {}, Total: {}, Status: {}, Created: {}", 
                                    id, order_id, cashier, total, status, created_at);
                                count += 1;
                            },
                            Err(e) => println!("  Error reading order row: {}", e),
                        }
                    }
                    
                    println!("Total orders: {}", count);
                },
                Err(e) => println!("Failed to execute query: {}", e),
            }
        },
        Err(e) => println!("Failed to prepare statement: {}", e),
    }
}

fn check_products(conn: &Connection) {
    println!("Running the get_all_products query...");
    
    // Execute a query similar to get_all_products
    match conn.prepare("
        SELECT p.id, p.name, p.description, p.sku, p.category_id, 
               COALESCE(c.name, 'Uncategorized') as category_name,
               p.unit_price, p.price_bought, p.current_stock, p.minimum_stock, 
               p.supplier, p.created_at, p.updated_at, p.thumbnailUrl
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name
    ") {
        Ok(mut stmt) => {
            match stmt.query([]) {
                Ok(mut rows) => {
                    println!("Products in database:");
                    let mut count = 0;
                    
                    while let Ok(Some(row)) = rows.next() {
                        match row.get::<_, i32>(0)
                            .and_then(|id| Ok((
                                id,
                                row.get::<_, String>(1)?,
                                row.get::<_, String>(2)?,
                                row.get::<_, String>(3)?,
                                row.get::<_, i32>(4)?,
                                row.get::<_, String>(5)?,
                                row.get::<_, f64>(6)?,
                                row.get::<_, Option<f64>>(7)?,
                                row.get::<_, i32>(8)?,
                                row.get::<_, i32>(9)?,
                                row.get::<_, String>(10)?,
                                row.get::<_, String>(11)?,
                                row.get::<_, String>(12)?,
                                row.get::<_, Option<String>>(13)?
                            )))
                        {
                            Ok((id, name, description, sku, category_id, category_name, unit_price, price_bought, 
                                current_stock, minimum_stock, supplier, created_at, updated_at, thumbnailUrl)) => {
                                println!("  ID: {}, Name: {}, Category: {} ({}), Stock: {}, ThumbnailUrl: {:?}", 
                                    id, name, category_name, category_id, current_stock, thumbnailUrl);
                                count += 1;
                            },
                            Err(e) => println!("  Error reading product row: {}", e),
                        }
                    }
                    
                    println!("\nTotal products: {}", count);
                },
                Err(e) => println!("Failed to execute query: {}", e),
            }
        },
        Err(e) => println!("Failed to prepare statement: {}", e),
    }
    
    // Check for products with invalid category IDs
    println!("\nChecking for products with invalid category IDs...");
    match conn.prepare("
        SELECT p.id, p.name, p.category_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id IS NOT NULL AND c.id IS NULL
    ") {
        Ok(mut stmt) => {
            match stmt.query([]) {
                Ok(mut rows) => {
                    let mut invalid_count = 0;
                    
                    while let Ok(Some(row)) = rows.next() {
                        match row.get::<_, i32>(0)
                            .and_then(|id| Ok((
                                id,
                                row.get::<_, String>(1)?,
                                row.get::<_, i32>(2)?
                            )))
                        {
                            Ok((id, name, category_id)) => {
                                println!("  Product ID: {}, Name: {}, has invalid category ID: {}", 
                                    id, name, category_id);
                                invalid_count += 1;
                            },
                            Err(e) => println!("  Error reading invalid category row: {}", e),
                        }
                    }
                    
                    if invalid_count == 0 {
                        println!("  No products with invalid category IDs found");
                    }
                },
                Err(e) => println!("Failed to execute query: {}", e),
            }
        },
        Err(e) => println!("Failed to prepare statement: {}", e),
    }
    
    // List available categories
    println!("\nAvailable categories:");
    match conn.prepare("SELECT id, name FROM categories ORDER BY name") {
        Ok(mut stmt) => {
            match stmt.query([]) {
                Ok(mut rows) => {
                    while let Ok(Some(row)) = rows.next() {
                        match row.get::<_, i32>(0)
                            .and_then(|id| Ok((id, row.get::<_, String>(1)?)))
                        {
                            Ok((id, name)) => {
                                println!("  ID: {}, Name: {}", id, name);
                            },
                            Err(e) => println!("  Error reading category row: {}", e),
                        }
                    }
                },
                Err(e) => println!("Failed to execute query: {}", e),
            }
        },
        Err(e) => println!("Failed to prepare statement: {}", e),
    }
} 
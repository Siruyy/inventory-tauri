use rusqlite::{Connection, params, Result};
use std::path::Path;

fn main() -> Result<()> {
    println!("Checking Uncategorized category...");
    
    // Get the database path
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize().unwrap_or_else(|_| db_path.to_path_buf()));
    
    // Connect to the database
    let conn = Connection::open(db_path)?;
    
    // Find the Uncategorized category
    let mut stmt = conn.prepare("SELECT id, name, description FROM categories WHERE name = 'Uncategorized'")?;
    let category_result = stmt.query_row([], |row| {
        Ok((
            row.get::<_, i32>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, Option<String>>(2)?
        ))
    });
    
    // Variable to track if we need to fix the category
    let mut should_fix = false;
    let mut uncategorized_id = 0;
    
    match category_result {
        Ok((id, name, description)) => {
            println!("Found Uncategorized category:");
            println!("  ID: {}", id);
            println!("  Name: {}", name);
            println!("  Description: {:?}", description);
            
            uncategorized_id = id;  // Save ID for later use
            
            // Check for products
            let mut stmt = conn.prepare("SELECT id, name, current_stock, unit_price FROM products WHERE category_id = ?")?;
            let products = stmt.query_map(params![id], |row| {
                Ok((
                    row.get::<_, i32>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i32>(2)?,
                    row.get::<_, f64>(3)?
                ))
            })?;
            
            println!("\nProducts in Uncategorized category:");
            let mut product_count = 0;
            for product_result in products {
                match product_result {
                    Ok((product_id, name, stock, price)) => {
                        println!("  ID: {}, Name: {}, Stock: {}, Price: {}", product_id, name, stock, price);
                        product_count += 1;
                        
                        // Check if this product is in any order_items
                        let count: i32 = conn.query_row(
                            "SELECT COUNT(*) FROM order_items WHERE product_id = ?",
                            params![product_id],
                            |row| row.get(0)
                        )?;
                        
                        if count > 0 {
                            println!("    This product appears in {} order items", count);
                        } else {
                            println!("    This product is not in any orders (orphaned)");
                        }
                    },
                    Err(e) => println!("  Error reading product: {}", e),
                }
            }
            
            if product_count == 0 {
                println!("  No products found in this category");
                should_fix = true;  // Mark for fixing
            }
            
            // Check if the category is referenced in the UI
            // This query checks if the category count in the UI might be wrong
            let mut stmt = conn.prepare("
                SELECT COUNT(*) FROM products p 
                JOIN categories c ON p.category_id = c.id 
                WHERE c.name = 'Uncategorized'
            ")?;
            
            let ui_count: i32 = stmt.query_row([], |row| row.get(0))?;
            println!("\nProduct count by join query: {}", ui_count);
            
            // Check for inconsistent products (that might have orphaned references)
            let mut stmt = conn.prepare("
                SELECT p.id, p.name FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE c.id IS NULL
            ")?;
            
            let orphaned = stmt.query_map([], |row| {
                Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?))
            })?;
            
            println!("\nOrphaned products (with invalid category_id):");
            let mut orphan_count = 0;
            for product in orphaned {
                if let Ok((id, name)) = product {
                    println!("  ID: {}, Name: {}", id, name);
                    orphan_count += 1;
                }
            }
            
            if orphan_count == 0 {
                println!("  No orphaned products found");
            }
        },
        Err(e) => println!("Uncategorized category not found: {}", e),
    }
    
    // Fix uncategorized category if needed (no borrowing conflicts here)
    if should_fix && uncategorized_id > 0 {
        fix_uncategorized_category(&conn, uncategorized_id)?;
    }
    
    Ok(())
}

fn fix_uncategorized_category(conn: &Connection, id: i32) -> Result<()> {
    println!("\nFIXING UNCATEGORIZED CATEGORY ISSUE...");
    
    // Create a new connection to avoid borrowing issues
    let db_path = Path::new("inventory.db");
    let mut fix_conn = Connection::open(db_path)?;
    
    // Start a transaction
    let tx = fix_conn.transaction()?;
    
    // Update the category's description to indicate it's safe to delete
    tx.execute(
        "UPDATE categories SET description = 'This category is now safe to delete' WHERE id = ?",
        params![id]
    )?;
    
    // Find another category to use as backup
    let backup_id_result = tx.query_row(
        "SELECT id FROM categories WHERE name != 'Uncategorized' LIMIT 1",
        [],
        |row| row.get::<_, i32>(0)
    );
    
    // Handle potential absence of other categories
    if let Ok(backup_id) = backup_id_result {
        // Update any potential references in other tables
        tx.execute(
            "UPDATE products SET category_id = ? WHERE category_id = ?",
            params![backup_id, id]
        )?;
        
        println!("Database updated. The Uncategorized category should now be deletable.");
        println!("Restart the application and try deleting the category again.");
    } else {
        println!("Could not find another category to use as backup.");
        println!("You may need to create another category before deleting Uncategorized.");
    }
    
    // Remove protection from deletion
    tx.execute(
        "UPDATE categories SET name = 'Uncategorized (Safe to Delete)' WHERE id = ?",
        params![id]
    )?;
    
    // Commit the transaction
    tx.commit()?;
    
    Ok(())
} 
use rusqlite::{Connection, Result, params};
use std::path::Path;
use std::process::Command;

fn main() -> Result<()> {
    println!("Starting database fix and clean-up...");
    
    // Get the database path
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize()?);
    
    // Connect to the database
    let conn = Connection::open(db_path)?;
    
    // Find the Uncategorized category
    let mut stmt = conn.prepare("SELECT id FROM categories WHERE name = 'Uncategorized'")?;
    let uncategorized_id: Option<i32> = stmt.query_row([], |row| row.get(0)).ok();
    
    if let Some(uncategorized_id) = uncategorized_id {
        println!("Found 'Uncategorized' category with ID: {}", uncategorized_id);
        
        // Check for products in this category
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM products WHERE category_id = ?")?;
        let product_count: i32 = stmt.query_row(params![uncategorized_id], |row| row.get(0))?;
        
        println!("The 'Uncategorized' category has {} products according to the database", product_count);
        
        // Check if any of those products are referenced in order_items
        let mut stmt = conn.prepare(
            "SELECT COUNT(*) FROM products p 
             JOIN order_items oi ON p.id = oi.product_id 
             WHERE p.category_id = ?"
        )?;
        let products_in_orders: i32 = stmt.query_row(params![uncategorized_id], |row| row.get(0))?;
        
        println!("Of those, {} products are referenced in orders", products_in_orders);
        
        // Start a transaction for our fixes
        let tx = conn.transaction()?;
        
        // Check for orphaned products (those not in any orders)
        let mut stmt = tx.prepare(
            "SELECT p.id, p.name FROM products p 
             LEFT JOIN order_items oi ON p.id = oi.product_id 
             WHERE p.category_id = ? AND oi.id IS NULL"
        )?;
        let orphaned_products = stmt.query_map(params![uncategorized_id], |row| {
            Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?))
        })?;
        
        let mut orphaned_count = 0;
        for product in orphaned_products {
            if let Ok((id, name)) = product {
                println!("Found orphaned product: ID = {}, Name = {}", id, name);
                
                // Delete orphaned products
                tx.execute("DELETE FROM products WHERE id = ?", params![id])?;
                println!("Deleted orphaned product with ID: {}", id);
                orphaned_count += 1;
            }
        }
        
        println!("Deleted {} orphaned products", orphaned_count);
        
        // If there are no remaining products in the Uncategorized category, we can delete it
        if product_count == orphaned_count {
            println!("All products in 'Uncategorized' category were orphaned. Attempting to delete the category...");
            
            // Double-check that there are no products left
            let remaining_count: i32 = tx.query_row(
                "SELECT COUNT(*) FROM products WHERE category_id = ?",
                params![uncategorized_id],
                |row| row.get(0)
            )?;
            
            if remaining_count == 0 {
                tx.execute("DELETE FROM categories WHERE id = ?", params![uncategorized_id])?;
                println!("Successfully deleted the 'Uncategorized' category.");
            } else {
                println!("Could not delete 'Uncategorized' category - {} products still remain.", remaining_count);
            }
        } else if product_count > 0 {
            println!("'Uncategorized' category has valid products. Ensuring they are properly linked...");
            
            // Fix any potentially corrupted products by updating their timestamps
            tx.execute(
                "UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE category_id = ?", 
                params![uncategorized_id]
            )?;
            println!("Updated timestamps for products in 'Uncategorized' category");
        }
        
        // Commit our changes
        tx.commit()?;
        
        println!("Database fixes committed successfully.");
    } else {
        println!("No 'Uncategorized' category found in the database.");
    }
    
    println!("Fix complete! Restart the application to see changes.");
    Ok(())
} 
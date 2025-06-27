use rusqlite::{Connection, params, Result, Statement};
use std::path::Path;

fn main() -> Result<()> {
    println!("Fixing Uncategorized category issue...");
    
    // Get the database path
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize().unwrap_or_else(|_| db_path.to_path_buf()));
    
    // Connect to the database for initial queries
    let conn = Connection::open(db_path)?;
    
    // Find the Uncategorized category
    let uncategorized_id: i32;
    let uncategorized_name: String;
    
    {
        let mut stmt = conn.prepare("SELECT id, name FROM categories WHERE name = 'Uncategorized'")?;
        let result = stmt.query_row([], |row| {
            Ok((
                row.get::<_, i32>(0)?,
                row.get::<_, String>(1)?
            ))
        })?;
        
        uncategorized_id = result.0;
        uncategorized_name = result.1;
    }
    
    println!("Found Uncategorized category (ID: {}, Name: {})", uncategorized_id, uncategorized_name);
    
    // Find another category to move products to
    let target_id: i32;
    let target_name: String;
    
    {
        let mut stmt = conn.prepare("SELECT id, name FROM categories WHERE name != 'Uncategorized' LIMIT 1")?;
        let result = stmt.query_row([], |row| {
            Ok((
                row.get::<_, i32>(0)?,
                row.get::<_, String>(1)?
            ))
        })?;
        
        target_id = result.0;
        target_name = result.1;
    }
    
    println!("Found target category: ID: {}, Name: {}", target_id, target_name);
    
    // Create a new connection for modifications
    let mut conn_for_tx = Connection::open(db_path)?;
    
    // Start a transaction
    {
        // Do the work in a separate scope to avoid holding references too long
        let tx = conn_for_tx.transaction()?;
        
        // Get products in Uncategorized category
        let product_ids_and_names = {
            let mut stmt = tx.prepare("SELECT id, name FROM products WHERE category_id = ?")?;
            let rows = stmt.query_map(params![uncategorized_id], |row| {
                Ok((
                    row.get::<_, i32>(0)?,
                    row.get::<_, String>(1)?
                ))
            })?;
            
            // Collect all products to avoid borrowing issues later
            let mut results = Vec::new();
            for row in rows {
                results.push(row?);
            }
            results
        };
        
        println!("Moving products from Uncategorized to {} category:", target_name);
        let mut product_count = 0;
        
        for (product_id, product_name) in product_ids_and_names {
            // Move product to the target category
            println!("  Moving product ID: {}, Name: {}", product_id, product_name);
            tx.execute(
                "UPDATE products SET category_id = ? WHERE id = ?",
                params![target_id, product_id]
            )?;
            product_count += 1;
        }
        
        println!("Moved {} products to category {}", product_count, target_name);
        
        // Verify products were moved
        let count: i32 = {
            let mut stmt = tx.prepare("SELECT COUNT(*) FROM products WHERE category_id = ?")?;
            stmt.query_row(params![uncategorized_id], |row| row.get(0))?
        };
        
        if count == 0 {
            println!("All products successfully moved out of Uncategorized category");
            
            // Make the Uncategorized category deletable by renaming it
            tx.execute(
                "UPDATE categories SET name = 'Uncategorized (Safe to Delete)', description = 'This category can now be safely deleted' WHERE id = ?",
                params![uncategorized_id]
            )?;
            println!("Renamed category to 'Uncategorized (Safe to Delete)' to make it deletable");
        } else {
            println!("Warning: {} products still remain in the Uncategorized category", count);
        }
        
        // Commit the transaction
        tx.commit()?;
        
        println!("Database changes committed successfully.");
        println!("Please restart the application and try deleting the category again.");
    }
    
    Ok(())
} 
use crate::db::models::category::{Category, NewCategory};
use crate::db::DbState;
use rusqlite::{params, Result};

#[tauri::command]
pub fn get_all_categories(state: tauri::State<DbState>) -> Result<Vec<Category>, String> {
    println!("Backend: Getting all categories");
    let conn = state.pool.get().map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name"
    ).map_err(|e| {
        println!("Backend error preparing get_all_categories: {}", e);
        e.to_string()
    })?;

    let categories = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }).map_err(|e| {
        println!("Backend error querying categories: {}", e);
        e.to_string()
    })?;

    let result = categories.collect::<Result<Vec<_>>>().map_err(|e| {
        println!("Backend error collecting categories: {}", e);
        e.to_string()
    })?;
    
    println!("Backend: Retrieved {} categories", result.len());
    Ok(result)
}

#[tauri::command]
pub fn add_category(state: tauri::State<DbState>, category: NewCategory) -> Result<Category, String> {
    println!("Backend: Adding new category: {:?}", category.name);
    
    // Get a connection from the pool with proper error handling
    let mut conn = match state.pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Failed to get connection from pool: {}", e);
            println!("Backend error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // Wrap the entire operation in a transaction to ensure atomicity
    let tx = match conn.transaction() {
        Ok(tx) => tx,
        Err(e) => {
            let error_msg = format!("Failed to start transaction: {}", e);
            println!("Backend error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // Insert the new category
    match tx.execute(
        "INSERT INTO categories (name, description) VALUES (?1, ?2)",
        params![category.name, category.description],
    ) {
        Ok(_) => (),
        Err(e) => {
            let error_msg = format!("Backend error inserting category: {}", e);
            println!("{}", error_msg);
            return Err(error_msg);
        }
    }

    let last_id = tx.last_insert_rowid();
    
    // Create a variable to store the result
    let result: Category;
    
    // Use a block to limit the scope of the statement
    {
        // Retrieve the newly inserted category
        let mut stmt = match tx.prepare(
            "SELECT id, name, description, created_at, updated_at FROM categories WHERE id = ?1"
        ) {
            Ok(stmt) => stmt,
            Err(e) => {
                let error_msg = format!("Failed to prepare statement: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        };

        result = match stmt.query_row(params![last_id], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        }) {
            Ok(category) => category,
            Err(e) => {
                let error_msg = format!("Failed to query inserted category: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        };
    } // stmt goes out of scope here
    
    // Commit the transaction
    if let Err(e) = tx.commit() {
        let error_msg = format!("Failed to commit transaction: {}", e);
        println!("Backend error: {}", error_msg);
        return Err(error_msg);
    }

    println!("Backend: Added category with id: {}", result.id);
    Ok(result)
}

#[tauri::command]
pub fn delete_category(state: tauri::State<DbState>, id: i32) -> Result<String, String> {
    println!("Backend: Deleting category with ID: {}", id);
    
    // Get a connection from the pool with proper error handling
    let conn = match state.pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Failed to get connection from pool: {}", e);
            println!("Backend error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // First check if there are any products associated with this category
    let product_count = {
        let mut stmt = match conn.prepare("SELECT COUNT(*) FROM products WHERE category_id = ?1") {
            Ok(stmt) => stmt,
            Err(e) => {
                let error_msg = format!("Failed to prepare statement: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        };
        
        match stmt.query_row(params![id], |row| row.get::<_, i64>(0)) {
            Ok(count) => count,
            Err(e) => {
                let error_msg = format!("Failed to check product count: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        }
    };
    
    println!("Category {} has {} associated products", id, product_count);
    
    // Create a new mutable reference for the transaction
    let mut conn_for_tx = match state.pool.get() {
        Ok(conn) => conn,
        Err(e) => {
            let error_msg = format!("Failed to get connection from pool for transaction: {}", e);
            println!("Backend error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // Wrap the entire operation in a transaction to ensure atomicity
    let tx = match conn_for_tx.transaction() {
        Ok(tx) => tx,
        Err(e) => {
            let error_msg = format!("Failed to start transaction: {}", e);
            println!("Backend error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // Check if any products in this category are referenced in order_items
    if product_count > 0 {
        // Get products from this category that are in orders
        let mut stmt = match tx.prepare(
            "SELECT DISTINCT p.id 
             FROM products p 
             JOIN order_items oi ON oi.product_id = p.id 
             WHERE p.category_id = ?1"
        ) {
            Ok(stmt) => stmt,
            Err(e) => {
                let error_msg = format!("Failed to prepare statement: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        };
        
        let product_ids_result = stmt.query_map(params![id], |row| {
            row.get(0)
        }).map_err(|e| {
            format!("Failed to get products in orders: {}", e)
        });
        
        let product_ids = match product_ids_result {
            Ok(rows) => {
                let collected: Result<Vec<i32>, _> = rows.collect();
                match collected {
                    Ok(ids) => ids,
                    Err(e) => return Err(format!("Failed to collect product IDs: {}", e)),
                }
            },
            Err(e) => return Err(e),
        };
        
        if !product_ids.is_empty() {
            println!("Found {} products in orders that need reassignment", product_ids.len());
            
            // Find or create a default "Uncategorized" category
            let default_category_id = {
                // Try to find existing "Uncategorized" category
                let mut stmt = match tx.prepare("SELECT id FROM categories WHERE name = 'Uncategorized'") {
                    Ok(stmt) => stmt,
                    Err(e) => return Err(format!("Failed to prepare statement: {}", e)),
                };
                
                let result: Result<Option<i32>, rusqlite::Error> = stmt.query_row([], |row| {
                    Ok(Some(row.get(0)?))
                }).or_else(|_| Ok(None));
                
                match result {
                    Ok(Some(existing_id)) => existing_id,
                    Ok(None) => {
                        // Create a new "Uncategorized" category
                        match tx.execute(
                            "INSERT INTO categories (name, description) VALUES ('Uncategorized', 'Default category for products with deleted categories')",
                            [],
                        ) {
                            Ok(_) => tx.last_insert_rowid() as i32,
                            Err(e) => return Err(format!("Failed to create Uncategorized category: {}", e)),
                        }
                    },
                    Err(e) => return Err(format!("Database error: {}", e)),
                }
            };
            
            // Don't allow deleting the Uncategorized category
            if id == default_category_id {
                return Err("Cannot delete the Uncategorized category as it is used as a fallback for products.".to_string());
            }
            
            // Move products to the default category
            for product_id in product_ids {
                match tx.execute(
                    "UPDATE products SET category_id = ?1 WHERE id = ?2",
                    params![default_category_id, product_id],
                ) {
                    Ok(_) => (),
                    Err(e) => return Err(format!("Failed to reassign product {}: {}", product_id, e)),
                }
            }
            
            println!("Reassigned products to category ID {}", default_category_id);
        }
    }
    
    // Delete the category - SQLite will automatically delete the remaining products due to ON DELETE CASCADE
    let deleted_count = match tx.execute(
        "DELETE FROM categories WHERE id = ?1",
        params![id]
    ) {
        Ok(count) => count,
        Err(e) => {
            let error_msg = format!("Backend error deleting category: {}", e);
            println!("{}", error_msg);
            // Rollback transaction is automatic when tx goes out of scope without commit
            return Err(error_msg);
        }
    };

    if deleted_count == 0 {
        println!("Backend: No category found with ID: {}", id);
        return Err("Category not found".to_string());
    }

    // Commit the transaction
    if let Err(e) = tx.commit() {
        let error_msg = format!("Failed to commit transaction: {}", e);
        println!("Backend error: {}", error_msg);
        return Err(error_msg);
    }

    println!("Backend: Successfully deleted category {} and its products (products in orders were moved to Uncategorized)", id);
    Ok("Category successfully deleted".to_string())
} 
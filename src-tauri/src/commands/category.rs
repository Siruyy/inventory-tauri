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
pub fn delete_category(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    println!("Backend: Deleting category with ID: {}", id);
    
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
    
    // The ON DELETE CASCADE foreign key constraint will handle deleting associated products.
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

    println!("Backend: Successfully deleted category {}, rows affected: {}", id, deleted_count);
    Ok(())
} 
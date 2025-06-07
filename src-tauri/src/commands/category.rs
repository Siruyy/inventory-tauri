use crate::models::category::{Category, NewCategory};
use crate::db::DbState;
use rusqlite::{params, Result};

#[tauri::command]
pub fn get_all_categories(state: tauri::State<DbState>) -> Result<Vec<Category>, String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name"
    ).map_err(|e| e.to_string())?;

    let categories = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    categories.collect::<Result<Vec<_>>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_category(state: tauri::State<DbState>, category: NewCategory) -> Result<Category, String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    let mut stmt = conn.prepare(
        "INSERT INTO categories (name, description) VALUES (?1, ?2) RETURNING id, name, description, created_at, updated_at"
    ).map_err(|e| e.to_string())?;

    stmt.query_row(
        params![category.name, category.description],
        |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        }
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_category(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    conn.execute(
        "DELETE FROM categories WHERE id = ?1",
        params![id]
    ).map_err(|e| e.to_string())?;

    Ok(())
} 
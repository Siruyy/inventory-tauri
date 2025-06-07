use crate::models::product::{Product, NewProduct, ProductWithCategory};
use crate::db::DbState;
use rusqlite::{params, Result};

#[tauri::command]
pub fn get_all_products(state: tauri::State<DbState>) -> Result<Vec<ProductWithCategory>, String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.description, p.sku, p.category_id, c.name as category_name, 
         p.unit_price, p.current_stock, p.minimum_stock, p.location, p.created_at, p.updated_at
         FROM products p
         JOIN categories c ON p.category_id = c.id
         ORDER BY p.name"
    ).map_err(|e| e.to_string())?;

    let products = stmt.query_map([], |row| {
        Ok(ProductWithCategory {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            sku: row.get(3)?,
            category_id: row.get(4)?,
            category_name: row.get(5)?,
            unit_price: row.get(6)?,
            current_stock: row.get(7)?,
            minimum_stock: row.get(8)?,
            location: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?;

    products.collect::<Result<Vec<_>>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_products_by_category(state: tauri::State<DbState>, category_id: i32) -> Result<Vec<ProductWithCategory>, String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.description, p.sku, p.category_id, c.name as category_name, 
         p.unit_price, p.current_stock, p.minimum_stock, p.location, p.created_at, p.updated_at
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = ?1
         ORDER BY p.name"
    ).map_err(|e| e.to_string())?;

    let products = stmt.query_map(params![category_id], |row| {
        Ok(ProductWithCategory {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            sku: row.get(3)?,
            category_id: row.get(4)?,
            category_name: row.get(5)?,
            unit_price: row.get(6)?,
            current_stock: row.get(7)?,
            minimum_stock: row.get(8)?,
            location: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?;

    products.collect::<Result<Vec<_>>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_product(state: tauri::State<DbState>, product: NewProduct) -> Result<Product, String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    let mut stmt = conn.prepare(
        "INSERT INTO products (name, description, sku, category_id, unit_price, current_stock, minimum_stock, location)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         RETURNING id, name, description, sku, category_id, unit_price, current_stock, minimum_stock, location, created_at, updated_at"
    ).map_err(|e| e.to_string())?;

    stmt.query_row(
        params![
            product.name,
            product.description,
            product.sku,
            product.category_id,
            product.unit_price,
            product.current_stock,
            product.minimum_stock,
            product.location,
        ],
        |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                sku: row.get(3)?,
                category_id: row.get(4)?,
                unit_price: row.get(5)?,
                current_stock: row.get(6)?,
                minimum_stock: row.get(7)?,
                location: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        }
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_product(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    conn.execute(
        "DELETE FROM products WHERE id = ?1",
        params![id]
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_product_stock(state: tauri::State<DbState>, id: i32, new_stock: i32) -> Result<(), String> {
    let conn = state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    conn.execute(
        "UPDATE products SET current_stock = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![new_stock, id]
    ).map_err(|e| e.to_string())?;

    Ok(())
}

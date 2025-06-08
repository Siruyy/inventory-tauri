use crate::db::models::order::{NewOrder, NewOrderItem, Order, OrderItem, OrderWithItems};
use crate::db::DbState;
use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub order: NewOrder,
    pub items: Vec<NewOrderItem>,
}

#[tauri::command]
pub fn create_order(state: tauri::State<DbState>, request: CreateOrderRequest) -> Result<Order, String> {
    println!("Backend: Creating new order: {}", request.order.order_id);
    
    let mut conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Start a transaction to ensure all operations succeed or fail together
    let tx = conn.transaction()
        .map_err(|e| format!("Failed to start transaction: {}", e))?;
    
    // Insert the order
    tx.execute(
        "INSERT INTO orders (order_id, cashier, subtotal, tax, total, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            request.order.order_id,
            request.order.cashier,
            request.order.subtotal,
            request.order.tax,
            request.order.total,
            request.order.status
        ]
    ).map_err(|e| format!("Failed to insert order: {}", e))?;
    
    // Get the ID of the inserted order
    let order_id = tx.last_insert_rowid() as i32;
    
    // Insert each order item
    for item in request.items {
        tx.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) 
             VALUES (?1, ?2, ?3, ?4)",
            params![
                order_id,
                item.product_id,
                item.quantity,
                item.price
            ]
        ).map_err(|e| format!("Failed to insert order item: {}", e))?;
        
        // Update the product stock (subtract the ordered quantity)
        tx.execute(
            "UPDATE products SET 
             current_stock = current_stock - ?1, 
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?2",
            params![item.quantity, item.product_id]
        ).map_err(|e| format!("Failed to update product stock: {}", e))?;
    }
    
    // Commit the transaction
    tx.commit().map_err(|e| format!("Failed to commit transaction: {}", e))?;
    
    // Return the created order
    get_order_by_id(state, order_id)
}

#[tauri::command]
pub fn get_order_by_id(state: tauri::State<DbState>, id: i32) -> Result<Order, String> {
    println!("Backend: Getting order by ID: {}", id);
    
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT id, order_id, cashier, subtotal, tax, total, status, created_at
         FROM orders WHERE id = ?1"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let order = stmt.query_row(params![id], |row| {
        Ok(Order {
            id: row.get(0)?,
            order_id: row.get(1)?,
            cashier: row.get(2)?,
            subtotal: row.get(3)?,
            tax: row.get(4)?,
            total: row.get(5)?,
            status: row.get(6)?,
            created_at: row.get(7)?,
        })
    }).map_err(|e| format!("Failed to get order: {}", e))?;
    
    Ok(order)
}

#[tauri::command]
pub fn get_order_items(state: tauri::State<DbState>, order_id: i32) -> Result<Vec<OrderItem>, String> {
    println!("Backend: Getting order items for order ID: {}", order_id);
    
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.created_at, p.name as product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?1"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let items = stmt.query_map(params![order_id], |row| {
        Ok(OrderItem {
            id: row.get(0)?,
            order_id: row.get(1)?,
            product_id: row.get(2)?,
            quantity: row.get(3)?,
            price: row.get(4)?,
            created_at: row.get(5)?,
            product_name: Some(row.get(6)?),
        })
    }).map_err(|e| format!("Failed to query order items: {}", e))?;
    
    let result = items.collect::<Result<Vec<_>>>()
        .map_err(|e| format!("Failed to collect order items: {}", e))?;
    
    Ok(result)
}

#[tauri::command]
pub fn get_order_with_items(state: tauri::State<DbState>, order_id: i32) -> Result<OrderWithItems, String> {
    let order = get_order_by_id(state.clone(), order_id)?;
    let items = get_order_items(state, order_id)?;
    
    Ok(OrderWithItems { order, items })
}

#[tauri::command]
pub fn get_recent_orders(state: tauri::State<DbState>, limit: Option<i32>) -> Result<Vec<Order>, String> {
    println!("Backend: Getting recent orders");
    
    let limit = limit.unwrap_or(10);
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT id, order_id, cashier, subtotal, tax, total, status, created_at
         FROM orders
         ORDER BY created_at DESC
         LIMIT ?1"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let orders = stmt.query_map(params![limit], |row| {
        Ok(Order {
            id: row.get(0)?,
            order_id: row.get(1)?,
            cashier: row.get(2)?,
            subtotal: row.get(3)?,
            tax: row.get(4)?,
            total: row.get(5)?,
            status: row.get(6)?,
            created_at: row.get(7)?,
        })
    }).map_err(|e| format!("Failed to query orders: {}", e))?;
    
    let result = orders.collect::<Result<Vec<_>>>()
        .map_err(|e| format!("Failed to collect orders: {}", e))?;
    
    Ok(result)
}

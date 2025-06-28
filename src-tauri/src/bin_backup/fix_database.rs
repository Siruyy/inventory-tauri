use rusqlite::{Connection, params};
use std::path::Path;
use chrono::{Local, Duration, Timelike};

fn main() {
    println!("Starting database fix...");

    // Get the path to the database
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize().unwrap());
    
    // Connect to the database
    let conn = Connection::open(db_path).expect("Failed to open database");
    
    // Fix order dates
    fix_order_dates(&conn);
}

fn fix_order_dates(conn: &Connection) {
    println!("Checking orders in the database...");
    
    // First, get all orders
    let mut stmt = conn.prepare("SELECT id, order_id FROM orders ORDER BY id")
        .expect("Failed to prepare statement");
    
    let orders = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // id
            row.get::<_, String>(1)?, // order_id
        ))
    }).expect("Failed to query orders");
    
    let mut orders_vec = Vec::new();
    for order in orders {
        if let Ok(order_data) = order {
            orders_vec.push(order_data);
        }
    }
    
    println!("Found {} orders in the database", orders_vec.len());
    
    // Get today's date and create a range of dates for the past week
    let today = Local::now().naive_local().date();
    
    // Most orders should be from previous days
    let mut update_stmt = conn.prepare("UPDATE orders SET created_at = ? WHERE id = ?")
        .expect("Failed to prepare update statement");
    
    println!("Distributing order dates across the past week...");
    
    // Leave one order for today (most recent one)
    if !orders_vec.is_empty() {
        let last_order = orders_vec.pop().unwrap();
        let today_datetime = format!("{} {:02}:{:02}:{:02}", 
                               today.format("%Y-%m-%d"),
                               Local::now().hour(),
                               Local::now().minute(),
                               Local::now().second());
        
        update_stmt.execute(params![today_datetime, last_order.0])
            .expect("Failed to update most recent order");
        
        println!("  Set order ID: {} (OrderID: {}) to today: {}", 
                 last_order.0, last_order.1, today_datetime);
    }
    
    // Distribute remaining orders across past days
    let mut days_ago = 1;
    for (id, order_id) in orders_vec {
        // Calculate a date in the past
        let past_date = today - Duration::days(days_ago);
        
        // Create a timestamp with a random hour between 8am and 8pm
        let hour = 8 + (id as u32 % 12); // Between 8 and 19
        let minute = id as u32 % 60;
        let second = (id * 7) as u32 % 60;
        
        let timestamp = format!("{} {:02}:{:02}:{:02}", 
                               past_date.format("%Y-%m-%d"),
                               hour, minute, second);
        
        update_stmt.execute(params![timestamp, id])
            .expect(&format!("Failed to update order {}", id));
        
        println!("  Updated order ID: {}, OrderID: {}, Date: {}", 
                 id, order_id, timestamp);
        
        // Cycle through the past 7 days
        days_ago = (days_ago % 7) + 1;
    }
    
    println!("Order dates updated successfully!");
} 
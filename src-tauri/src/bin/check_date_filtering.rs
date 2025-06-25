use rusqlite::{Connection, params};
use std::path::Path;
use chrono::{Local, Timelike};

fn main() {
    println!("Starting date filtering diagnostic...");
    
    // Get the path to the database
    let db_path = Path::new("inventory.db");
    println!("Connecting to database at {:?}", db_path.canonicalize().unwrap());
    
    // Connect to the database
    let conn = Connection::open(db_path).expect("Failed to open database");
    
    // Get today's date
    let today = Local::now().format("%Y-%m-%d").to_string();
    println!("Today's date: {}", today);
    
    // Check orders on today's date
    check_orders_for_date(&conn, &today);
    
    // Test the SQL query directly
    test_date_filtering(&conn, &today);
}

fn check_orders_for_date(conn: &Connection, date: &str) {
    println!("\nChecking orders for date: {}", date);
    
    // First, get all orders
    let mut stmt = conn.prepare("SELECT id, order_id, created_at FROM orders ORDER BY created_at")
        .expect("Failed to prepare statement");
    
    let orders = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // id
            row.get::<_, String>(1)?, // order_id
            row.get::<_, String>(2)?, // created_at
        ))
    }).expect("Failed to query orders");
    
    let mut orders_vec = Vec::new();
    for order in orders {
        if let Ok(order_data) = order {
            orders_vec.push(order_data);
        }
    }
    
    println!("Found {} total orders in the database", orders_vec.len());
    
    // Filter orders for today
    let todays_orders: Vec<_> = orders_vec
        .iter()
        .filter(|(_, _, created_at)| created_at.starts_with(date))
        .collect();
    
    println!("Found {} orders for today ({})", todays_orders.len(), date);
    
    for (id, order_id, created_at) in &todays_orders {
        println!("  Order ID: {}, OrderID: {}, Created: {}", id, order_id, created_at);
    }
}

fn test_date_filtering(conn: &Connection, date: &str) {
    println!("\nTesting SQL date filtering for date: {}", date);
    
    // Test with date() function
    let query = "SELECT COUNT(*) FROM orders WHERE date(created_at) = date(?)";
    let count: i64 = conn.query_row(query, params![date], |row| row.get(0))
        .expect("Failed to execute date query");
    
    println!("Orders with date(created_at) = date('{}'): {}", date, count);
    
    // Test with strftime
    let query = "SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) = ?";
    let count: i64 = conn.query_row(query, params![date], |row| row.get(0))
        .expect("Failed to execute strftime query");
    
    println!("Orders with strftime('%Y-%m-%d', created_at) = '{}': {}", date, count);
    
    // Test with direct string comparison
    let query = "SELECT COUNT(*) FROM orders WHERE created_at LIKE ? || '%'";
    let count: i64 = conn.query_row(query, params![date], |row| row.get(0))
        .expect("Failed to execute LIKE query");
    
    println!("Orders with created_at LIKE '{}%': {}", date, count);
    
    // List all orders with their date parts
    println!("\nListing all orders with their date parts:");
    let mut stmt = conn.prepare("SELECT id, created_at, date(created_at), strftime('%Y-%m-%d', created_at) FROM orders")
        .expect("Failed to prepare statement");
    
    let rows = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?, // id
            row.get::<_, String>(1)?, // created_at
            row.get::<_, String>(2)?, // date(created_at)
            row.get::<_, String>(3)?, // strftime('%Y-%m-%d', created_at)
        ))
    }).expect("Failed to query orders");
    
    for row in rows {
        if let Ok((id, created_at, date_func, strftime_func)) = row {
            println!("  ID: {}, Created: {}, date(): {}, strftime(): {}", 
                     id, created_at, date_func, strftime_func);
        }
    }
} 
use crate::db::models::order::{NewOrder, NewOrderItem, Order, OrderItem, OrderWithItems};
use crate::db::DbState;
use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub order: NewOrder,
    pub items: Vec<NewOrderItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderHistoryRequest {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: Option<String>,
    pub limit: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SalesReportData {
    pub sales_summary: SalesSummary,
    pub sales_by_period: Vec<PeriodSales>,
    pub sales_by_category: Vec<CategorySales>,
    pub top_products: Vec<ProductSales>,
    pub detailed_sales: Vec<DetailedSale>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SalesSummary {
    pub total_sales: f64,
    pub total_revenue: f64,
    pub total_profit: f64,
    pub items_sold: i64,
    pub transactions: i64,
    pub sales_growth: f64,
    pub revenue_growth: f64,
    pub profit_growth: f64,
    pub items_growth: f64,
    pub transactions_growth: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PeriodSales {
    pub period: String,
    pub sales: f64,
    pub revenue: f64,
    pub profit: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CategorySales {
    pub category: String,
    pub value: f64,
    pub percentage: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductSales {
    pub name: String,
    pub sales: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DetailedSale {
    pub id: i32,
    pub product: String,
    pub category: String,
    pub date: String,
    pub price: f64,
    pub profit: f64,
    pub margin: String,
    pub revenue: f64,
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

#[tauri::command]
pub fn get_order_history(state: tauri::State<DbState>, request: OrderHistoryRequest) -> Result<Vec<Order>, String> {
    println!("Backend: Getting order history with filters");
    
    let limit = request.limit.unwrap_or(100);
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Build query based on filters
    let mut query = String::from(
        "SELECT id, order_id, cashier, subtotal, tax, total, status, created_at
         FROM orders WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date) = &request.start_date {
        query.push_str(" AND created_at >= ?");
        query_params.push(Box::new(start_date.clone()));
    }
    
    if let Some(end_date) = &request.end_date {
        query.push_str(" AND created_at <= ?");
        query_params.push(Box::new(end_date.clone()));
    }
    
    // Add status filter if provided
    if let Some(status) = &request.status {
        query.push_str(" AND status = ?");
        query_params.push(Box::new(status.clone()));
    }
    
    // Add order by and limit
    query.push_str(" ORDER BY created_at DESC LIMIT ?");
    query_params.push(Box::new(limit));
    
    // Prepare and execute the query
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    // Convert query_params to a slice of ToSql traits
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let orders = stmt.query_map(params_slice.as_slice(), |row| {
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

#[tauri::command]
pub fn get_order_statistics(state: tauri::State<DbState>, start_date: Option<String>, end_date: Option<String>) -> Result<OrderStatistics, String> {
    println!("Backend: Getting order statistics");
    
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Build base query
    let mut query = String::from(
        "SELECT COUNT(*) as order_count, 
                SUM(total) as total_revenue,
                AVG(total) as avg_order_value,
                COUNT(DISTINCT cashier) as unique_cashiers
         FROM orders WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(start_date_str.clone()));
    }
    
    if let Some(end_date_str) = &end_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(end_date_str.clone()));
    }
    
    // Prepare and execute the query
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    // Convert query_params to a slice of ToSql traits
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let stats = stmt.query_row(params_slice.as_slice(), |row| {
        Ok(OrderStatistics {
            order_count: row.get(0)?,
            total_revenue: row.get(1)?,
            avg_order_value: row.get(2)?,
            unique_cashiers: row.get(3)?,
        })
    }).map_err(|e| format!("Failed to get order statistics: {}", e))?;
    
    Ok(stats)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderStatistics {
    pub order_count: i64,
    pub total_revenue: f64,
    pub avg_order_value: f64,
    pub unique_cashiers: i64,
}

#[tauri::command]
pub fn get_sales_report_data(state: tauri::State<DbState>, start_date: Option<String>, end_date: Option<String>, period: String) -> Result<SalesReportData, String> {
    println!("Backend: Getting sales report data for dates: {:?} to {:?}, period: {}", start_date, end_date, period);
    
    // Validate date formats if provided
    if let Some(start_date_str) = &start_date {
        if chrono::NaiveDate::parse_from_str(start_date_str, "%Y-%m-%d").is_err() {
            return Err(format!("Invalid start date format: {}, expected YYYY-MM-DD", start_date_str));
        }
    }
    
    if let Some(end_date_str) = &end_date {
        if chrono::NaiveDate::parse_from_str(end_date_str, "%Y-%m-%d").is_err() {
            return Err(format!("Invalid end date format: {}, expected YYYY-MM-DD", end_date_str));
        }
    }
    
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // If there are no orders in the selected date range, return empty data
    let has_orders = check_orders_exist(&conn, start_date.clone(), end_date.clone())?;
    println!("Backend: Has orders in date range: {}", has_orders);
    
    if !has_orders {
        println!("No orders found in date range, returning empty data");
        return Ok(SalesReportData {
            sales_summary: SalesSummary {
                total_sales: 0.0,
                total_revenue: 0.0,
                total_profit: 0.0,
                items_sold: 0,
                transactions: 0,
                sales_growth: 0.0,
                revenue_growth: 0.0,
                profit_growth: 0.0,
                items_growth: 0.0,
                transactions_growth: 0.0,
            },
            sales_by_period: Vec::new(),
            sales_by_category: Vec::new(),
            top_products: Vec::new(),
            detailed_sales: Vec::new(),
        });
    }
    
    // Get sales summary
    let sales_summary = get_sales_summary(&conn, start_date.clone(), end_date.clone())?;
    
    // Get sales by period (day, week, month, year)
    let sales_by_period = get_sales_by_period(&conn, start_date.clone(), end_date.clone(), &period)?;
    
    // Get sales by category
    let sales_by_category = get_sales_by_category(&conn, start_date.clone(), end_date.clone())?;
    
    // Get top products
    let top_products = get_top_products(&conn, start_date.clone(), end_date.clone(), 10)?;
    
    // Get detailed sales
    let detailed_sales = get_detailed_sales(&conn, start_date.clone(), end_date.clone())?;
    
    Ok(SalesReportData {
        sales_summary,
        sales_by_period,
        sales_by_category,
        top_products,
        detailed_sales,
    })
}

// Helper function to check if any orders exist in the given date range
fn check_orders_exist(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>) -> Result<bool, String> {
    // Log the date parameters to help with debugging
    println!("Checking if orders exist between: {:?} and {:?}", start_date, end_date);
    
    // First, let's log all existing orders with their dates for debugging
    println!("--- All Order Dates in Database ---");
    let all_dates_query = "SELECT id, order_id, created_at, 
                          strftime('%Y-%m-%d', created_at) as date_only,
                          strftime('%Y-%m-%d %H:%M:%S', created_at) as datetime_formatted 
                          FROM orders ORDER BY created_at";
    let mut all_dates_stmt = conn.prepare(all_dates_query)
        .map_err(|e| format!("Failed to prepare all dates statement: {}", e))?;
    
    let all_dates_rows = all_dates_stmt.query_map([], |row| {
        let id: i32 = row.get(0)?;
        let order_id: String = row.get(1)?;
        let full_date: String = row.get(2)?;
        let date_only: String = row.get(3)?;
        let datetime_formatted: String = row.get(4)?;
        Ok((id, order_id, full_date, date_only, datetime_formatted))
    }).map_err(|e| format!("Failed to query all order dates: {}", e))?;
    
    for row in all_dates_rows {
        if let Ok((id, order_id, full_date, date_only, datetime_formatted)) = row {
            println!("Order #{}: ID {}, Full Date: {}, Date Only: {}, Formatted: {}", 
                    order_id, id, full_date, date_only, datetime_formatted);
        }
    }
    println!("--- End Order Dates ---");
    
    // If dates are provided, test direct comparisons for debugging
    if let Some(start_date_str) = &start_date {
        let test_query = format!("SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) >= '{}'", start_date_str);
        match conn.query_row(&test_query, [], |row| row.get::<_, i64>(0)) {
            Ok(count) => println!("Test start date {}: found {} orders", start_date_str, count),
            Err(e) => println!("Test start date error: {}", e),
        }
    }
    
    if let Some(end_date_str) = &end_date {
        let test_query = format!("SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) <= '{}'", end_date_str);
        match conn.query_row(&test_query, [], |row| row.get::<_, i64>(0)) {
            Ok(count) => println!("Test end date {}: found {} orders", end_date_str, count),
            Err(e) => println!("Test end date error: {}", e),
        }
    }
    
    // Use a more reliable date comparison with strftime to ensure proper format handling
    let mut query = String::from(
        "SELECT COUNT(*) FROM orders WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', created_at) >= ?");
        println!("Filtering orders on or after date: {}", start_date_str);
        query_params.push(Box::new(start_date_str.clone()));
    }
    
    if let Some(end_date_str) = &end_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', created_at) <= ?");
        println!("Filtering orders on or before date: {}", end_date_str);
        query_params.push(Box::new(end_date_str.clone()));
    }
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let count: i64 = stmt.query_row(params_slice.as_slice(), |row| row.get(0))
        .map_err(|e| format!("Failed to check if orders exist: {}", e))?;
    
    println!("Found {} orders matching date range", count);
    
    Ok(count > 0)
}

fn get_sales_summary(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>) -> Result<SalesSummary, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT SUM(o.total) as total_sales,
                SUM(o.subtotal) as total_revenue,
                SUM(o.total) * 0.2 as total_profit,
                SUM(oi.quantity) as items_sold,
                COUNT(DISTINCT o.id) as transactions
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE 1=1"
    );
    
    let mut current_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    let mut previous_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', o.created_at) >= ?");
        current_params.push(Box::new(start_date_str.clone()));
        println!("Sales summary - filtering orders on or after date: {}", start_date_str);
    }
    
    if let Some(end_date_str) = &end_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', o.created_at) <= ?");
        current_params.push(Box::new(end_date_str.clone()));
        println!("Sales summary - filtering orders on or before date: {}", end_date_str);
    }
    
    // Prepare and execute the query for current period
    let current_params_slice: Vec<&dyn rusqlite::ToSql> = current_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare current period statement: {}", e))?;
    
    let current_summary = match stmt.query_row(current_params_slice.as_slice(), |row| {
        Ok((
            row.get::<_, f64>(0).unwrap_or(0.0),
            row.get::<_, f64>(1).unwrap_or(0.0),
            row.get::<_, f64>(2).unwrap_or(0.0),
            row.get::<_, i64>(3).unwrap_or(0),
            row.get::<_, i64>(4).unwrap_or(0),
        ))
    }) {
        Ok(result) => result,
        Err(e) => {
            if let rusqlite::Error::QueryReturnedNoRows = e {
                (0.0, 0.0, 0.0, 0, 0)
            } else {
                return Err(format!("Failed to get current period sales summary: {}", e));
            }
        }
    };
    
    // Get previous period data for comparison (if date range provided)
    let (prev_sales, prev_revenue, prev_profit, prev_items, prev_transactions) = 
        if let (Some(start_date_str), Some(end_date_str)) = (&start_date, &end_date) {
            // Parse dates
            let start_date = chrono::NaiveDate::parse_from_str(start_date_str, "%Y-%m-%d")
                .map_err(|e| format!("Failed to parse start date: {}", e))?;
            let end_date = chrono::NaiveDate::parse_from_str(end_date_str, "%Y-%m-%d")
                .map_err(|e| format!("Failed to parse end date: {}", e))?;
            
            // Calculate the length of the period
            let period_length = (end_date.signed_duration_since(start_date).num_days() + 1) as i64;
            
            // Calculate previous period start and end dates
            let prev_end_date = start_date.pred_opt()
                .ok_or("Failed to calculate previous period end date")?;
            let prev_start_date = prev_end_date.checked_sub_signed(chrono::Duration::days(period_length - 1))
                .ok_or("Failed to calculate previous period start date")?;
            
            // Build query for previous period
            let mut prev_query = query.clone();
            
            // Replace date parameters
            previous_params.push(Box::new(prev_start_date.format("%Y-%m-%d").to_string()));
            if current_params.len() > 1 {
                previous_params.push(Box::new(prev_end_date.format("%Y-%m-%d").to_string()));
            }
            
            // Execute query for previous period
            let previous_params_slice: Vec<&dyn rusqlite::ToSql> = previous_params
                .iter()
                .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
                .collect();
            
            let mut prev_stmt = conn.prepare(&prev_query)
                .map_err(|e| format!("Failed to prepare previous period statement: {}", e))?;
            
            match prev_stmt.query_row(previous_params_slice.as_slice(), |row| {
                Ok((
                    row.get::<_, f64>(0).unwrap_or(0.0),
                    row.get::<_, f64>(1).unwrap_or(0.0),
                    row.get::<_, f64>(2).unwrap_or(0.0),
                    row.get::<_, i64>(3).unwrap_or(0),
                    row.get::<_, i64>(4).unwrap_or(0),
                ))
            }) {
                Ok(result) => result,
                Err(e) => {
                    if let rusqlite::Error::QueryReturnedNoRows = e {
                        (0.0, 0.0, 0.0, 0, 0)
                    } else {
                        return Err(format!("Failed to get previous period sales summary: {}", e));
                    }
                }
            }
        } else {
            (0.0, 0.0, 0.0, 0, 0)
        };
    
    // Calculate growth percentages
    let calculate_growth = |current: f64, previous: f64| -> f64 {
        if previous == 0.0 {
            if current > 0.0 { 100.0 } else { 0.0 }
        } else {
            ((current - previous) / previous) * 100.0
        }
    };
    
    let calculate_growth_int = |current: i64, previous: i64| -> f64 {
        if previous == 0 {
            if current > 0 { 100.0 } else { 0.0 }
        } else {
            ((current as f64 - previous as f64) / previous as f64) * 100.0
        }
    };
    
    let (total_sales, total_revenue, total_profit, items_sold, transactions) = current_summary;
    
    Ok(SalesSummary {
        total_sales,
        total_revenue,
        total_profit,
        items_sold,
        transactions,
        sales_growth: calculate_growth(total_sales, prev_sales),
        revenue_growth: calculate_growth(total_revenue, prev_revenue),
        profit_growth: calculate_growth(total_profit, prev_profit),
        items_growth: calculate_growth_int(items_sold, prev_items),
        transactions_growth: calculate_growth_int(transactions, prev_transactions),
    })
}

fn get_sales_by_period(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>, period_type: &str) -> Result<Vec<PeriodSales>, String> {
    // Define the date format and group by based on the period type
    let date_format = match period_type {
        "day" => "strftime('%Y-%m-%d', created_at)",
        "week" => "strftime('%Y-%W', created_at)",
        "month" => "strftime('%Y-%m', created_at)",
        "year" => "strftime('%Y', created_at)",
        _ => return Err(format!("Invalid period type: {}", period_type)),
    };
    
    // Log for debugging
    println!("Getting sales by period: {}, date format: {}", period_type, date_format);
    
    // Build query based on filters
    let mut query = format!(
        "SELECT {} as period,
                SUM(total) as sales,
                SUM(subtotal) as revenue,
                SUM(total) * 0.2 as profit
         FROM orders
         WHERE 1=1",
        date_format
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', created_at) >= ?");
        query_params.push(Box::new(start_date_str.clone()));
        println!("Sales by period - filtering orders on or after date: {}", start_date_str);
    }
    
    if let Some(end_date_str) = &end_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', created_at) <= ?");
        query_params.push(Box::new(end_date_str.clone()));
        println!("Sales by period - filtering orders on or before date: {}", end_date_str);
    }
    
    // Add group by using the same date format expression
    query.push_str(&format!(" GROUP BY {} ORDER BY period", date_format));
    
    // Log complete query
    println!("Query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map(params_slice.as_slice(), |row| {
        Ok(PeriodSales {
            period: row.get(0)?,
            sales: row.get(1)?,
            revenue: row.get(2)?,
            profit: row.get(3)?,
        })
    }).map_err(|e| format!("Failed to query sales by period: {}", e))?;
    
    let result = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect sales by period: {}", e))?;
    
    println!("Found {} periods with sales data", result.len());
    
    Ok(result)
}

fn get_sales_by_category(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>) -> Result<Vec<CategorySales>, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT c.name as category,
                SUM(oi.quantity * oi.price) as value
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(o.created_at) >= date(?)");
        query_params.push(Box::new(start_date_str.clone()));
    }
    
    if let Some(end_date_str) = &end_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(o.created_at) <= date(?)");
        query_params.push(Box::new(end_date_str.clone()));
    }
    
    // Add group by
    query.push_str(" GROUP BY c.name ORDER BY value DESC");
    
    // Log the query
    println!("Category sales query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map(params_slice.as_slice(), |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, f64>(1)?,
        ))
    }).map_err(|e| format!("Failed to query sales by category: {}", e))?;
    
    let categories_with_values: Vec<(String, f64)> = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect sales by category: {}", e))?;
    
    println!("Found {} categories with sales", categories_with_values.len());
    
    // Calculate total and percentages
    let total_value: f64 = categories_with_values.iter().map(|(_, value)| value).sum();
    
    let result = categories_with_values.into_iter()
        .map(|(category, value)| {
            let percentage = if total_value > 0.0 {
                (value / total_value) * 100.0
            } else {
                0.0
            };
            
            CategorySales {
                category,
                value,
                percentage,
            }
        })
        .collect();
    
    Ok(result)
}

fn get_top_products(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>, limit: i32) -> Result<Vec<ProductSales>, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT p.name,
                SUM(oi.quantity) as quantity
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(o.created_at) >= date(?)");
        query_params.push(Box::new(start_date_str.clone()));
    }
    
    if let Some(end_date_str) = &end_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(o.created_at) <= date(?)");
        query_params.push(Box::new(end_date_str.clone()));
    }
    
    // Add group by and limit
    query.push_str(" GROUP BY p.id ORDER BY quantity DESC LIMIT ?");
    query_params.push(Box::new(limit));
    
    // Log the query
    println!("Top products query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map(params_slice.as_slice(), |row| {
        Ok(ProductSales {
            name: row.get(0)?,
            sales: row.get(1)?,
        })
    }).map_err(|e| format!("Failed to query top products: {}", e))?;
    
    let result = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect top products: {}", e))?;
    
    println!("Found {} top products", result.len());
    
    Ok(result)
}

fn get_detailed_sales(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>) -> Result<Vec<DetailedSale>, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT oi.id,
                p.name as product,
                c.name as category,
                o.created_at as date,
                oi.price,
                oi.price * 0.2 as profit,
                '20.00%' as margin,
                oi.price * oi.quantity as revenue
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(start_date_str) = &start_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', o.created_at) >= ?");
        query_params.push(Box::new(start_date_str.clone()));
        println!("Detailed sales - filtering orders on or after date: {}", start_date_str);
    }
    
    if let Some(end_date_str) = &end_date {
        // Use strftime for consistent comparison based on YYYY-MM-DD format
        query.push_str(" AND strftime('%Y-%m-%d', o.created_at) <= ?");
        query_params.push(Box::new(end_date_str.clone()));
        println!("Detailed sales - filtering orders on or before date: {}", end_date_str);
    }
    
    // Add order by
    query.push_str(" ORDER BY o.created_at DESC LIMIT 20");
    
    // Log the query
    println!("Detailed sales query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map(params_slice.as_slice(), |row| {
        Ok(DetailedSale {
            id: row.get(0)?,
            product: row.get(1)?,
            category: row.get(2)?,
            date: row.get(3)?,
            price: row.get(4)?,
            profit: row.get(5)?,
            margin: row.get(6)?,
            revenue: row.get(7)?,
        })
    }).map_err(|e| format!("Failed to query detailed sales: {}", e))?;
    
    let result = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect detailed sales: {}", e))?;
    
    println!("Found {} detailed sales records", result.len());
    
    Ok(result)
}

#[tauri::command]
pub fn debug_order_dates(state: tauri::State<DbState>) -> Result<Vec<String>, String> {
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Query to get detailed information about all orders
    let query = "SELECT id, order_id, created_at, strftime('%Y-%m-%d', created_at) as date_only FROM orders ORDER BY created_at";
    
    let mut stmt = conn.prepare(query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map([], |row| {
        let id: i32 = row.get(0)?;
        let order_id: String = row.get(1)?;
        let full_date: String = row.get(2)?;
        let date_only: String = row.get(3)?;
        Ok(format!("ID: {}, Order: {}, Full Date: {}, Date Only: {}", id, order_id, full_date, date_only))
    }).map_err(|e| format!("Failed to query order dates: {}", e))?;
    
    let mut dates = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect order dates: {}", e))?;
    
    // Also add detailed debug information about date range filtering
    dates.push("--- DATE FILTERING DEBUG INFO ---".to_string());
    
    // Test some date filters
    let test_dates = vec![
        "2025-05-01", // May 1, 2025
        "2025-05-03", // May 3, 2025
        "2025-06-10", // June 10, 2025 (the order date)
        "2025-06-11", // June 11, 2025
    ];
    
    for date in test_dates {
        // Test with strftime
        let strftime_query = format!("SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) = '{}'", date);
        match conn.query_row(&strftime_query, [], |row| row.get::<_, i64>(0)) {
            Ok(count) => {
                dates.push(format!("Date {} using strftime: {} orders", date, count));
            },
            Err(e) => {
                dates.push(format!("Error querying with strftime for {}: {}", date, e));
            }
        }
        
        // Test with date function
        let date_query = format!("SELECT COUNT(*) FROM orders WHERE date(created_at) = date('{}')", date);
        match conn.query_row(&date_query, [], |row| row.get::<_, i64>(0)) {
            Ok(count) => {
                dates.push(format!("Date {} using date(): {} orders", date, count));
            },
            Err(e) => {
                dates.push(format!("Error querying with date() for {}: {}", date, e));
            }
        }
    }
    
    dates.push("--- END DEBUG INFO ---".to_string());
    
    Ok(dates)
}

#[tauri::command]
pub fn update_order_dates_to_today(state: tauri::State<DbState>) -> Result<String, String> {
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Get current date with time in ISO format that SQLite can understand
    let current_date = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    // Set all orders to today's date
    let query = "UPDATE orders SET created_at = ?";
    
    conn.execute(query, [&current_date])
        .map_err(|e| format!("Failed to update order dates: {}", e))?;
    
    Ok(format!("Successfully updated all order dates to {}", current_date))
}
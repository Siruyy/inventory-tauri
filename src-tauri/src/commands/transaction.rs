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
    pub quantity: i64,
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
        // Get the product name to store it
        let product_name: String = match tx.query_row(
            "SELECT name FROM products WHERE id = ?1",
            params![item.product_id],
            |row| row.get(0)
        ) {
            Ok(name) => name,
            Err(e) => {
                let error_msg = format!("Failed to get product name: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        };
        
        tx.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price, product_name) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                order_id,
                item.product_id,
                item.quantity,
                item.price,
                product_name
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
        "SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.created_at, 
                COALESCE(p.name, oi.product_name, 'Deleted Product') as product_name
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
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
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Build query based on filters
    let mut query = String::from(
        "SELECT id, order_id, cashier, subtotal, tax, total, status, created_at
         FROM orders
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_start_date_str) = &request.start_date {
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(request.start_date.clone()));
    }
    
    if let Some(_end_date_str) = &request.end_date {
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(request.end_date.clone()));
    }
    
    // Add status filter if provided
    if let Some(status) = &request.status {
        if !status.is_empty() {
            query.push_str(" AND status = ?");
            query_params.push(Box::new(status.clone()));
        }
    }
    
    // Add order by and limit
    query.push_str(" ORDER BY created_at DESC");
    
    if let Some(limit) = request.limit {
        query.push_str(" LIMIT ?");
        query_params.push(Box::new(limit));
    } else {
        query.push_str(" LIMIT 100"); // Default limit
    }
    
    // Log the query
    println!("Order history query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map(params_slice.as_slice(), |row| {
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
    }).map_err(|e| format!("Failed to query order history: {}", e))?;
    
    let result = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect order history: {}", e))?;
    
    println!("Found {} orders in history", result.len());
    
    Ok(result)
}

#[tauri::command]
pub fn get_order_statistics(state: tauri::State<DbState>, start_date: Option<String>, end_date: Option<String>) -> Result<OrderStatistics, String> {
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Build query based on filters
    let mut query = String::from(
        "SELECT COUNT(*) as order_count,
                SUM(total) as total_revenue,
                AVG(total) as avg_order_value,
                COUNT(DISTINCT cashier) as unique_cashiers
         FROM orders
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_start_date_str) = &start_date {
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(start_date.clone()));
    }
    
    if let Some(_end_date_str) = &end_date {
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(end_date.clone()));
    }
    
    // Log the query
    println!("Order statistics query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let row = stmt.query_row(params_slice.as_slice(), |row| {
        Ok(OrderStatistics {
            order_count: row.get(0)?,
            total_revenue: row.get(1)?,
            avg_order_value: row.get(2)?,
            unique_cashiers: row.get(3)?,
        })
    }).map_err(|e| format!("Failed to query order statistics: {}", e))?;
    
    Ok(row)
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
    
    // Even if no orders match, run queries—they'll simply return empty / zeroed data.
    // This avoids false "no data" cases caused by mis-counting.
    
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

fn get_sales_summary(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>) -> Result<SalesSummary, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT COUNT(DISTINCT o.id) as total_sales,
                SUM(oi.price * oi.quantity) as total_revenue,
                SUM((oi.price - COALESCE(p.price_bought, oi.price * 0.6)) * oi.quantity) as total_profit,
                SUM(oi.quantity) as items_sold,
                COUNT(DISTINCT o.id) as transactions
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_start_date_str) = &start_date {
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(start_date.clone()));
    }
    
    if let Some(_end_date_str) = &end_date {
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(end_date.clone()));
    }
    
    // Log the query
    println!("Sales summary query: {}", query);
    
    // Prepare and execute the query
    let params_slice: Vec<&dyn rusqlite::ToSql> = query_params
        .iter()
        .map(|p| p.as_ref() as &dyn rusqlite::ToSql)
        .collect();
    
    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    // Execute the query and get the results
    let row = stmt.query_row(params_slice.as_slice(), |row| {
        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, f64>(1)?,
            row.get::<_, f64>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, i64>(4)?,
        ))
    }).map_err(|e| format!("Failed to query sales summary: {}", e))?;
    
    let (total_sales, total_revenue, total_profit, items_sold, transactions) = row;
    
    // Calculate growth metrics (comparing to previous period)
    // For simplicity, we'll just return 0 for growth metrics
    // In a real app, you would calculate this by comparing to a previous period
    
    Ok(SalesSummary {
        total_sales: total_sales as f64,
        total_revenue,
        total_profit,
        items_sold,
        transactions,
        sales_growth: 0.0,
        revenue_growth: 0.0,
        profit_growth: 0.0,
        items_growth: 0.0,
        transactions_growth: 0.0,
    })
}

fn get_sales_by_period(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>, period_type: &str) -> Result<Vec<PeriodSales>, String> {
    // Determine the date format based on the period type
    let date_format = match period_type {
        "day" => "%Y-%m-%d",
        "month" => "%Y-%m",
        "year" => "%Y",
        _ => return Err(format!("Invalid period type: {}", period_type)),
    };
    
    // Build query based on filters
    let mut query = String::from(
        format!(
            "SELECT strftime('{}', o.created_at) as period,
                    COUNT(DISTINCT o.id) as sales,
                    SUM(oi.price * oi.quantity) as revenue,
                    SUM((oi.price - COALESCE(p.price_bought, oi.price * 0.6)) * oi.quantity) as profit
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE 1=1",
            date_format
        )
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_start_date_str) = &start_date {
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(start_date.clone()));
    }
    
    if let Some(_end_date_str) = &end_date {
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(end_date.clone()));
    }
    
    // Add group by and order by
    query.push_str(" GROUP BY period ORDER BY period");
    
    // Log the query
    println!("Period sales query: {}", query);
    
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
    
    println!("Found {} periods with sales", result.len());
    
    Ok(result)
}

fn get_sales_by_category(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>) -> Result<Vec<CategorySales>, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT c.name as category,
                SUM(oi.price * oi.quantity) as total_revenue,
                (SUM(oi.price * oi.quantity) / (SELECT SUM(oi2.price * oi2.quantity) FROM orders o2 JOIN order_items oi2 ON o2.id = oi2.order_id"
    );
    
    // Add date filters to the subquery if provided
    if start_date.is_some() || end_date.is_some() {
        query.push_str(" WHERE 1=1");
        
        if let Some(_) = &start_date {
            query.push_str(" AND date(o2.created_at) >= date(?)");
        }
        
        if let Some(_) = &end_date {
            query.push_str(" AND date(o2.created_at) <= date(?)");
        }
    }
    
    query.push_str(")) * 100 as percentage
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         WHERE 1=1");
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_) = &start_date {
        // Add parameter for subquery
        query_params.push(Box::new(start_date.clone()));
        
        // Add parameter for main query
        query.push_str(" AND date(o.created_at) >= date(?)");
        query_params.push(Box::new(start_date.clone()));
    }
    
    if let Some(_) = &end_date {
        // Add parameter for subquery
        query_params.push(Box::new(end_date.clone()));
        
        // Add parameter for main query
        query.push_str(" AND date(o.created_at) <= date(?)");
        query_params.push(Box::new(end_date.clone()));
    }
    
    // Add group by
    query.push_str(" GROUP BY c.id ORDER BY total_revenue DESC");
    
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
        Ok(CategorySales {
            category: row.get(0)?,
            value: row.get(1)?,
            percentage: row.get(2)?,
        })
    }).map_err(|e| format!("Failed to query category sales: {}", e))?;
    
    let result = rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect category sales: {}", e))?;
    
    println!("Found {} category sales records", result.len());
    
    Ok(result)
}

fn get_top_products(conn: &rusqlite::Connection, start_date: Option<String>, end_date: Option<String>, limit: i32) -> Result<Vec<ProductSales>, String> {
    // Build query based on filters
    let mut query = String::from(
        "SELECT p.name, SUM(oi.quantity) as quantity
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_) = &start_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(start_date.clone()));
    }
    
    if let Some(_) = &end_date {
        // Use SQLite's date functions to ensure proper comparison
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(end_date.clone()));
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
                COALESCE(p.name, 'Unknown Product') as product_name,
                COALESCE(c.name, 'Uncategorized') as category_name,
                o.created_at as sale_date,
                oi.price as unit_price,
                (oi.price - COALESCE(p.price_bought, oi.price * 0.6)) as unit_profit,
                CASE 
                    WHEN oi.price > 0 THEN ROUND(((oi.price - COALESCE(p.price_bought, oi.price * 0.6)) / oi.price) * 100, 1) || '%'
                    ELSE '0%'
                END as profit_margin,
                (oi.price * oi.quantity) as revenue,
                oi.quantity
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE 1=1"
    );
    
    let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    // Add date range filters if provided
    if let Some(_) = &start_date {
        // Use date() function for consistent comparison
        query.push_str(" AND date(created_at) >= date(?)");
        query_params.push(Box::new(start_date.clone()));
        println!("Detailed sales - filtering orders on or after date: {}", start_date.clone().unwrap_or_default());
    }
    
    if let Some(_) = &end_date {
        // Use date() function for consistent comparison
        query.push_str(" AND date(created_at) <= date(?)");
        query_params.push(Box::new(end_date.clone()));
        println!("Detailed sales - filtering orders on or before date: {}", end_date.clone().unwrap_or_default());
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
            quantity: row.get(8)?,
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

#[tauri::command]
pub fn test_date_filtering(state: tauri::State<DbState>, test_date: String) -> Result<Vec<String>, String> {
    let conn = state.pool.get()
        .map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    let mut results = Vec::new();
    
    // Log the test date
    results.push(format!("Testing date filtering with date: {}", test_date));
    
    // Test different date comparison methods
    let test_queries = vec![
        (format!("SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) = '{}'", test_date), 
         "strftime exact match"),
        (format!("SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) >= '{}'", test_date), 
         "strftime >= comparison"),
        (format!("SELECT COUNT(*) FROM orders WHERE strftime('%Y-%m-%d', created_at) <= '{}'", test_date), 
         "strftime <= comparison"),
        (format!("SELECT COUNT(*) FROM orders WHERE date(created_at) = date('{}')", test_date), 
         "date() exact match"),
        (format!("SELECT COUNT(*) FROM orders WHERE date(created_at) >= date('{}')", test_date), 
         "date() >= comparison"),
        (format!("SELECT COUNT(*) FROM orders WHERE date(created_at) <= date('{}')", test_date), 
         "date() <= comparison"),
    ];
    
    for (query, description) in test_queries {
        match conn.query_row(&query, [], |row| row.get::<_, i64>(0)) {
            Ok(count) => {
                results.push(format!("{}: {} orders", description, count));
            },
            Err(e) => {
                results.push(format!("Error with {}: {}", description, e));
            }
        }
    }
    
    // List all orders with their dates for comparison
    results.push("\nAll orders with dates:".to_string());
    let all_orders_query = "SELECT id, order_id, created_at, strftime('%Y-%m-%d', created_at) as date_only FROM orders ORDER BY created_at";
    
    let mut stmt = conn.prepare(all_orders_query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let rows = stmt.query_map([], |row| {
        let id: i32 = row.get(0)?;
        let order_id: String = row.get(1)?;
        let full_date: String = row.get(2)?;
        let date_only: String = row.get(3)?;
        Ok((id, order_id, full_date, date_only))
    }).map_err(|e| format!("Failed to query order dates: {}", e))?;
    
    for row_result in rows {
        if let Ok((id, order_id, full_date, date_only)) = row_result {
            results.push(format!("Order #{}: ID {}, Full Date: {}, Date Only: {}", 
                               order_id, id, full_date, date_only));
        }
    }
    
    Ok(results)
}
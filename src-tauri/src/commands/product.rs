use crate::db::models::product::{Product, NewProduct, ProductWithCategory};
use crate::db::DbState;
use rusqlite::{params, Result};

#[derive(Debug, serde::Deserialize)]
pub struct UpdateProduct {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub category_id: i32,
    pub unit_price: f64,
    pub price_bought: f64,
    pub current_stock: i32,
    pub minimum_stock: Option<i32>,
    pub supplier: Option<String>,
}

#[tauri::command]
pub fn get_all_products(state: tauri::State<DbState>) -> Result<Vec<ProductWithCategory>, String> {
    println!("Backend: Getting all products");
    let conn = state.pool.get().map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.description, p.sku, p.category_id, c.name as category_name, 
         p.unit_price, p.price_bought, p.current_stock, p.minimum_stock, p.supplier, p.created_at, p.updated_at
         FROM products p
         JOIN categories c ON p.category_id = c.id
         ORDER BY p.name"
    ).map_err(|e| {
        println!("Backend error preparing get_all_products: {}", e);
        e.to_string()
    })?;

    let products = stmt.query_map([], |row| {
        Ok(ProductWithCategory {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            sku: row.get(3)?,
            category_id: row.get(4)?,
            category_name: row.get(5)?,
            unit_price: row.get(6)?,
            price_bought: row.get(7)?,
            current_stock: row.get(8)?,
            minimum_stock: row.get(9)?,
            supplier: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    }).map_err(|e| {
        println!("Backend error querying all products: {}", e);
        e.to_string()
    })?;

    let result = products.collect::<Result<Vec<_>>>().map_err(|e| {
        println!("Backend error collecting all products: {}", e);
        e.to_string()
    })?;
    
    println!("Backend: Retrieved {} total products", result.len());
    Ok(result)
}

#[tauri::command]
pub fn get_products_by_category(state: tauri::State<DbState>, category_id: Option<i32>) -> Result<Vec<ProductWithCategory>, String> {
    println!("Backend: Getting products for category_id: {:?}", category_id);
    
    // If category_id is None or not provided, return all products
    if category_id.is_none() {
        println!("Backend: No category_id provided, falling back to all products");
        return get_all_products(state);
    }
    
    let category_id = category_id.unwrap();
    let conn = state.pool.get().map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    // Print all products for debugging
    let mut all_stmt = conn.prepare(
        "SELECT id, name, category_id FROM products"
    ).map_err(|e| {
        println!("Backend error preparing get_all_products_debug: {}", e);
        e.to_string()
    })?;

    let all_products = all_stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0).unwrap_or_default(),
            row.get::<_, String>(1).unwrap_or_default(),
            row.get::<_, i32>(2).unwrap_or_default()
        ))
    }).map_err(|e| {
        println!("Backend error querying all products debug: {}", e);
        e.to_string()
    })?;

    println!("All products in database:");
    for product in all_products {
        match product {
            Ok((id, name, cat_id)) => {
                println!("  ID: {}, Name: {}, Category ID: {}", id, name, cat_id);
            }
            Err(e) => println!("  Error reading product: {}", e),
        }
    }
    
    // Print categories from database for debugging
    let mut cat_stmt = conn.prepare(
        "SELECT id, name FROM categories"
    ).map_err(|e| {
        println!("Backend error preparing get_categories_debug: {}", e);
        e.to_string()
    })?;

    let categories = cat_stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0).unwrap_or_default(),
            row.get::<_, String>(1).unwrap_or_default()
        ))
    }).map_err(|e| {
        println!("Backend error querying categories debug: {}", e);
        e.to_string()
    })?;

    println!("All categories in database:");
    for category in categories {
        match category {
            Ok((id, name)) => {
                println!("  Category ID: {}, Name: {}", id, name);
            }
            Err(e) => println!("  Error reading category: {}", e),
        }
    }
    
    // Add an explicit query to check if any products match the category_id
    let mut check_stmt = conn.prepare(
        "SELECT COUNT(*) FROM products WHERE category_id = ?1"
    ).map_err(|e| {
        println!("Backend error preparing check_category_products: {}", e);
        e.to_string()
    })?;
    
    let count: i32 = check_stmt.query_row(params![category_id], |row| row.get(0))
        .map_err(|e| {
            println!("Backend error checking category products: {}", e);
            e.to_string()
        })?;
        
    println!("SQL COUNT query found {} products with category_id = {}", count, category_id);
    
    // Now do the actual filtered query
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, p.description, p.sku, p.category_id, c.name as category_name, 
         p.unit_price, p.price_bought, p.current_stock, p.minimum_stock, p.supplier, p.created_at, p.updated_at
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = ?1
         ORDER BY p.name"
    ).map_err(|e| {
        println!("Backend error preparing get_products_by_category: {}", e);
        e.to_string()
    })?;

    let products = stmt.query_map(params![category_id], |row| {
        Ok(ProductWithCategory {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            sku: row.get(3)?,
            category_id: row.get(4)?,
            category_name: row.get(5)?,
            unit_price: row.get(6)?,
            price_bought: row.get(7)?,
            current_stock: row.get(8)?,
            minimum_stock: row.get(9)?,
            supplier: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    }).map_err(|e| {
        println!("Backend error querying products by category: {}", e);
        e.to_string()
    })?;

    let result = products.collect::<Result<Vec<_>>>().map_err(|e| {
        println!("Backend error collecting products: {}", e);
        e.to_string()
    })?;
    
    println!("Backend: Retrieved {} products for category {}", result.len(), category_id);
    for product in &result {
        println!("  Retrieved: {} (ID: {}, Category ID: {})", product.name, product.id, product.category_id);
    }
    
    Ok(result)
}

#[tauri::command]
pub fn add_product(state: tauri::State<DbState>, product: NewProduct) -> Result<Product, String> {
    println!("Backend: Adding new product: {:?}", product.name);
    
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
    
    // Insert the product
    match tx.execute(
        "INSERT INTO products (name, description, sku, category_id, unit_price, price_bought, current_stock, minimum_stock, supplier, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'), datetime('now'))",
        params![
            product.name,
            product.description,
            product.sku,
            product.category_id,
            product.unit_price,
            product.price_bought,
            product.current_stock,
            product.minimum_stock,
            product.supplier,
        ],
    ) {
        Ok(_) => (),
        Err(e) => {
            let error_msg = format!("Backend error inserting product: {}", e);
            println!("{}", error_msg);
            return Err(error_msg);
        }
    }

    let last_id = tx.last_insert_rowid();
    
    // Create a variable to store the result
    let result: Product;
    
    // Use a block to limit the scope of the statement
    {
        // Retrieve the newly inserted product
        let mut stmt = match tx.prepare(
            "SELECT id, name, description, sku, category_id, unit_price, price_bought, current_stock, minimum_stock, supplier, created_at, updated_at FROM products WHERE id = ?1"
        ) {
            Ok(stmt) => stmt,
            Err(e) => {
                let error_msg = format!("Failed to prepare statement: {}", e);
                println!("Backend error: {}", error_msg);
                return Err(error_msg);
            }
        };

        result = match stmt.query_row(
            params![last_id],
            |row| {
                Ok(Product {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    sku: row.get(3)?,
                    category_id: row.get(4)?,
                    unit_price: row.get(5)?,
                    price_bought: row.get(6)?,
                    current_stock: row.get(7)?,
                    minimum_stock: row.get(8)?,
                    supplier: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            }
        ) {
            Ok(product) => product,
            Err(e) => {
                let error_msg = format!("Failed to query inserted product: {}", e);
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

    println!("Backend: Added product with id: {}", result.id);
    Ok(result)
}

#[tauri::command]
pub fn delete_product(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    println!("Backend: Deleting product with ID: {}", id);
    
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
    
    // Delete the product
    let deleted_count = match tx.execute(
        "DELETE FROM products WHERE id = ?1",
        params![id]
    ) {
        Ok(count) => count,
        Err(e) => {
            let error_msg = format!("Backend error deleting product: {}", e);
            println!("{}", error_msg);
            return Err(error_msg);
        }
    };

    if deleted_count == 0 {
        println!("Backend: No product found with ID: {}", id);
        return Err("Product not found".to_string());
    }
    
    // Commit the transaction
    if let Err(e) = tx.commit() {
        let error_msg = format!("Failed to commit transaction: {}", e);
        println!("Backend error: {}", error_msg);
        return Err(error_msg);
    }

    println!("Backend: Successfully deleted product {}, rows affected: {}", id, deleted_count);
    Ok(())
}

#[tauri::command]
pub fn update_product_stock(state: tauri::State<DbState>, id: i32, new_stock: i32) -> Result<(), String> {
    let conn = state.pool.get().map_err(|e| format!("Failed to get connection from pool: {}", e))?;
    
    conn.execute(
        "UPDATE products SET current_stock = ?1, updated_at = datetime('now') WHERE id = ?2",
        params![new_stock, id]
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_product(state: tauri::State<DbState>, product: UpdateProduct) -> Result<ProductWithCategory, String> {
    println!("Backend: Updating product with ID: {}", product.id);
    
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
    
    // Use the minimum_stock from the update if provided, otherwise calculate it
    let minimum_stock = product.minimum_stock.unwrap_or_else(|| {
        // Set minimum to 20% of current stock or at least 1
        std::cmp::max(1, (product.current_stock as f64 * 0.2) as i32)
    });
    
    // Update the product
    let updated_count = match tx.execute(
        "UPDATE products SET 
            name = ?1, 
            description = ?2, 
            category_id = ?3, 
            unit_price = ?4, 
            price_bought = ?5,
            current_stock = ?6, 
            minimum_stock = ?7, 
            supplier = ?8,
            updated_at = datetime('now')
         WHERE id = ?9",
        params![
            product.name,
            product.description,
            product.category_id,
            product.unit_price,
            product.price_bought,
            product.current_stock,
            minimum_stock,
            product.supplier,
            product.id
        ],
    ) {
        Ok(count) => count,
        Err(e) => {
            let error_msg = format!("Backend error updating product: {}", e);
            println!("{}", error_msg);
            return Err(error_msg);
        }
    };

    if updated_count == 0 {
        println!("Backend: No product found with ID: {}", product.id);
        return Err("Product not found".to_string());
    }
    
    // Retrieve the updated product with category information
    let updated_product = match tx.query_row(
        "SELECT p.id, p.name, p.description, p.sku, p.category_id, c.name, p.unit_price, p.price_bought, 
                p.current_stock, p.minimum_stock, p.supplier, p.created_at, p.updated_at 
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?1",
        params![product.id],
        |row| {
            Ok(ProductWithCategory {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                sku: row.get(3)?,
                category_id: row.get(4)?,
                category_name: row.get(5)?,
                unit_price: row.get(6)?,
                price_bought: row.get(7)?,
                current_stock: row.get(8)?,
                minimum_stock: row.get(9)?,
                supplier: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        }
    ) {
        Ok(product) => product,
        Err(e) => {
            let error_msg = format!("Failed to query updated product: {}", e);
            println!("Backend error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // Commit the transaction
    if let Err(e) = tx.commit() {
        let error_msg = format!("Failed to commit transaction: {}", e);
        println!("Backend error: {}", error_msg);
        return Err(error_msg);
    }

    println!("Backend: Successfully updated product: {}", updated_product.name);
    Ok(updated_product)
}

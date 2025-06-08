use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Order {
    pub id: i32,
    pub order_id: String,
    pub cashier: String,
    pub subtotal: f64,
    pub tax: f64,
    pub total: f64,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderItem {
    pub id: i32,
    pub order_id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub price: f64,
    pub created_at: String,
    // Optional joined fields
    pub product_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderWithItems {
    pub order: Order,
    pub items: Vec<OrderItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewOrder {
    pub order_id: String,
    pub cashier: String,
    pub subtotal: f64,
    pub tax: f64,
    pub total: f64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewOrderItem {
    pub product_id: i32,
    pub quantity: i32,
    pub price: f64,
} 
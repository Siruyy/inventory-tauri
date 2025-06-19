use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub sku: String,
    pub category_id: i32,
    pub unit_price: f64,
    pub price_bought: f64,
    pub current_stock: i32,
    pub minimum_stock: i32,
    pub supplier: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub thumbnailUrl: Option<String>,
    pub barcode: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductWithCategory {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub sku: String,
    pub category_id: i32,
    pub category_name: String,
    pub unit_price: f64,
    pub price_bought: f64,
    pub current_stock: i32,
    pub minimum_stock: i32,
    pub supplier: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub thumbnailUrl: Option<String>,
    pub barcode: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewProduct {
    pub name: String,
    pub description: Option<String>,
    pub sku: String,
    pub category_id: i32,
    pub unit_price: f64,
    pub price_bought: f64,
    pub current_stock: i32,
    pub minimum_stock: i32,
    pub supplier: Option<String>,
    pub thumbnailUrl: Option<String>,
    pub barcode: Option<String>,
}

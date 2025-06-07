#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod db;

use std::sync::Mutex;
use rusqlite::Connection;
use commands::{
    auth::*,
    category::*,
    product::*,
};
use crate::db::DbState;

fn main() {
    let db_path = "inventory.db";
    let conn = Connection::open(db_path).expect("Failed to open database");

    tauri::Builder::default()
        .manage(DbState {
            connection: Mutex::new(conn),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            register,
            verify_auth,
            get_all_categories,
            add_category,
            delete_category,
            get_all_products,
            get_products_by_category,
            add_product,
            delete_product,
            update_product_stock,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
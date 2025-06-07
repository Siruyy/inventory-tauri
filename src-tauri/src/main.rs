// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod db;

use db::{establish_connection_pool, run_migrations};

fn main() {
    let pool = establish_connection_pool();
    run_migrations(&pool);

    tauri::Builder::default()
        .manage(pool)
        .invoke_handler(tauri::generate_handler![
            commands::login,
            commands::register,
            commands::verify_auth,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
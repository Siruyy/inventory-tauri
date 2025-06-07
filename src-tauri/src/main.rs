#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod commands;
mod db;

use db::{establish_connection_pool, run_migrations};
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        // Register all the necessary plugins
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_path::init())
        .plugin(tauri_plugin_shell::init())
        
        .setup(|app| {
            // This setup for the database path is from the previous step and is correct.
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");
            
            let db_path = app_data_dir.join("db.sqlite");

            let pool = establish_connection_pool(&db_path);

            run_migrations(&pool);

            app.manage(pool);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::login,
            commands::register,
            commands::verify_auth,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
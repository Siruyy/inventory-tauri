use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use std::fs;
use std::path::PathBuf;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<SqliteConnection>>;

pub fn establish_connection_pool(db_path: &PathBuf) -> DbPool {
    // Create the parent directory if it doesn't exist to prevent errors
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent).expect("Failed to create database directory");
    }

    let manager = ConnectionManager::<SqliteConnection>::new(db_path.to_string_lossy());
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create database connection pool")
}

pub fn run_migrations(pool: &DbPool) {
    use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

    const MIGRATIONS: EmbeddedMigrations = embed_migrations!("src/db/migration");

    let mut conn = pool.get().expect("Failed to get database connection");
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Failed to run database migrations");
}
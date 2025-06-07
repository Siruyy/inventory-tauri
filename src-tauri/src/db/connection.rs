use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use std::path::Path;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<SqliteConnection>>;

const DATABASE_URL: &str = "db.sqlite";

pub fn establish_connection_pool() -> DbPool {
    let database_url = Path::new(DATABASE_URL)
        .canonicalize()
        .unwrap_or_else(|_| Path::new(DATABASE_URL).to_path_buf())
        .to_string_lossy()
        .to_string();

    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
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

use std::sync::Mutex;
use rusqlite::Connection;

pub struct DbState {
    pub connection: Mutex<Connection>,
} 
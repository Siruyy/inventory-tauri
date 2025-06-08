use bcrypt::{hash, verify, DEFAULT_COST};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::db::schema::users;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("Database error: {0}")]
    DatabaseError(String),
    #[error("Authentication error: {0}")]
    AuthError(String),
    #[error("Password hashing error: {0}")]
    HashError(String),
}

#[derive(Queryable, Selectable, Identifiable, Debug, Serialize)]
#[diesel(table_name = users)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub full_name: String,
    pub role: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub full_name: String,
    pub role: String,
}

#[derive(Deserialize)]
pub struct LoginCredentials {
    pub username: String,
    pub password: String,
} 
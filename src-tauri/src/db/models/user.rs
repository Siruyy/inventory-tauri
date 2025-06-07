use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::db::schema::users;
use crate::db::DbPool;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] diesel::result::Error),
    #[error("Authentication error: {0}")]
    AuthError(String),
    #[error("Password hashing error: {0}")]
    HashError(#[from] bcrypt::BcryptError),
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
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
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

impl User {
    pub fn create(pool: &DbPool, new_user: NewUser) -> Result<User, UserError> {
        let mut conn = pool.get().unwrap();
        diesel::insert_into(users::table)
            .values(&new_user)
            .get_result(&mut conn)
            .map_err(UserError::DatabaseError)
    }

    pub fn find_by_id(pool: &DbPool, user_id: i32) -> Result<User, UserError> {
        let mut conn = pool.get().unwrap();
        users::table
            .find(user_id)
            .first(&mut conn)
            .map_err(UserError::DatabaseError)
    }

    pub fn find_by_username(pool: &DbPool, username: &str) -> Result<User, UserError> {
        let mut conn = pool.get().unwrap();
        users::table
            .filter(users::username.eq(username))
            .first(&mut conn)
            .map_err(UserError::DatabaseError)
    }

    pub fn authenticate(pool: &DbPool, creds: LoginCredentials) -> Result<User, UserError> {
        let user = Self::find_by_username(pool, &creds.username)?;
        
        if !verify(creds.password, &user.password_hash)? {
            return Err(UserError::AuthError("Invalid password".to_string()));
        }

        Ok(user)
    }
}

impl NewUser {
    pub fn new(
        username: String,
        email: String,
        password: String,
        full_name: String,
        role: String,
    ) -> Result<Self, UserError> {
        let password_hash = hash(password.as_bytes(), DEFAULT_COST)?;
        
        Ok(Self {
            username,
            email,
            password_hash,
            full_name,
            role,
        })
    }
} 
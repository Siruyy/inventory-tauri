use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::db::models::User;

const JWT_SECRET: &[u8] = b"your-secret-key"; // In production, use an environment variable
const TOKEN_DURATION_HOURS: i64 = 24;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32, // user id
    pub username: String,
    pub role: String,
    pub exp: i64,
}

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("JWT token error: {0}")]
    JWTError(#[from] jsonwebtoken::errors::Error),
    #[error("Token expired")]
    TokenExpired,
    #[error("Invalid token")]
    InvalidToken,
}

pub fn create_token(user: &User) -> Result<String, AuthError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(TOKEN_DURATION_HOURS))
        .expect("Invalid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user.id,
        username: user.username.clone(),
        role: user.role.clone(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET),
    )
    .map_err(AuthError::JWTError)
}

pub fn verify_token(token: &str) -> Result<Claims, AuthError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET),
        &Validation::default(),
    )
    .map_err(|e| match e.kind() {
        jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::TokenExpired,
        _ => AuthError::JWTError(e),
    })?;

    Ok(token_data.claims)
} 
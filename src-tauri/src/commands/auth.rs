use serde::{Deserialize, Serialize};
use tauri::State;

use crate::auth::{create_token, verify_token};
use crate::db::{DbPool, models::{LoginCredentials, NewUser, User}};
use crate::db::establish_connection;
use bcrypt::{hash, verify, DEFAULT_COST};
use diesel::prelude::*;
use jsonwebtoken::{encode, EncodingKey, Header};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    role: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    user: User,
    token: String,
}

#[derive(Deserialize)]
pub struct RegisterRequest {
    username: String,
    email: String,
    password: String,
    full_name: String,
}

#[tauri::command]
pub async fn login(credentials: LoginCredentials) -> Result<String, String> {
    let conn = &mut establish_connection();
    let user = users::table
        .filter(users::username.eq(&credentials.username))
        .first::<User>(conn)
        .map_err(|_| "User not found")?;

    if !verify(&credentials.password, &user.password_hash).map_err(|_| "Invalid password")? {
        return Err("Invalid password".to_string());
    }

    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize + 24 * 3600; // 24 hours from now

    let claims = Claims {
        sub: user.username,
        exp: expiration,
        role: user.role,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("your-secret-key".as_ref()),
    )
    .map_err(|_| "Could not create token")?;

    Ok(token)
}

#[tauri::command]
pub async fn register(new_user: NewUser) -> Result<User, String> {
    let conn = &mut establish_connection();
    
    // Check if username already exists
    if users::table
        .filter(users::username.eq(&new_user.username))
        .first::<User>(conn)
        .is_ok()
    {
        return Err("Username already exists".to_string());
    }

    let password_hash = hash(new_user.password.as_bytes(), DEFAULT_COST)
        .map_err(|_| "Could not hash password")?;

    let user = diesel::insert_into(users::table)
        .values((
            users::username.eq(new_user.username),
            users::email.eq(new_user.email),
            users::password_hash.eq(password_hash),
            users::full_name.eq(new_user.full_name),
            users::role.eq(new_user.role),
        ))
        .get_result::<User>(conn)
        .map_err(|_| "Could not create user")?;

    Ok(user)
}

#[tauri::command]
pub async fn verify_auth(token: String) -> Result<bool, String> {
    verify_token(&token)
        .map(|_| true)
        .map_err(|e| e.to_string())
} 
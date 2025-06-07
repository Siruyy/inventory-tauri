use serde::{Deserialize, Serialize};
use tauri::State;

use crate::auth::{create_token, verify_token, AuthError};
use crate::db::{DbPool, models::{LoginCredentials, NewUser, User, UserError}};

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
pub async fn login(
    pool: State<'_, DbPool>,
    credentials: LoginCredentials,
) -> Result<AuthResponse, String> {
    let user = User::authenticate(&pool, credentials)
        .map_err(|e| e.to_string())?;
    
    let token = create_token(&user)
        .map_err(|e| e.to_string())?;

    Ok(AuthResponse { user, token })
}

#[tauri::command]
pub async fn register(
    pool: State<'_, DbPool>,
    request: RegisterRequest,
) -> Result<AuthResponse, String> {
    let new_user = NewUser::new(
        request.username,
        request.email,
        request.password,
        request.full_name,
        "user".to_string(), // Default role for new registrations
    )
    .map_err(|e| e.to_string())?;

    let user = User::create(&pool, new_user)
        .map_err(|e| e.to_string())?;
    
    let token = create_token(&user)
        .map_err(|e| e.to_string())?;

    Ok(AuthResponse { user, token })
}

#[tauri::command]
pub async fn verify_auth(token: String) -> Result<bool, String> {
    verify_token(&token)
        .map(|_| true)
        .map_err(|e| e.to_string())
} 
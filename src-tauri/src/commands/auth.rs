use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::models::{User, NewUser, LoginCredentials};
use crate::db::DbState;

use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, EncodingKey, Header, decode, DecodingKey, Validation};
use rusqlite::params;

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

// Function to create a JWT token
fn create_token(user: &User) -> Result<String, String> {
    let expiration = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize + 24 * 3600; // 24 hours from now

    let claims = Claims {
        sub: user.username.clone(),
        exp: expiration,
        role: user.role.clone(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("your-secret-key".as_ref()),
    )
    .map_err(|e| e.to_string())
}

// Function to verify a JWT token
fn verify_token(token: &str) -> Result<Claims, String> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret("your-secret-key".as_ref()),
        &Validation::default(),
    )
    .map_err(|e| e.to_string())?;

    Ok(token_data.claims)
}

#[tauri::command]
pub fn login(credentials: LoginCredentials, db_state: State<DbState>) -> Result<AuthResponse, String> {
    let conn = db_state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    let mut stmt = conn.prepare("SELECT * FROM users WHERE username = ?")
        .map_err(|_| "Failed to prepare statement")?;
        
    let user = stmt.query_row(params![credentials.username], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password_hash: row.get(3)?,
            full_name: row.get(4)?,
            role: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    }).map_err(|_| "User not found")?;

    if !verify(&credentials.password, &user.password_hash).map_err(|_| "Invalid password")? {
        return Err("Invalid password".to_string());
    }

    // Create token
    let token = create_token(&user)?;
    
    // Return user and token
    Ok(AuthResponse {
        user,
        token,
    })
}

#[tauri::command]
pub fn register(register_request: RegisterRequest, db_state: State<DbState>) -> Result<AuthResponse, String> {
    let conn = db_state.connection.lock().map_err(|_| "Failed to lock database")?;
    
    // Check if username already exists
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM users WHERE username = ?")
        .map_err(|_| "Failed to prepare statement")?;
        
    let count: i64 = stmt.query_row(params![&register_request.username], |row| row.get(0))
        .map_err(|_| "Failed to check username")?;
        
    if count > 0 {
        return Err("Username already exists".to_string());
    }

    let password_hash = hash(register_request.password.as_bytes(), DEFAULT_COST)
        .map_err(|_| "Could not hash password")?;

    // Create the NewUser with the hashed password
    let new_user = NewUser {
        username: register_request.username,
        email: register_request.email,
        password_hash,
        full_name: register_request.full_name,
        role: "user".to_string(), // Default role
    };

    // Insert the new user
    conn.execute(
        "INSERT INTO users (username, email, password_hash, full_name, role, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
        params![
            &new_user.username,
            &new_user.email,
            &new_user.password_hash,
            &new_user.full_name,
            &new_user.role,
        ],
    ).map_err(|_| "Could not create user")?;
    
    // Get the created user
    let mut stmt = conn.prepare("SELECT * FROM users WHERE username = ?")
        .map_err(|_| "Failed to prepare statement")?;
        
    let user = stmt.query_row(params![&new_user.username], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            email: row.get(2)?,
            password_hash: row.get(3)?,
            full_name: row.get(4)?,
            role: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    }).map_err(|_| "Could not retrieve created user")?;

    // Create token
    let token = create_token(&user)?;
    
    // Return user and token
    Ok(AuthResponse {
        user,
        token,
    })
}

#[tauri::command]
pub fn verify_auth(token: String) -> Result<bool, String> {
    verify_token(&token)
        .map(|_| true)
        .map_err(|e| e.to_string())
} 
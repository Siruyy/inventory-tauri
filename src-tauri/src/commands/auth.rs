use serde::{Deserialize, Serialize};

use crate::db::models::user::{LoginCredentials, NewUser, User};
use crate::db::DbState;

use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, EncodingKey, Header, decode, DecodingKey, Validation};
use rusqlite::params;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub user: User,
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
        user: user.clone(),
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
pub fn login(state: tauri::State<DbState>, creds: LoginCredentials) -> Result<AuthResponse, String> {
    let conn = state.pool.get().map_err(|e| format!("Failed to get connection from pool: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, username, email, password_hash, full_name, role, created_at, updated_at FROM users WHERE username = ?1")
        .map_err(|e| format!("Database error: {}", e))?;
        
    let user = stmt.query_row(params![creds.username], |row| {
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

    // Verify that the provided plaintext password matches the stored hash
    if !verify(&creds.password, &user.password_hash).map_err(|_| "Password verification error")? {
        return Err("Invalid password".to_string());
    }

    // Create a token for the user
    let token = create_token(&user)?;
    
    // Return the AuthResponse with user and token
    Ok(AuthResponse {
        user,
        token,
    })
}

#[tauri::command]
pub fn register(state: tauri::State<DbState>, new_user: NewUser) -> Result<User, String> {
    if new_user.username.is_empty()
        || new_user.email.is_empty()
        || new_user.password.is_empty()
    {
        return Err("All fields must be filled.".to_string());
    }

    let conn = state.pool.get().map_err(|e| format!("Failed to get connection from pool: {}", e))?;

    let password_hash = hash(&new_user.password, DEFAULT_COST)
        .map_err(|e| format!("Failed to hash password: {}", e))?;

    // Create the NewUser with the hashed password
    let user_to_insert = NewUser {
        username: new_user.username,
        email: new_user.email,
        password: password_hash,
        full_name: new_user.full_name,
        role: "user".to_string(), // Default role
    };

    conn.execute(
        "INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            user_to_insert.username,
            user_to_insert.email,
            user_to_insert.password,
            user_to_insert.full_name,
            user_to_insert.role
        ],
    )
    .map_err(|e| format!("Failed to register user: {}", e))?;

    let last_id = conn.last_insert_rowid();

    let mut stmt = conn
        .prepare("SELECT id, username, email, password_hash, full_name, role, created_at, updated_at FROM users WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let user = stmt
        .query_row(params![last_id], |row| {
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
        })
        .map_err(|_| "Could not retrieve created user")?;

    Ok(user)
}

#[tauri::command]
pub fn verify_auth(token: &str) -> Result<bool, String> {
    // Verify the token and return true if valid, false otherwise
    match verify_token(token) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
} 
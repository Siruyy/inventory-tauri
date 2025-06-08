pub mod user;
pub use user::*;

// Re-export the key user types
pub use user::{User, NewUser, LoginCredentials}; 
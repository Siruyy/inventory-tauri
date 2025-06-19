use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewCategory {
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
} 

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCategory {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
} 
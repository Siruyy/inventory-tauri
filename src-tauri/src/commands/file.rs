use std::fs::File;
use std::io::Read;
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
pub fn read_image_to_base64(path: &str) -> Result<String, String> {
    println!("Reading image file: {}", path);
    
    // Attempt to open the file
    let mut file = match File::open(path) {
        Ok(f) => f,
        Err(e) => {
            let error_msg = format!("Failed to open file: {}", e);
            println!("Error: {}", error_msg);
            return Err(error_msg);
        }
    };
    
    // Read the file content
    let mut buffer = Vec::new();
    if let Err(e) = file.read_to_end(&mut buffer) {
        let error_msg = format!("Failed to read file: {}", e);
        println!("Error: {}", error_msg);
        return Err(error_msg);
    }
    
    // Determine MIME type based on file extension
    let mime_type = match path.rsplit('.').next().map(|ext| ext.to_lowercase()) {
        Some(ext) if ext == "png" => "image/png",
        Some(ext) if ext == "jpg" || ext == "jpeg" => "image/jpeg",
        Some(ext) if ext == "gif" => "image/gif",
        Some(ext) if ext == "webp" => "image/webp",
        Some(ext) if ext == "svg" => "image/svg+xml",
        _ => "application/octet-stream",
    };
    
    // Encode to base64
    let base64_data = general_purpose::STANDARD.encode(&buffer);
    let data_url = format!("data:{};base64,{}", mime_type, base64_data);
    
    println!("Successfully encoded image to base64 (length: {})", data_url.len());
    Ok(data_url)
} 
use std::fs;

/// Read a file from the filesystem
#[tauri::command]
async fn read_file(file_path: String, _encoding: Option<String>) -> Result<Vec<u8>, String> {
    log::info!("Reading file: {}", file_path);

    // Handle file:// URLs by converting them to paths
    let path = if file_path.starts_with("file:///") {
        file_path.replace("file:///", "/")
    } else {
        file_path
    };

    // Decode URL encoding
    let decoded_path = urlencoding::decode(&path).map_err(|e| e.to_string())?;

    log::info!("Resolved file path: {}", decoded_path);

    // Read the file
    match fs::read(decoded_path.as_ref()) {
        Ok(data) => Ok(data),
        Err(e) => {
            log::error!("Error reading file: {}", e);
            Err(format!("Failed to read file: {}", e))
        }
    }
}

/// Parse a bplist (binary property list) buffer
#[tauri::command]
async fn parse_bplist(buffer: Vec<u8>) -> Result<serde_json::Value, String> {
    log::info!("Parsing bplist buffer, size: {}", buffer.len());

    // Check if the buffer contains a binary plist
    if buffer.len() >= 8 {
        let signature = String::from_utf8_lossy(&buffer[0..8]);
        log::info!("File signature: {}", signature);

        if signature.starts_with("bplist") {
            // Parse the binary plist
            match plist::from_bytes::<serde_json::Value>(&buffer) {
                Ok(data) => {
                    log::info!("Plist parsing successful");
                    Ok(data)
                }
                Err(e) => {
                    log::error!("Error parsing bplist: {}", e);
                    // Return empty object instead of error
                    Ok(serde_json::json!({}))
                }
            }
        } else {
            log::info!("Not a binary plist, returning empty data");
            Ok(serde_json::json!({}))
        }
    } else {
        log::info!("Buffer too small to be a valid plist");
        Ok(serde_json::json!({}))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![read_file, parse_bplist])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

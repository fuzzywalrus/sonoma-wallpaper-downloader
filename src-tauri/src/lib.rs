use std::fs;
use std::path::Path;

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

#[derive(serde::Serialize)]
struct ScreensaverFile {
    path: String,
    name: String,
    folder: String,
    size_bytes: u64,
    mtime_ms: i64,
}

const CUSTOMER_DIR: &str = "/Library/Application Support/com.apple.idleassetsd/Customer";

fn is_video_file(path: &Path) -> bool {
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        matches!(
            ext.to_lowercase().as_str(),
            "mov" | "mp4" | "m4v" | "hevc"
        )
    } else {
        false
    }
}

#[tauri::command]
async fn list_screensavers() -> Result<Vec<ScreensaverFile>, String> {
    let mut results = Vec::new();
    let base = Path::new(CUSTOMER_DIR);

    let entries = fs::read_dir(base).map_err(|e| format!("Failed to read Customer dir: {e}"))?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let file_type = entry.file_type().map_err(|e| e.to_string())?;
        if !file_type.is_dir() {
            continue;
        }
        let folder_name = entry.file_name().to_string_lossy().to_string();
        let subdir = entry.path();
        let files = match fs::read_dir(&subdir) {
            Ok(f) => f,
            Err(_) => continue,
        };
        for file_entry in files {
            let file_entry = match file_entry {
                Ok(f) => f,
                Err(_) => continue,
            };
            let path = file_entry.path();
            let ty = match file_entry.file_type() {
                Ok(t) => t,
                Err(_) => continue,
            };
            if !ty.is_file() {
                continue;
            }
            if !is_video_file(&path) {
                continue;
            }
            let meta = match fs::metadata(&path) {
                Ok(m) => m,
                Err(_) => continue,
            };
            let mtime = meta
                .modified()
                .ok()
                .and_then(|t| t.elapsed().ok())
                .map(|d| {
                    let ms = d.as_millis() as i64;
                    // approximate to negative offset from now; keep simple
                    -ms
                })
                .unwrap_or(0);
            let name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or_default()
                .to_string();

            results.push(ScreensaverFile {
                path: path.to_string_lossy().to_string(),
                name,
                folder: folder_name.clone(),
                size_bytes: meta.len(),
                mtime_ms: mtime,
            });
        }
    }

    Ok(results)
}

#[tauri::command]
async fn delete_screensaver(target_path: String) -> Result<bool, String> {
    let base = Path::new(CUSTOMER_DIR);
    let target = Path::new(&target_path);

    // Ensure target is inside CUSTOMER_DIR
    if !target.starts_with(base) {
        return Err("Refusing to delete outside Customer directory".into());
    }
    if !is_video_file(target) {
        return Err("Refusing to delete non-video file".into());
    }

    fs::remove_file(target).map_err(|e| format!("Failed to delete file: {e}"))?;
    Ok(true)
}

#[tauri::command]
async fn open_full_disk_access_settings() -> Result<bool, String> {
    // Open System Settings at Privacy & Security → Full Disk Access
    // Uses the same URL scheme Apple documents for deep linking into preferences
    let status = std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles")
        .status()
        .map_err(|e| format!("Failed to launch System Settings: {e}"))?;

    if status.success() {
        Ok(true)
    } else {
        Err(format!("System Settings exited with status: {status}"))
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
    .invoke_handler(tauri::generate_handler![
      read_file,
      parse_bplist,
      list_screensavers,
      delete_screensaver,
      open_full_disk_access_settings
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

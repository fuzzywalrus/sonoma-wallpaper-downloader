use std::fs;
use std::path::Path;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Emitter;

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
#[serde(rename_all = "camelCase")]
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

    // Try a direct delete first (works if the app already has write permission).
    if fs::remove_file(target).is_ok() {
        return Ok(true);
    }

    // Files in the Customer directory are owned by the _assetsd system user.
    // A normal user-space process cannot unlink them even with Full Disk Access
    // granted in TCC, because FDA bypasses TCC restrictions but not POSIX
    // ownership. Fall back to osascript with administrator privileges, which
    // presents the native macOS password prompt.
    let escaped = target_path.replace('\'', "'\\''"); // single-quote escape for shell
    let script = format!("do shell script \"rm -f '{escaped}'\" with administrator privileges");
    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| format!("osascript failed: {e}"))?;

    Ok(output.status.success())
}

#[tauri::command]
async fn open_full_disk_access_settings() -> Result<bool, String> {
    // Try multiple deep links since Apple has changed URL tokens between releases.
    let targets = [
        "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles",
        "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_AllFiles",
        "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension",
        "x-apple.systempreferences:com.apple.preference.security",
    ];

    let mut errors: Vec<String> = Vec::new();

    for target in targets {
        match std::process::Command::new("open").arg(target).status() {
            Ok(status) if status.success() => return Ok(true),
            Ok(status) => errors.push(format!("{target} -> exit status {status}")),
            Err(e) => errors.push(format!("{target} -> {e}")),
        }
    }

    Err(format!(
        "Failed to open System Settings Full Disk Access panel. Attempts: {}",
        errors.join(" | ")
    ))
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

      // Build a custom app menu so the name reads "Mac Video Wallpaper Manager"
      // instead of the Cargo binary name "macos-video-downloader".
      let about_item = MenuItem::with_id(app, "show_about", "About Mac Video Wallpaper Manager", true, None::<&str>)?;
      let app_submenu = Submenu::with_items(
        app,
        "Mac Video Wallpaper Manager",
        true,
        &[
          &about_item,
          &PredefinedMenuItem::separator(app)?,
          &PredefinedMenuItem::services(app, None)?,
          &PredefinedMenuItem::separator(app)?,
          &PredefinedMenuItem::hide(app, None)?,
          &PredefinedMenuItem::hide_others(app, None)?,
          &PredefinedMenuItem::show_all(app, None)?,
          &PredefinedMenuItem::separator(app)?,
          &PredefinedMenuItem::quit(app, None)?,
        ],
      )?;
      let menu = Menu::with_items(app, &[&app_submenu])?;
      app.set_menu(menu)?;

      // Emit a frontend event when the About menu item is clicked.
      app.on_menu_event(|app, event| {
        if event.id() == "show_about" {
          app.emit("show-about", ()).unwrap();
        }
      });

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

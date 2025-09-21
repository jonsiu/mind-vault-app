// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_app_data_dir() -> Result<String, String> {
    match tauri::api::path::app_data_dir(&tauri::Config::default()) {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Could not get app data directory".to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_app_data_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

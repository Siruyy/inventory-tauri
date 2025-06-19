/**
 * Utility functions for handling file paths in Tauri
 */
import { invoke } from '@tauri-apps/api/core';

// Keep track of image cache to avoid repeated loading
const imageCache: Record<string, string> = {};

/**
 * Formats a file path for display in the UI
 * @param filePath The local file path
 * @returns The formatted path
 */
export async function formatFilePath(filePath: string): Promise<string> {
  if (!filePath) {
    return "https://via.placeholder.com/240x216";
  }

  // If it's already a URL or a placeholder, return it as is
  if (
    filePath.startsWith("http") ||
    filePath.startsWith("data:") ||
    filePath.includes("placeholder.com")
  ) {
    return filePath;
  }

  // Check if we have this image in cache
  if (imageCache[filePath]) {
    console.log("Using cached image for:", filePath);
    return imageCache[filePath];
  }

  // For local file paths, use our Rust command to load the image as base64
  console.log("Loading image from path:", filePath);
  
  try {
    const base64Data = await invoke<string>('read_image_to_base64', { path: filePath });
    console.log("Successfully loaded image, data length:", base64Data.length);
    
    // Cache the result
    imageCache[filePath] = base64Data;
    
    return base64Data;
  } catch (error) {
    console.error("Error loading image:", error);
    return "https://via.placeholder.com/240x216?text=Error";
  }
}

/**
 * Checks if a path is a valid file path
 * @param path The path to check
 * @returns True if the path is a valid file path
 */
export function isValidFilePath(path: string): boolean {
  return (
    !!path &&
    !path.startsWith("http") &&
    !path.startsWith("data:") &&
    !path.includes("placeholder.com")
  );
}

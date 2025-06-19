/**
 * Utility functions for handling file paths in Tauri
 */
import { convertFileSrc } from '@tauri-apps/api/core';

/**
 * Formats a file path for display in the UI
 * @param filePath The local file path
 * @returns The formatted path
 */
export function formatFilePath(filePath: string): string {
  console.log("formatFilePath input:", filePath);
  
  if (!filePath) {
    console.log("Empty file path, returning placeholder");
    // Use data URL instead of external placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='216' viewBox='0 0 240 216'%3E%3Crect width='240' height='216' fill='%23383C3D'/%3E%3C/svg%3E";
  }

  // If it's already a URL or a data URL, return it as is
  if (
    filePath.startsWith("http") ||
    filePath.startsWith("data:")
  ) {
    console.log("Path is already a URL, returning as-is");
    return filePath;
  }

  // For local file paths, use the Tauri asset protocol
  // Convert Windows backslashes to forward slashes if needed
  const normalizedPath = filePath.replace(/\\/g, '/');
  console.log("Normalized path:", normalizedPath);
  
  try {
    // Try using Tauri's convertFileSrc function
    const convertedPath = convertFileSrc(normalizedPath);
    console.log("Converted path:", convertedPath);
    return convertedPath;
  } catch (error) {
    console.error("Error converting file path:", error);
    
    // Fallback to file:// protocol
    console.log("Using file:// protocol as fallback");
    return `file://${normalizedPath}`;
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
    !path.startsWith("data:")
  );
}

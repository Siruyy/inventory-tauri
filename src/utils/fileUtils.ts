/**
 * Utility functions for handling file paths in Tauri
 */

/**
 * Formats a file path for display in the UI
 * @param filePath The local file path
 * @returns The formatted path
 */
export function formatFilePath(filePath: string): string {
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

  // For local file paths, use a placeholder for now
  // Local file access is restricted in the browser for security reasons
  console.log("Using placeholder for local file:", filePath);
  return "https://via.placeholder.com/240x216";
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

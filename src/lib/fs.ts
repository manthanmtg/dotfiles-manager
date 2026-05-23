import fs from "fs";

/**
 * Safely writes content to a file using an atomic-like approach.
 * This prevents file corruption if the process crashes during writing.
 * It writes to a temporary file first and then renames it to the target.
 */
export function atomicWriteFile(
  filePath: string,
  content: string,
  options: { mode?: number } = {}
): void {
  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  
  try {
    fs.writeFileSync(tempPath, content, { 
      encoding: "utf-8", 
      mode: options.mode 
    });
    
    // Atomic rename on most Unix-like systems
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    // Cleanup temp file if rename failed
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }
    throw new Error(
      `Failed to safely write to ${filePath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Counts the number of newline characters in a string without splitting it.
 * Significantly faster and more memory-efficient than str.split('\n').length.
 */
export function countNewlines(str: string): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\n") count++;
  }
  return count;
}

/**
 * Optimized line counter that uses a regex to count lines with content.
 * Using content.match() with a global flag is significantly faster in V8 
 * than character-by-character iteration or manual loops.
 * It counts lines that have at least one non-whitespace character.
 */
export function countContentLines(content: string): number {
  return (content.match(/^\s*\S/gm) || []).length;
}

/**
 * Escapes special characters in a string for use in a regular expression.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

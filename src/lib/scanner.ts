import fs from "fs";
import path from "path";
import { parseDotfileSource } from "./parser";
import { type DotfileMetadata, DotfileFilename } from "./schemas";

const DOTFILES_SOURCE_DIR = path.join(process.cwd(), "dotfiles");

interface ScannedDotfile {
  filename: string;
  metadata: DotfileMetadata;
  content: string;
}

export function scanDotfiles(): ScannedDotfile[] {
  const results: ScannedDotfile[] = [];
  walk(DOTFILES_SOURCE_DIR, results);
  return results;
}

function walk(dir: string, results: ScannedDotfile[]) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue; // Hardening: Ignore symlinks in source directory

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (entry.name.endsWith(".sh")) {
      const rel = path.relative(DOTFILES_SOURCE_DIR, full);
      const raw = fs.readFileSync(full, "utf-8");
      const { metadata, content } = parseDotfileSource(raw, rel);
      const filename = path.basename(entry.name, ".sh");

      // Ensure filename matches allowed pattern
      try {
        DotfileFilename.parse(filename);
      } catch {
        throw new Error(`Invalid dotfile filename "${filename}" in ${rel}. Must contain only alphanumeric characters, dots, hyphens, or underscores.`);
      }

      results.push({ filename, metadata, content });
    }
  }
}

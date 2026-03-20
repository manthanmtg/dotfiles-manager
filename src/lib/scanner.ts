import fs from "fs";
import path from "path";
import { parseDotfileSource } from "./parser";
import type { DotfileMetadata } from "./schemas";

const DOTFILES_SOURCE_DIR = path.join(process.cwd(), "dotfiles");

export interface ScannedDotfile {
  filename: string;
  relativePath: string;
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
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (entry.name.endsWith(".sh")) {
      const rel = path.relative(DOTFILES_SOURCE_DIR, full);
      const raw = fs.readFileSync(full, "utf-8");
      const { metadata, content } = parseDotfileSource(raw, rel);
      const filename = path.basename(entry.name, ".sh");

      results.push({ filename, relativePath: rel, metadata, content });
    }
  }
}

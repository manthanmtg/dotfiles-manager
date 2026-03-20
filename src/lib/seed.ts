import fs from "fs";
import path from "path";
import { createDotfile, getDotfilesDir } from "./dotfiles";
import { scanDotfiles } from "./scanner";

export function seedDotfiles(): { seeded: number; skipped: number } {
  const dir = getDotfilesDir();
  let seeded = 0;
  let skipped = 0;

  for (const entry of scanDotfiles()) {
    const filePath = path.join(dir, entry.filename);
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    createDotfile(entry.filename, entry.content, entry.metadata);
    seeded++;
  }

  return { seeded, skipped };
}

import fs from "fs";
import path from "path";
import { createDotfile, getDotfilesDir } from "./dotfiles";
import { scanDotfiles } from "./scanner";

export function seedDotfiles(): {
  seeded: number;
  updated: number;
  skipped: number;
} {
  const dir = getDotfilesDir();
  let seeded = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of scanDotfiles()) {
    const filePath = path.join(dir, entry.filename);

    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, "utf-8");
      if (existing === entry.content) {
        skipped++;
        continue;
      }
      updated++;
    } else {
      seeded++;
    }

    createDotfile(entry.filename, entry.content, entry.metadata);
  }

  return { seeded, updated, skipped };
}

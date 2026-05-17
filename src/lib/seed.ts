import fs from "fs";
import path from "path";
import { createDotfile, getDotfilesDir } from "./dotfiles";
import { scanDotfiles } from "./scanner";
import type { SeedResult } from "./schemas";

export function seedDotfiles(): SeedResult {
  const dir = getDotfilesDir();
  let seeded = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of scanDotfiles()) {
    const filePath = path.join(dir, entry.filename);
    const metaPath = path.join(dir, `${entry.filename}.meta.json`);
    
    let needsUpdate = false;

    if (fs.existsSync(filePath)) {
      const existingContent = fs.readFileSync(filePath, "utf-8");
      
      let existingMeta = "";
      try {
        existingMeta = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, "utf-8") : "";
      } catch {
        existingMeta = "";
      }

      const newMeta = JSON.stringify(entry.metadata, null, 2);
      
      if (existingContent === entry.content && existingMeta === newMeta) {
        skipped++;
        continue;
      }
      updated++;
      needsUpdate = true;
    } else {
      seeded++;
      needsUpdate = true;
    }

    if (needsUpdate) {
      createDotfile(entry.filename, entry.content, entry.metadata);
    }
  }

  return { seeded, updated, skipped };
}

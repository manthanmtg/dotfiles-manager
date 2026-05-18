import fs from "node:fs";
import path from "node:path";
import { parseDotfileSource, MetaParseError } from "./parser";
import { DotfileFilename, DotfileCategory } from "./schemas";
import { ZodError } from "zod/v4";

export interface ParseError {
  file: string;
  errors: string[];
}

/**
 * Validates all .sh files in the given directory recursively.
 * Checks for valid meta blocks and proper directory alignment.
 */
export function validateAllDotfiles(
  dotfilesDir: string
): { valid: string[]; errors: ParseError[] } {
  const valid: string[] = [];
  const errs: ParseError[] = [];
  const seenFilenames = new Map<string, string>();
  const seenHumanNames = new Map<string, string>();

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".sh")) {
        const rel = path.relative(dotfilesDir, full);
        const filename = path.basename(entry.name, ".sh");
        
        if (seenFilenames.has(filename)) {
          errs.push({
            file: rel,
            errors: [
              `Duplicate filename "${filename}" — already exists at "${seenFilenames.get(
                filename
              )}"`,
            ],
          });
          continue;
        }
        seenFilenames.set(filename, rel);
        
        try {
          DotfileFilename.parse(filename);
          const raw = fs.readFileSync(full, "utf-8");
          const { metadata } = parseDotfileSource(raw, rel);

          if (seenHumanNames.has(metadata.name)) {
            errs.push({
              file: rel,
              errors: [
                `Duplicate human-readable name "${metadata.name}" — already exists in "${seenHumanNames.get(
                  metadata.name
                )}"`,
              ],
            });
            continue;
          }
          seenHumanNames.set(metadata.name, rel);

          const pathParts = rel.split(path.sep);
          const categoryDir = pathParts[0];
          const isSupportedCategory = (DotfileCategory.options as readonly string[]).includes(categoryDir);

          if (pathParts.length < 2) {
            errs.push({
              file: rel,
              errors: [
                `Dotfile must be inside a category directory (supported: ${DotfileCategory.options.join(
                  ", "
                )})`,
              ],
            });
          } else if (!isSupportedCategory) {
            errs.push({
              file: rel,
              errors: [
                `Invalid category directory "${categoryDir}" — must be one of: ${DotfileCategory.options.join(
                  ", "
                )}`,
              ],
            });
          } else if (metadata.category !== categoryDir) {
            errs.push({
              file: rel,
              errors: [
                `Category "${metadata.category}" in meta block does not match parent directory "${categoryDir}"`,
              ],
            });
          } else {
            valid.push(rel);
          }
        } catch (e) {
          if (e instanceof MetaParseError) {
            errs.push({ file: rel, errors: e.errors });
          } else if (e instanceof ZodError && e.issues[0]?.path[0] === undefined) {
             // This is likely from DotfileFilename.parse
             errs.push({ file: rel, errors: [e.issues[0].message] });
          } else {
            errs.push({
              file: rel,
              errors: [e instanceof Error ? e.message : String(e)],
            });
          }
        }
      }
    }
  }

  walk(dotfilesDir);
  return { valid, errors: errs };
}

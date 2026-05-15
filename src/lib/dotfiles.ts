import fs from "fs";
import path from "path";
import os from "os";
import { z } from "zod/v4";
import { DotfileMetadata, DotfileFilename, FILENAME_REGEX } from "./schemas";
import type { DotfileEntry } from "./schemas";
import { getSourcedDotfiles } from "./shell";

const DOTFILES_DIR = path.join(os.homedir(), ".dotfiles-manager");
const METADATA_SUFFIX = ".meta.json";
const STORED_METADATA = z.string().transform((value): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}).pipe(DotfileMetadata);

function getDefaultMetadata(filename: string): DotfileMetadata {
  return {
    name: filename,
    description: `Shell configuration: ${filename}`,
    category: "aliases",
    variables: [],
    tags: [],
  };
}

function parseStoredMetadata(metaRaw: string, filename: string): DotfileMetadata {
  const parsed = STORED_METADATA.safeParse(metaRaw);
  if (!parsed.success) {
    return getDefaultMetadata(filename);
  }
  return parsed.data;
}

function readDotfileMetadata(metaPath: string, filename: string): DotfileMetadata {
  try {
    return parseStoredMetadata(fs.readFileSync(metaPath, "utf-8"), filename);
  } catch {
    return getDefaultMetadata(filename);
  }
}

function ensureDotfilesDir(): void {
  if (!fs.existsSync(DOTFILES_DIR)) {
    fs.mkdirSync(DOTFILES_DIR, { recursive: true, mode: 0o700 });
  }
}

export function getDotfilesDir(): string {
  return DOTFILES_DIR;
}

export function listDotfiles(shellConfigPath: string): DotfileEntry[] {
  ensureDotfilesDir();

  const sourcedDotfiles = getSourcedDotfiles(shellConfigPath);

  // Use withFileTypes to get file info in a single readdir call, avoiding many subsequent lstatSync calls
  const entries = fs.readdirSync(DOTFILES_DIR, { withFileTypes: true });
  const entryMap = new Map<string, fs.Dirent>();
  for (const entry of entries) {
    entryMap.set(entry.name, entry);
  }

  const results: DotfileEntry[] = [];
  for (const entry of entries) {
    if (
      !entry.isFile() ||
      !FILENAME_REGEX.test(entry.name) ||
      entry.name.endsWith(METADATA_SUFFIX) ||
      entry.name.startsWith(".")
    ) {
      continue;
    }

    const filename = entry.name;
    const filePath = path.join(DOTFILES_DIR, filename);
    const metaFilename = `${filename}${METADATA_SUFFIX}`;
    const metaPath = path.join(DOTFILES_DIR, metaFilename);

    // Check if meta file exists and is a regular file using our pre-built map
    const metaEntry = entryMap.get(metaFilename);
    if (metaEntry && !metaEntry.isFile()) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const metadata = metaEntry
      ? readDotfileMetadata(metaPath, filename)
      : getDefaultMetadata(filename);

    const installed = sourcedDotfiles.has(filename);

    results.push({
      ...metadata,
      filename,
      content,
      lineCount: countLines(content),
      installed,
    });
  }

  return results;
}

export function getDotfile(
  filename: string,
  shellConfigPath: string
): DotfileEntry | null {
  assertSafeDotfileName(filename);
  const filePath = path.join(DOTFILES_DIR, filename);
  if (!fs.existsSync(filePath) || !isRegularManagedFile(filePath)) return null;

  const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);
  const content = fs.readFileSync(filePath, "utf-8");
  const metadata = readDotfileMetadata(metaPath, filename);

  const installed = getSourcedDotfiles(shellConfigPath).has(filename);

  return { ...metadata, filename, content, lineCount: countLines(content), installed };
}

/**
 * Optimized line counter that uses a regex to count lines with content.
 * This is significantly faster than character-by-character iteration in V8.
 * It counts lines that have at least one non-whitespace character.
 */
function countLines(content: string): number {
  return (content.match(/^\s*\S/gm) || []).length;
}

export function createDotfile(
  filename: string,
  content: string,
  metadata: DotfileMetadata
): void {
  assertSafeDotfileName(filename);
  ensureDotfilesDir();

  const filePath = path.join(DOTFILES_DIR, filename);
  const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);
  assertNotSymbolicLink(filePath);
  assertNotSymbolicLink(metaPath);

  fs.writeFileSync(filePath, content, { encoding: "utf-8", mode: 0o600 });
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), {
    encoding: "utf-8",
    mode: 0o600,
  });
}

export function updateDotfileContent(
  filename: string,
  content: string
): void {
  assertSafeDotfileName(filename);
  const filePath = path.join(DOTFILES_DIR, filename);
  assertNotSymbolicLink(filePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dotfile not found: ${filename}`);
  }
  fs.writeFileSync(filePath, content, { encoding: "utf-8", mode: 0o600 });
  fs.chmodSync(filePath, 0o600);
}

/**
 * Replaces placeholders in the content with provided variable values.
 * Optimization: Performs all replacements in a single pass using a regex
 * instead of multiple split/join or replaceAll calls.
 */
export function applyVariables(
  content: string,
  variables: Record<string, string>
): string {
  validateVariableValues(variables);

  return content.replace(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(variables, key)
      ? variables[key]
      : match;
  });
}

function validateVariableValues(variables: Record<string, string>): void {
  for (const [key, value] of Object.entries(variables)) {
    // Block control characters and shell metacharacters that could be used for injection.
    // We specifically block quotes to prevent breaking out of quoted strings in dotfile templates.
    // We also block parenthesis/brackets to prevent subshell execution or Zsh process substitution.
    // We also block globbing characters and other complex shell expansion operators.
    // We also block '#' and '!' to prevent comments or history expansion side-effects.
    if (/[\r\n\0\$;`|&<>\(\)\[\]\{\}\*\?\?\\'"#!]/.test(value)) {
      throw new Error(
        `Invalid value for variable ${key}: contains forbidden characters (\r, \n, \0, $, \`, ;, |, &, <, >, \\, (, ), [, ], {, }, *, ?, ', ", #, !)`
      );
    }
  }
}

function assertSafeDotfileName(dotfileName: string): void {
  try {
    DotfileFilename.parse(dotfileName);
  } catch {
    throw new Error(`Invalid dotfile name: ${dotfileName}`);
  }
}

function isRegularManagedFile(filePath: string): boolean {
  try {
    const stat = fs.lstatSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function assertNotSymbolicLink(filePath: string): void {
  try {
    if (fs.lstatSync(filePath).isSymbolicLink()) {
      throw new Error(`Refusing to write symlinked file: ${path.basename(filePath)}`);
    }
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
}

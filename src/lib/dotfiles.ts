import fs from "fs";
import path from "path";
import os from "os";
import { z } from "zod/v4";
import { DotfileMetadata } from "./schemas";
import type { DotfileEntry } from "./schemas";
import { getSourcedDotfiles } from "./shell";

const DOTFILES_DIR = path.join(os.homedir(), ".dotfiles-manager");
const METADATA_SUFFIX = ".meta.json";
const SAFE_DOTFILE_NAME = /^[a-zA-Z0-9._-]+$/;
const STORED_METADATA = z.string().transform((value) => JSON.parse(value)).pipe(DotfileMetadata);

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

  const files = fs.readdirSync(DOTFILES_DIR);
  const dotfileNames = files.filter(
    (f) =>
      SAFE_DOTFILE_NAME.test(f) &&
      !f.endsWith(METADATA_SUFFIX) &&
      !f.startsWith(".")
  );

  return dotfileNames.map((filename) => {
    const filePath = path.join(DOTFILES_DIR, filename);
    const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);

    if (!isRegularManagedFile(filePath)) {
      return null;
    }

    if (fs.existsSync(metaPath) && !isRegularManagedFile(metaPath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const metadata = readDotfileMetadata(metaPath, filename);

    const installed = sourcedDotfiles.has(filename);

    return {
      ...metadata,
      filename,
      content,
      installed,
    };
  }).filter((entry): entry is DotfileEntry => entry !== null);
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

  return { ...metadata, filename, content, installed };
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

export function applyVariables(
  content: string,
  variables: Record<string, string>
): string {
  validateVariableValues(variables);

  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  return result;
}

function validateVariableValues(variables: Record<string, string>): void {
  for (const [key, value] of Object.entries(variables)) {
    if (/[\\r\\n\\0]/.test(value)) {
      throw new Error(
        `Invalid value for variable ${key}: control characters are not allowed`
      );
    }
  }
}

function assertSafeDotfileName(dotfileName: string): void {
  if (!SAFE_DOTFILE_NAME.test(dotfileName)) {
    throw new Error(`Invalid dotfile name: ${dotfileName}`);
  }
}

function isRegularManagedFile(filePath: string): boolean {
  try {
    const stat = fs.lstatSync(filePath);
    return stat.isFile() && !stat.isSymbolicLink();
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
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}

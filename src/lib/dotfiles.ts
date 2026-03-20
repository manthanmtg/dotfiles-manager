import fs from "fs";
import path from "path";
import os from "os";
import type { DotfileEntry, DotfileMetadata } from "./schemas";
import { isSourced } from "./shell";

const DOTFILES_DIR = path.join(os.homedir(), ".dotfiles-manager");
const METADATA_SUFFIX = ".meta.json";

export function ensureDotfilesDir(): void {
  if (!fs.existsSync(DOTFILES_DIR)) {
    fs.mkdirSync(DOTFILES_DIR, { recursive: true });
  }
}

export function getDotfilesDir(): string {
  return DOTFILES_DIR;
}

export function listDotfiles(shellConfigPath: string): DotfileEntry[] {
  ensureDotfilesDir();

  const files = fs.readdirSync(DOTFILES_DIR);
  const dotfileNames = files.filter(
    (f) => !f.endsWith(METADATA_SUFFIX) && !f.startsWith(".")
  );

  return dotfileNames.map((filename) => {
    const filePath = path.join(DOTFILES_DIR, filename);
    const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);
    const content = fs.readFileSync(filePath, "utf-8");

    let metadata: DotfileMetadata = {
      name: filename,
      description: `Shell configuration: ${filename}`,
      category: "aliases",
      variables: [],
      tags: [],
    };

    if (fs.existsSync(metaPath)) {
      try {
        const metaRaw = fs.readFileSync(metaPath, "utf-8");
        metadata = { ...metadata, ...JSON.parse(metaRaw) };
      } catch {
        // Use defaults if metadata is malformed
      }
    }

    const installed = isSourced(shellConfigPath, filename);

    return {
      ...metadata,
      filename,
      content,
      installed,
    };
  });
}

export function getDotfile(
  filename: string,
  shellConfigPath: string
): DotfileEntry | null {
  const filePath = path.join(DOTFILES_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);
  const content = fs.readFileSync(filePath, "utf-8");

  let metadata: DotfileMetadata = {
    name: filename,
    description: `Shell configuration: ${filename}`,
    category: "aliases",
    variables: [],
    tags: [],
  };

  if (fs.existsSync(metaPath)) {
    try {
      const metaRaw = fs.readFileSync(metaPath, "utf-8");
      metadata = { ...metadata, ...JSON.parse(metaRaw) };
    } catch {
      // Use defaults
    }
  }

  const installed = isSourced(shellConfigPath, filename);

  return { ...metadata, filename, content, installed };
}

export function createDotfile(
  filename: string,
  content: string,
  metadata: DotfileMetadata
): void {
  ensureDotfilesDir();

  const filePath = path.join(DOTFILES_DIR, filename);
  const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);

  fs.writeFileSync(filePath, content, "utf-8");
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
}

export function deleteDotfile(filename: string): void {
  const filePath = path.join(DOTFILES_DIR, filename);
  const metaPath = path.join(DOTFILES_DIR, `${filename}${METADATA_SUFFIX}`);

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
}

export function updateDotfileContent(
  filename: string,
  content: string
): void {
  const filePath = path.join(DOTFILES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dotfile not found: ${filename}`);
  }
  fs.writeFileSync(filePath, content, "utf-8");
}

export function applyVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

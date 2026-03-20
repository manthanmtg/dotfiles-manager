import { DotfileMetadata, DotfileVariable, DotfileCategory } from "./schemas";
import type { ZodError } from "zod/v4";

const META_START = "# @dotfiles-manager";
const META_END = "# @end";

interface ParseResult {
  metadata: ReturnType<typeof DotfileMetadata.parse>;
  content: string;
}

interface ParseError {
  file: string;
  errors: string[];
}

export function parseDotfileSource(
  raw: string,
  filepath: string
): ParseResult {
  const lines = raw.split("\n");

  const startIdx = lines.findIndex((l) => l.trim() === META_START);
  if (startIdx === -1) {
    throw new MetaParseError(filepath, [
      `Missing meta block. File must start with "${META_START}"`,
    ]);
  }

  const endIdx = lines.findIndex(
    (l, i) => i > startIdx && l.trim() === META_END
  );
  if (endIdx === -1) {
    throw new MetaParseError(filepath, [
      `Missing "${META_END}" — meta block was opened but never closed`,
    ]);
  }

  const metaLines = lines.slice(startIdx + 1, endIdx);
  const fields: Record<string, string> = {};
  const variables: Array<Record<string, unknown>> = [];
  const errors: string[] = [];

  for (let i = 0; i < metaLines.length; i++) {
    const line = metaLines[i];
    const stripped = line.replace(/^#\s*/, "").trim();
    if (!stripped) continue;

    const colonIdx = stripped.indexOf(":");
    if (colonIdx === -1) {
      errors.push(`Line ${startIdx + 2 + i}: Invalid meta line "${stripped}" — expected "key: value"`);
      continue;
    }

    const key = stripped.slice(0, colonIdx).trim().toLowerCase();
    const value = stripped.slice(colonIdx + 1).trim();

    if (key === "variable") {
      const parsed = parseVariableLine(value, startIdx + 2 + i);
      if (parsed.error) {
        errors.push(parsed.error);
      } else {
        variables.push(parsed.data!);
      }
    } else {
      fields[key] = value;
    }
  }

  if (errors.length > 0) {
    throw new MetaParseError(filepath, errors);
  }

  const tags = fields.tags
    ? fields.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  let metadata;
  try {
    metadata = DotfileMetadata.parse({
      name: fields.name,
      description: fields.description,
      category: fields.category,
      icon: fields.icon,
      tags,
      variables,
    });
  } catch (e) {
    const zodErr = e as ZodError;
    const msgs = zodErr.issues.map(
      (iss) => `${iss.path.join(".")}: ${iss.message}`
    );
    throw new MetaParseError(filepath, msgs);
  }

  const contentLines = lines.slice(endIdx + 1);
  const content = contentLines.join("\n").replace(/^\n+/, "");

  return { metadata, content };
}

function parseVariableLine(
  value: string,
  lineNum: number
): { data?: Record<string, unknown>; error?: string } {
  const parts = value.split("|").map((p) => p.trim());

  if (parts.length < 2) {
    return {
      error: `Line ${lineNum}: Variable needs at least "name | label" — got "${value}"`,
    };
  }

  const [name, label, description, defaultVal, requiredStr, sensitiveStr] =
    parts;

  return {
    data: {
      name,
      label,
      description: description || undefined,
      default: defaultVal || undefined,
      required: requiredStr ? requiredStr !== "optional" : true,
      sensitive: sensitiveStr === "sensitive",
    },
  };
}

export class MetaParseError extends Error {
  public file: string;
  public errors: string[];

  constructor(file: string, errors: string[]) {
    super(`Invalid meta in ${file}:\n  ${errors.join("\n  ")}`);
    this.name = "MetaParseError";
    this.file = file;
    this.errors = errors;
  }
}

export function validateAllDotfiles(
  dotfilesDir: string
): { valid: string[]; errors: ParseError[] } {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");

  const valid: string[] = [];
  const errs: ParseError[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".sh")) {
        const rel = path.relative(dotfilesDir, full);
        try {
          const raw = fs.readFileSync(full, "utf-8");
          parseDotfileSource(raw, rel);
          valid.push(rel);
        } catch (e) {
          if (e instanceof MetaParseError) {
            errs.push({ file: rel, errors: e.errors });
          } else {
            errs.push({
              file: rel,
              errors: [(e as Error).message],
            });
          }
        }
      }
    }
  }

  walk(dotfilesDir);
  return { valid, errors: errs };
}

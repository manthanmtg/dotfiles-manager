import fs from "node:fs";
import path from "node:path";
import { DotfileMetadata } from "./schemas";
import { type DotfileVariable as DotfileVariableMeta } from "./schemas";
import type { ZodError } from "zod/v4";

const META_START = "# @dotfiles-manager";
const META_END = "# @end";
const SUPPORTED_META_KEYS = new Set([
  "name",
  "description",
  "category",
  "icon",
  "tags",
  "variable",
]);

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
  const variables: Array<DotfileVariableMeta> = [];
  const errors: string[] = [];
  const seenVariables = new Set<string>();
  const fieldLines: Record<string, number> = {};

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
    const lineNo = startIdx + 2 + i;

    if (key === "variable") {
      const parsed = parseVariableLine(value, lineNo);
      if (parsed.error) {
        errors.push(parsed.error);
      } else if (seenVariables.has(parsed.data!.name)) {
        errors.push(
          `Line ${lineNo}: Duplicate variable "${parsed.data!.name}" in meta block`
        );
      } else {
        seenVariables.add(parsed.data!.name);
        variables.push(parsed.data!);
      }
    } else if (!SUPPORTED_META_KEYS.has(key)) {
      errors.push(
        `Line ${lineNo}: Unknown meta key "${key}" (supported: ${[
          ...SUPPORTED_META_KEYS,
        ].join(", ")})`
      );
    } else {
      if (Object.hasOwn(fields, key)) {
        errors.push(`Line ${lineNo}: Duplicate key "${key}" in meta block`);
      }
      fieldLines[key] = lineNo;
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
    const msgs = zodErr.issues.map((iss) => {
      const pathKey = String(iss.path[0] ?? "");
      const line = fieldLines[pathKey];
      const label = pathKey ? `Field "${pathKey}"` : "Meta block";
      const location = line ? `Line ${line}: ` : "";
      if (iss.code === "invalid_type" && pathKey && pathKey in fields) {
        return `${location}${label}: ${iss.message}`;
      }
      if (iss.code === "invalid_union") {
        return `${location}${label}: ${iss.message}`;
      }
      return `${location}${label}: ${iss.message}`;
    });
    throw new MetaParseError(filepath, msgs);
  }

  const contentLines = lines.slice(endIdx + 1);
  const content = contentLines.join("\n").replace(/^\n+/, "");

  return { metadata, content };
}

function parseVariableLine(
  value: string,
  lineNum: number
): { data?: DotfileVariableMeta; error?: string } {
  const parts = value.split("|").map((p) => p.trim());

  if (parts.length < 2) {
    return {
      error: `Line ${lineNum}: Variable needs at least "name | label" — got "${value}"`,
    };
  }

  if (parts.length > 6) {
    return {
      error: `Line ${lineNum}: Variable definition has too many fields — expected at most 6 "name | label | description | default | required | sensitive"`,
    };
  }

  const [name, label, description, defaultVal, requiredStr, sensitiveStr] =
    parts;

  if (!name || !/^[A-Z0-9_]+$/.test(name)) {
    return {
      error: `Line ${lineNum}: Variable name must be uppercase with optional underscores and digits — got "${name}"`,
    };
  }

  const requiredToken = requiredStr
    ? requiredStr.trim().toLowerCase()
    : "required";
  if (requiredToken !== "required" && requiredToken !== "optional") {
    return {
      error: `Line ${lineNum}: Variable required flag must be "required" or "optional" — got "${requiredStr}"`,
    };
  }

  if (sensitiveStr && sensitiveStr.toLowerCase() !== "sensitive") {
    return {
      error: `Line ${lineNum}: Variable flag can only be "sensitive" when provided — got "${sensitiveStr}"`,
    };
  }

  return {
    data: {
      name,
      label,
      description: description || undefined,
      default: defaultVal || undefined,
      required: requiredToken !== "optional",
      sensitive: sensitiveStr ? sensitiveStr.toLowerCase() === "sensitive" : false,
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

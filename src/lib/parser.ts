import fs from "node:fs";
import path from "node:path";
import { DotfileMetadata } from "./schemas";
import { type DotfileVariable as DotfileVariableMeta } from "./schemas";
import { ZodError } from "zod/v4";

const META_START = "# @dotfiles-manager";
const META_END = "# @end";
const REQUIRED_META_KEYS = ["name", "description", "category"] as const;
const SUPPORTED_META_KEYS = new Set([
  "name",
  "description",
  "category",
  "icon",
  "tags",
  "variable",
]);

interface ParseResult {
  metadata: DotfileMetadata;
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
  // Optimization: Find meta block boundaries first to avoid splitting huge files into thousands of strings
  const endIdxPos = raw.indexOf(META_END);

  if (endIdxPos === -1) {
    // Check for start to give a better error message
    if (!raw.trimStart().startsWith(META_START)) {
      throw new MetaParseError(filepath, [
        `Missing meta block. File must start with "${META_START}"`,
      ]);
    }
    throw new MetaParseError(filepath, [
      `Missing "${META_END}" — meta block was opened but never closed`,
    ]);
  }

  const metaPart = raw.slice(0, endIdxPos);
  const lines = metaPart.split("\n");

  if (lines.length === 0 || lines[0].trim() !== META_START) {
    throw new MetaParseError(filepath, [
      `Missing meta block. File must start with "${META_START}"`,
    ]);
  }

  const fields: Record<string, string> = {};
  const variables: Array<DotfileVariableMeta> = [];
  const errors: string[] = [];
  const seenVariables = new Set<string>();
  const fieldLines: Record<string, number> = {};
  const variableLines: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // trimmed === META_END check is no longer needed here as we split by META_END
    // Faster path for common meta lines starting with "# " or "#"
    const stripped = line.startsWith("#") 
      ? line.slice(1).trim() 
      : line.trim();
    
    if (!stripped) continue;

    const colonIdx = stripped.indexOf(":");
    if (colonIdx === -1) {
      errors.push(`Line ${i + 1}: Invalid meta line "${stripped}" — expected "key: value"`);
      continue;
    }

    const key = stripped.slice(0, colonIdx).trim().toLowerCase();
    const value = stripped.slice(colonIdx + 1).trim();
    const lineNo = i + 1;

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
        variableLines.push(lineNo);
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

  for (const key of REQUIRED_META_KEYS) {
    if (typeof fields[key] === "undefined") {
      errors.push(
        `Line ${lines.length + 1}: Missing required meta field "${key}" before "${META_END}"`
      );
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
  } catch (error) {
    const messages =
      error instanceof ZodError
        ? error.issues.map((iss) => {
      const pathKey = String(iss.path[0] ?? "");
      let line: number | undefined;
      let fieldName = pathKey;

      if (iss.path[0] === "variables" && typeof iss.path[1] === "number") {
        const variableIndex = iss.path[1];
        line = variableLines[variableIndex];
        const variableField = typeof iss.path[2] === "string" ? iss.path[2] : "entry";
        fieldName = variableField
          ? `variables[${variableIndex}].${variableField}`
          : "variables";
      } else if (pathKey) {
        line = fieldLines[pathKey];
      }

      const label = pathKey ? `Field "${fieldName}"` : "Meta block";
      const location = line ? `Line ${line}: ` : "";
      return `${location}${label}: ${iss.message}`;
    })
        : [
            `Unexpected metadata parse error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ];

    throw new MetaParseError(filepath, messages);
  }

  // content starts after META_END
  const content = raw.slice(endIdxPos + META_END.length).replace(/^\n+/, "");

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

  if (!label) {
    return {
      error: `Line ${lineNum}: Variable label is required — got empty value in "${value}"`,
    };
  }

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

class MetaParseError extends Error {
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
            errors: [errorToMessage(e)],
          });
        }
      }
    }
    }
  }

  walk(dotfilesDir);
  return { valid, errors: errs };
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

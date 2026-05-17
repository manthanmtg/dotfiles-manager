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

/**
 * Parses the meta block and content from a dotfile source string.
 * Validates against required fields and variable syntax.
 */
export function parseDotfileSource(
  raw: string,
  filepath: string
): ParseResult {
  const startIdxPos = raw.indexOf(META_START);
  const endIdxPos = raw.indexOf(META_END);

  if (startIdxPos === -1) {
    throw new MetaParseError(filepath, [
      `Missing meta block. File must contain "${META_START}"`,
    ]);
  }

  if (endIdxPos === -1) {
    throw new MetaParseError(filepath, [
      `Missing "${META_END}" — meta block was opened but never closed`,
    ]);
  }

  if (endIdxPos < startIdxPos) {
    throw new MetaParseError(filepath, [
      `Malformed meta block — "${META_END}" appears before "${META_START}"`,
    ]);
  }

  // Check for content before META_START
  const beforeMeta = raw.slice(0, startIdxPos);
  if (beforeMeta.trim().length > 0) {
    throw new MetaParseError(filepath, [
      `Meta block must be at the top of the file. Found non-whitespace content before "${META_START}"`,
    ]);
  }

  const lineOffset = beforeMeta.split("\n").length - 1;
  const metaPart = raw.slice(startIdxPos, endIdxPos);
  const lines = metaPart.split("\n");

  const fields: Record<string, string> = {};
  const variables: Array<DotfileVariableMeta> = [];
  const errors: string[] = [];
  const seenVariables = new Set<string>();
  const fieldLines: Record<string, number> = {};
  const variableLines: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;

    const lineNo = i + 1 + lineOffset;

    if (!trimmedLine.startsWith("#")) {
      errors.push(`Line ${lineNo}: Meta line must be a comment (start with "#")`);
      continue;
    }

    const stripped = trimmedLine.slice(1).trim();
    if (!stripped) continue;

    const colonIdx = stripped.indexOf(":");
    if (colonIdx === -1) {
      errors.push(`Line ${lineNo}: Invalid meta line "${stripped}" — expected "key: value"`);
      continue;
    }

    const key = stripped.slice(0, colonIdx).trim().toLowerCase();
    const value = stripped.slice(colonIdx + 1).trim();

    if (key === "variable") {
      const parsed = parseVariableLine(value, lineNo);
      if (parsed.success) {
        if (seenVariables.has(parsed.data.name)) {
          errors.push(
            `Line ${lineNo}: Duplicate variable "${parsed.data.name}" in meta block`
          );
        } else {
          seenVariables.add(parsed.data.name);
          variableLines.push(lineNo);
          variables.push(parsed.data);
        }
      } else {
        errors.push(parsed.error);
      }
    } else if (!SUPPORTED_META_KEYS.has(key)) {
      errors.push(
        `Line ${lineNo}: Unknown meta key "${key}" (supported: ${[
          ...SUPPORTED_META_KEYS,
        ].sort().join(", ")})`
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

  const endLineNo = (raw.slice(0, endIdxPos + META_END.length).split("\n").length);

  for (const key of REQUIRED_META_KEYS) {
    if (typeof fields[key] === "undefined") {
      errors.push(
        `Line ${endLineNo}: Missing required meta field "${key}" before "${META_END}"`
      );
    }
  }

  if (errors.length > 0) {
    throw new MetaParseError(filepath, errors);
  }

  const tags = fields.tags
    ? fields.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  let metadata: DotfileMetadata;
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
): { success: true; data: DotfileVariableMeta } | { success: false; error: string } {
  const parts = value.split("|").map((p) => p.trim());

  if (parts.length < 2) {
    return {
      success: false,
      error: `Line ${lineNum}: Variable needs at least "name | label" — got "${value}"`,
    };
  }

  if (parts.length > 6) {
    return {
      success: false,
      error: `Line ${lineNum}: Variable definition has too many fields — expected at most 6 "name | label | description | default | required | sensitive"`,
    };
  }

  const [name, label, description, defaultVal, requiredStr, sensitiveStr] =
    parts;

  if (!label) {
    return {
      success: false,
      error: `Line ${lineNum}: Variable label is required — got empty value in "${value}"`,
    };
  }

  if (!name || !/^[A-Z_][A-Z0-9_]*$/.test(name)) {
    return {
      success: false,
      error: `Line ${lineNum}: Variable name must be uppercase, start with a letter or underscore, and contain only alphanumeric characters or underscores — got "${name}"`,
    };
  }

  const requiredToken = requiredStr
    ? requiredStr.trim().toLowerCase()
    : "required";
  if (requiredToken !== "required" && requiredToken !== "optional") {
    return {
      success: false,
      error: `Line ${lineNum}: Variable required flag must be "required" or "optional" — got "${requiredStr}"`,
    };
  }

  if (sensitiveStr && sensitiveStr.toLowerCase() !== "sensitive") {
    return {
      success: false,
      error: `Line ${lineNum}: Variable flag can only be "sensitive" when provided — got "${sensitiveStr}"`,
    };
  }

  return {
    success: true,
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

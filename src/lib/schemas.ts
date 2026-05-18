import { z } from "zod/v4";

export const FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
export const TAG_REGEX = /^[a-z0-9-]+$/;

export const DotfileFilename = z.string()
  .max(64, "filename is too long (max 64 chars)")
  .regex(FILENAME_REGEX, "filename must contain only alphanumeric characters, dots, hyphens, or underscores")
  .refine(val => val !== "." && val !== "..", "filename cannot be '.' or '..'");

export const DotfileCategory = z.enum([
  "aliases",
  "scripts",
  "prompts",
  "security",
  "environment",
  "functions",
]);
export type DotfileCategory = z.infer<typeof DotfileCategory>;

export const DotfileVariable = z.object({
  name: z.string().min(1, "variable name cannot be empty").regex(/^[A-Z_][A-Z0-9_]*$/, "variable name must be uppercase, start with a letter or underscore, and contain only alphanumeric characters or underscores"),
  label: z.string().min(1, "label cannot be empty"),
  description: z.string().optional(),
  default: z.string().optional(),
  required: z.boolean().default(true),
  sensitive: z.boolean().default(false),
});
export type DotfileVariable = z.infer<typeof DotfileVariable>;

export const SUPPORTED_ICONS = [
  "Zap",
  "Code",
  "Terminal",
  "Shield",
  "Settings",
  "Braces",
  "GitBranch",
  "Container",
  "Box",
  "FolderOpen",
  "FileArchive",
  "ShieldAlert",
  "Network",
  "FolderPlus",
  "FileEdit",
] as const;

export const DotfileMetadata = z.object({
  name: z.string().min(1, "name cannot be empty").max(100, "name is too long (max 100 chars)"),
  description: z.string().min(1, "description cannot be empty").max(500, "description is too long (max 500 chars)"),
  category: DotfileCategory,
  icon: z.string().max(50, "icon name is too long").optional(),
  variables: z.array(DotfileVariable).max(20, "too many variables (max 20)").default([]),
  tags: z.array(z.string().max(30, "tag is too long").regex(TAG_REGEX, "tag must contain only lowercase alphanumeric characters and hyphens")).max(10, "too many tags (max 10)").default([]),
})
.refine(data => {
  if (data.icon && !(SUPPORTED_ICONS as readonly string[]).includes(data.icon)) return false;
  return true;
}, {
  message: `icon must be one of: ${SUPPORTED_ICONS.join(", ")}`,
  path: ["icon"]
})
.refine(data => {
  const seen = new Set<string>();
  for (const t of data.tags) {
    if (seen.has(t)) return false;
    seen.add(t);
  }
  return true;
}, {
  message: "tags must be unique",
  path: ["tags"]
})
.refine(data => {
  const seen = new Set<string>();
  for (const v of data.variables) {
    if (seen.has(v.name)) return false;
    seen.add(v.name);
  }
  return true;
}, {
  message: "variable names must be unique",
  path: ["variables"]
});
export type DotfileMetadata = z.infer<typeof DotfileMetadata>;

export const DotfileEntry = DotfileMetadata.extend({
  filename: DotfileFilename,
  content: z.string().max(1024 * 100), // 100KB limit
  lineCount: z.number().default(0),
  installed: z.boolean().default(false),
});
export type DotfileEntry = z.infer<typeof DotfileEntry>;

export const ShellInfo = z.object({
  shell: z.enum(["zsh", "bash", "fish", "unknown"]),
  configPath: z.string().max(1024),
  configExists: z.boolean(),
});
export type ShellInfo = z.infer<typeof ShellInfo>;

export const PlatformData = z.object({
  platform: z.string().max(50),
  supported: z.boolean(),
  shell: ShellInfo,
});
export type PlatformData = z.infer<typeof PlatformData>;

export const InstallRequest = z.object({
  filename: DotfileFilename,
  variables: z.record(z.string().max(100), z.string().max(2048)).optional(),
});
export type InstallRequest = z.infer<typeof InstallRequest>;

export const InstallResult = z.object({
  filename: DotfileFilename,
  configPath: z.string().max(1024),
  shell: ShellInfo.shape.shell,
  message: z.string().max(1024),
});
export type InstallResult = z.infer<typeof InstallResult>;

export const SeedResult = z.object({
  seeded: z.number(),
  updated: z.number(),
  skipped: z.number(),
});
export type SeedResult = z.infer<typeof SeedResult>;

export const UninstallRequest = z.object({
  filename: DotfileFilename,
});
export type UninstallRequest = z.infer<typeof UninstallRequest>;

export const CreateDotfileRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: DotfileCategory,
  content: z.string().min(1).max(1024 * 100), // 100KB limit
  variables: z.array(DotfileVariable).max(20).default([]),
  tags: z.array(z.string().max(30)).max(10).default([]),
});
export type CreateDotfileRequest = z.infer<typeof CreateDotfileRequest>;

export const CreateDotfileResponse = z.object({
  filename: DotfileFilename,
  message: z.string().max(1024),
});
export type CreateDotfileResponse = z.infer<typeof CreateDotfileResponse>;

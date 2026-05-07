import { z } from "zod/v4";

export const DotfileFilename = z.string().regex(
  /^[a-zA-Z0-9._-]+$/,
  "filename must contain only alphanumeric characters, dots, hyphens, or underscores"
);

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

export const DotfileMetadata = z.object({
  name: z.string().min(1, "name cannot be empty").max(100, "name is too long (max 100 chars)"),
  description: z.string().min(1, "description cannot be empty").max(500, "description is too long (max 500 chars)"),
  category: DotfileCategory,
  icon: z.string().max(50, "icon name is too long").optional(),
  variables: z.array(DotfileVariable).max(20, "too many variables (max 20)").default([]),
  tags: z.array(z.string().max(30, "tag is too long")).max(10, "too many tags (max 10)").default([]),
});
export type DotfileMetadata = z.infer<typeof DotfileMetadata>;

export const DotfileEntry = DotfileMetadata.extend({
  filename: DotfileFilename,
  content: z.string().max(1024 * 100), // 100KB limit
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
  filename: z.string().max(255),
  configPath: z.string().max(1024),
  shell: z.string().max(50),
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
  filename: z.string().max(255),
  message: z.string().max(1024),
});
export type CreateDotfileResponse = z.infer<typeof CreateDotfileResponse>;

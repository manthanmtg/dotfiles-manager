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
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  default: z.string().optional(),
  required: z.boolean().default(true),
  sensitive: z.boolean().default(false),
});
export type DotfileVariable = z.infer<typeof DotfileVariable>;

export const DotfileMetadata = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: DotfileCategory,
  icon: z.string().optional(),
  variables: z.array(DotfileVariable).default([]),
  tags: z.array(z.string()).default([]),
});
export type DotfileMetadata = z.infer<typeof DotfileMetadata>;

export const DotfileEntry = DotfileMetadata.extend({
  filename: DotfileFilename,
  content: z.string(),
  installed: z.boolean().default(false),
});
export type DotfileEntry = z.infer<typeof DotfileEntry>;

export const ShellInfo = z.object({
  shell: z.enum(["zsh", "bash", "fish", "unknown"]),
  configPath: z.string(),
  configExists: z.boolean(),
});
export type ShellInfo = z.infer<typeof ShellInfo>;

export const InstallRequest = z.object({
  filename: DotfileFilename,
  variables: z.record(z.string(), z.string()).optional(),
});
export type InstallRequest = z.infer<typeof InstallRequest>;

export const UninstallRequest = z.object({
  filename: DotfileFilename,
});
export type UninstallRequest = z.infer<typeof UninstallRequest>;

export const CreateDotfileRequest = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: DotfileCategory,
  content: z.string().min(1),
  variables: z.array(DotfileVariable).default([]),
  tags: z.array(z.string()).default([]),
});
export type CreateDotfileRequest = z.infer<typeof CreateDotfileRequest>;

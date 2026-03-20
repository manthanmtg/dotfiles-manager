import { z } from "zod/v4";

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
  description: z.string(),
  category: DotfileCategory,
  icon: z.string().optional(),
  variables: z.array(DotfileVariable).default([]),
  tags: z.array(z.string()).default([]),
});
export type DotfileMetadata = z.infer<typeof DotfileMetadata>;

export const DotfileEntry = DotfileMetadata.extend({
  filename: z.string().min(1),
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
  filename: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
});
export type InstallRequest = z.infer<typeof InstallRequest>;

export const UninstallRequest = z.object({
  filename: z.string().min(1),
});
export type UninstallRequest = z.infer<typeof UninstallRequest>;

export const ApiResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export const PlatformInfo = z.object({
  platform: z.string(),
  supported: z.boolean(),
  shell: ShellInfo.optional(),
});
export type PlatformInfo = z.infer<typeof PlatformInfo>;

export const CreateDotfileRequest = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: DotfileCategory,
  content: z.string().min(1),
  variables: z.array(DotfileVariable).default([]),
  tags: z.array(z.string()).default([]),
});
export type CreateDotfileRequest = z.infer<typeof CreateDotfileRequest>;

import {
  DotfileCategory as DotfileCategoryType,
  DotfileVariable as DotfileVariableType,
  DotfileEntry as DotfileEntryType,
  PlatformData as PlatformDataType,
  InstallResult as InstallResultType,
  SeedResult as SeedResultType,
  CreateDotfileResponse as CreateDotfileResponseType,
} from "@/lib/schemas";

export type DotfileCategory = DotfileCategoryType;
export type DotfileVariable = DotfileVariableType;
export type DotfileEntry = DotfileEntryType;
export type PlatformData = PlatformDataType;
export type InstallResult = InstallResultType;
export type SeedResult = SeedResultType;
export type CreateDotfileResponse = CreateDotfileResponseType;

export interface TerminalLine {
  type: "info" | "success" | "error" | "warning" | "command";
  text: string;
  timestamp: number;
}

export type ThemeColor = "cyan" | "emerald" | "purple" | "rose" | "amber" | "sky";

export const CATEGORY_META: Record<
  DotfileCategory,
  { label: string; icon: string; color: ThemeColor; description: string }
> = {
  aliases: {
    label: "Aliases",
    icon: "Zap",
    color: "cyan",
    description: "Command shortcuts to speed up your workflow",
  },
  scripts: {
    label: "Scripts",
    icon: "Code",
    color: "emerald",
    description: "Helper scripts and dev tool shortcuts",
  },
  prompts: {
    label: "Prompts",
    icon: "Terminal",
    color: "purple",
    description: "Shell prompt customizations and themes",
  },
  security: {
    label: "Security",
    icon: "Shield",
    color: "rose",
    description: "Security hardening and safety configurations",
  },
  environment: {
    label: "Environment",
    icon: "Settings",
    color: "amber",
    description: "Environment variables and path configuration",
  },
  functions: {
    label: "Functions",
    icon: "Braces",
    color: "sky",
    description: "Reusable shell functions and utilities",
  },
};

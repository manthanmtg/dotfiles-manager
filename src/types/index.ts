export type DotfileCategory =
  | "aliases"
  | "scripts"
  | "prompts"
  | "security"
  | "environment"
  | "functions";

export interface DotfileVariable {
  name: string;
  label: string;
  description?: string;
  default?: string;
  required: boolean;
  sensitive: boolean;
}

export interface DotfileEntry {
  name: string;
  description: string;
  category: DotfileCategory;
  icon?: string;
  variables: DotfileVariable[];
  tags: string[];
  filename: string;
  content: string;
  installed: boolean;
}

export interface ShellInfo {
  shell: "zsh" | "bash" | "fish" | "unknown";
  configPath: string;
  configExists: boolean;
}

export interface PlatformData {
  platform: string;
  supported: boolean;
  shell: ShellInfo;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InstallResult {
  filename: string;
  configPath: string;
  shell: string;
  message: string;
}

export interface TerminalLine {
  type: "info" | "success" | "error" | "warning" | "command";
  text: string;
  timestamp: number;
}

export const CATEGORY_META: Record<
  DotfileCategory,
  { label: string; icon: string; color: string; description: string }
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

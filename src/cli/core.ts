import type { DotfileEntry, DotfileVariable } from "../lib/schemas";
import { CATEGORY_META, type DotfileCategory } from "../types";

interface ParsedCliArgs {
  command: string;
  positionals: string[];
  flags: Record<string, boolean | string[]>;
}

type VariableCollectionResult =
  | { ok: true; values: Record<string, string> }
  | { ok: false; error: string };

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const EMERALD = "\x1b[32m";
const AMBER = "\x1b[33m";
const ROSE = "\x1b[31m";
const PURPLE = "\x1b[35m";
const SKY = "\x1b[94m";

const CATEGORY_COLORS: Record<DotfileCategory, string> = {
  aliases: CYAN,
  scripts: EMERALD,
  prompts: PURPLE,
  security: ROSE,
  environment: AMBER,
  functions: SKY,
};

export function parseCliArgs(argv: string[]): ParsedCliArgs {
  const normalizedArgv = argv[0] === "--" ? argv.slice(1) : argv;
  const [command = "help", ...rest] = normalizedArgv;
  const positionals: string[] = [];
  const flags: Record<string, boolean | string[]> = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const flagName = arg.slice(2);
    if (!flagName) continue;

    const next = rest[i + 1];
    if (next && !next.startsWith("--")) {
      const existing = flags[flagName];
      if (Array.isArray(existing)) {
        existing.push(next);
      } else if (typeof existing === "string") {
        flags[flagName] = [existing, next];
      } else if (existing === true) {
        flags[flagName] = [next];
      } else {
        flags[flagName] = [next];
      }
      i++;
      continue;
    }

    flags[flagName] = true;
  }

  return { command, positionals, flags };
}

export function parseSetFlags(flags: Record<string, boolean | string[]>): Map<string, string> {
  const values = new Map<string, string>();
  const setFlags = flags.set;
  if (!Array.isArray(setFlags)) return values;

  for (const pair of setFlags) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex <= 0) {
      throw new Error(`Invalid --set value "${pair}". Use --set NAME=value.`);
    }

    values.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
  }

  return values;
}

export function collectVariableValues(
  variables: DotfileVariable[],
  provided: Map<string, string>
): VariableCollectionResult {
  const values: Record<string, string> = {};

  for (const variable of variables) {
    const providedValue = provided.get(variable.name);
    const value = providedValue ?? variable.default;

    if (variable.required && !value) {
      return {
        ok: false,
        error: `Missing required variable ${variable.name}. Pass it with --set ${variable.name}=value.`,
      };
    }

    if (value !== undefined) {
      values[variable.name] = value;
    }
  }

  return { ok: true, values };
}

export function formatDotfileList(dotfiles: DotfileEntry[]): string {
  if (dotfiles.length === 0) {
    return `${DIM}No dotfiles found. Run dotfiles-manager seed first.${RESET}`;
  }

  const categories = Object.keys(CATEGORY_META) as DotfileCategory[];
  const sections: string[] = [];

  for (const category of categories) {
    const entries = dotfiles.filter((dotfile) => dotfile.category === category);
    if (entries.length === 0) continue;

    const color = CATEGORY_COLORS[category];
    sections.push(`${color}${BOLD}${CATEGORY_META[category].label}${RESET}`);
    for (const entry of entries) {
      const marker = entry.installed ? "✓" : "○";
      const tags = entry.tags.length > 0 ? ` ${DIM}#${entry.tags.join(" #")}${RESET}` : "";
      sections.push(
        `  ${marker} ${entry.filename} ${DIM}${entry.name}${RESET}\n` +
          `    ${entry.description}${tags}`
      );
    }
  }

  return sections.join("\n");
}

export function formatHelp(): string {
  return `${CYAN}${BOLD}Dotfiles Manager CLI${RESET}

${BOLD}Usage${RESET}
  dotfiles-manager <command> [options]

${BOLD}Commands${RESET}
  seed                         Copy bundled dotfiles into ~/.dotfiles-manager
  list [--installed|--available]  List managed dotfiles grouped by category
  show <filename>              Print a dotfile's stored shell content
  install <filename>           Source a dotfile from your shell config
  uninstall <filename>         Remove a managed source line
  shell                        Show detected shell and config file
  help                         Show this help

${BOLD}Install Variables${RESET}
  dotfiles-manager install ssh-agent-setup --set SSH_KEY_PATH=~/.ssh/id_ed25519

${DIM}The CLI uses the same local storage and shell config safety checks as the web app.${RESET}`;
}

export function formatShell(shell: {
  shell: string;
  configPath: string;
  configExists: boolean;
}): string {
  const exists = shell.configExists ? `${EMERALD}exists${RESET}` : `${AMBER}missing${RESET}`;
  return `${CYAN}${BOLD}Shell${RESET}
  shell:  ${shell.shell}
  config: ${shell.configPath} ${DIM}(${exists}${DIM})${RESET}`;
}

export function success(message: string): string {
  return `${EMERALD}✓${RESET} ${message}`;
}

export function warning(message: string): string {
  return `${AMBER}!${RESET} ${message}`;
}

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import type { ShellInfo } from "./schemas";

const SHELL_CONFIG_MAP: Record<string, string> = {
  zsh: ".zshrc",
  bash: ".bashrc",
  fish: path.join(".config", "fish", "config.fish"),
};
const SAFE_DOTFILE_SOURCE_PATHS = Object.values(SHELL_CONFIG_MAP).map((configFile) =>
  path.join(os.homedir(), configFile)
);
const SAFE_DOTFILE_NAME = /^[a-zA-Z0-9._-]+$/;
const MANAGED_DOTFILE_SOURCE_PATH = "~/.dotfiles-manager";

export function detectShell(): ShellInfo {
  const home = os.homedir();
  let shellName = "unknown";

  try {
    const defaultShell = process.env.SHELL || "";
    shellName = path.basename(defaultShell);
  } catch {
    try {
      const result = execSync("echo $SHELL", { encoding: "utf-8" }).trim();
      shellName = path.basename(result);
    } catch {
      shellName = "unknown";
    }
  }

  const normalizedShell = shellName.toLowerCase();
  const shell: ShellInfo["shell"] = isSupportedShell(normalizedShell)
    ? normalizedShell
    : "unknown";

  const configFile = SHELL_CONFIG_MAP[shell] || ".bashrc";
  const configPath = path.join(home, configFile);
  const configExists = fs.existsSync(configPath);

  return { shell, configPath, configExists };
}

function isSupportedShell(
  shellName: string
): shellName is "zsh" | "bash" | "fish" {
  return shellName === "zsh" || shellName === "bash" || shellName === "fish";
}

export function isSourced(configPath: string, dotfileName: string): boolean {
  assertSafeConfigPath(configPath);
  assertSafeDotfileName(dotfileName);

  return getSourcedDotfiles(configPath).has(dotfileName);
}

export function getSourcedDotfiles(configPath: string): Set<string> {
  assertSafeConfigPath(configPath);
  const sourced = new Set<string>();
  if (!fs.existsSync(configPath)) return sourced;

  const content = fs.readFileSync(configPath, "utf-8");
  const pattern = getManagedSourceLineCapturePattern();

  for (const match of content.matchAll(pattern)) {
    const name = match[1];
    if (name && SAFE_DOTFILE_NAME.test(name)) {
      sourced.add(name);
    }
  }

  return sourced;
}

export function addSource(configPath: string, dotfileName: string): void {
  assertSafeDotfileName(dotfileName);
  assertSafeConfigPath(configPath);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    fs.accessSync(configPath, fs.constants.W_OK);
  } catch {
    throw new Error(`Config file is not writable: ${configPath}`);
  }

  if (isSourced(configPath, dotfileName)) {
    throw new Error(`${dotfileName} is already sourced in ${configPath}`);
  }

  const content = fs.readFileSync(configPath, "utf-8");
  const needsLeadingNewline = content.length > 0 && !content.endsWith("\n");
  const sourceLine = `${needsLeadingNewline ? "\n" : ""}source ${MANAGED_DOTFILE_SOURCE_PATH}/${dotfileName}\n`;

  fs.appendFileSync(configPath, sourceLine, "utf-8");
}

export function removeSource(configPath: string, dotfileName: string): void {
  assertSafeDotfileName(dotfileName);
  assertSafeConfigPath(configPath);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    fs.accessSync(configPath, fs.constants.W_OK);
  } catch {
    throw new Error(`Config file is not writable: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, "utf-8");
  const sourcePattern = getManagedSourceLinePattern(dotfileName, {
    includeLineEnd: true,
  });

  const newContent = content.replace(sourcePattern, "");

  if (newContent === content) {
    throw new Error(`No managed source line found for ${dotfileName} in ${configPath}`);
  }

  fs.writeFileSync(configPath, newContent, "utf-8");
}

function getManagedSourceLinePattern(
  dotfileName: string,
  options: { includeLineEnd?: boolean } = {}
): RegExp {
  const dotfilesPathPattern = `${escapeRegex(MANAGED_DOTFILE_SOURCE_PATH)}/${escapeRegex(
    dotfileName
  )}`;
  const trailingContent = "(?:[\\t ]*(?:#.*)?)?";
  const lineEnd = options.includeLineEnd ? "(?:\\r?\\n|$)" : "$";

  return new RegExp(`^[ \\t]*source\\s+${dotfilesPathPattern}${trailingContent}${lineEnd}`, "gm");
}

function getManagedSourceLineCapturePattern(): RegExp {
  const dotfilesPathPattern = escapeRegex(MANAGED_DOTFILE_SOURCE_PATH);

  return new RegExp(
    `^[ \\t]*source\\s+${dotfilesPathPattern}\\/([^\\s#]+)(?:[\\t ]*(?:#.*)?)?(?:\\r?\\n|$)`,
    "gm"
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertSafeDotfileName(dotfileName: string): void {
  if (!SAFE_DOTFILE_NAME.test(dotfileName)) {
    throw new Error(`Invalid dotfile name: ${dotfileName}`);
  }
}

function assertSafeConfigPath(configPath: string): void {
  const normalized = path.resolve(configPath);
  if (!SAFE_DOTFILE_SOURCE_PATHS.includes(normalized)) {
    throw new Error(`Invalid shell config path: ${configPath}`);
  }
}

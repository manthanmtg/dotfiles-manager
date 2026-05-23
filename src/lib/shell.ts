import fs from "fs";
import path from "path";
import os from "os";
import { type ShellInfo, DotfileFilename, FILENAME_REGEX } from "./schemas";
import { atomicWriteFile, escapeRegex } from "./fs";

const SHELL_CONFIG_MAP: Record<string, string> = {
  zsh: ".zshrc",
  bash: ".bashrc",
  fish: path.join(".config", "fish", "config.fish"),
};
const SAFE_DOTFILE_SOURCE_PATHS = Object.values(SHELL_CONFIG_MAP).map((configFile) =>
  path.join(os.homedir(), configFile)
);
const MANAGED_DOTFILE_SOURCE_PATH = "$HOME/.dotfiles-manager";
const HOME_PATH = os.homedir();

/**
 * Returns a regex pattern that matches the managed dotfiles directory path.
 * It matches tilde (~/.dotfiles-manager), absolute home path (/home/user/.dotfiles-manager),
 * or the $HOME environment variable ($HOME/.dotfiles-manager).
 */
function getManagedSourcePathPattern(): string {
  const escapedHome = escapeRegex(HOME_PATH);
  const escapedTilde = escapeRegex("~");
  const managedDir = escapeRegex(".dotfiles-manager");
  return `(?:${escapedTilde}|${escapedHome}|\\$HOME|\\$\{HOME\})\\/${managedDir}`;
}

// Pre-compile the capture pattern to detect any managed source line.
// This is used by getSourcedDotfilesFromContent for listing and checking status.
// It handles optional quotes around the path and trailing comments.
const SOURCE_CAPTURE_PATTERN = new RegExp(
  `^[ \\t]*(?:source|\\.)\\s+["']?${getManagedSourcePathPattern()}\\/([^\\s#"'\\)]+?)["']?(?:[\\t ]*(?:#.*)?)?(?:\\r?\\n|$)`,
  "gm"
);

export function detectShell(): ShellInfo {
  const home = os.homedir();
  let shellName = "unknown";

  try {
    // Priority 1: $SHELL environment variable
    const envShell = process.env.SHELL;
    if (envShell) {
      shellName = path.basename(envShell);
    } else {
      // Priority 2: os.userInfo() which is more reliable on Unix
      const userShell = os.userInfo().shell;
      if (userShell) {
        shellName = path.basename(userShell);
      }
    }
  } catch {
    shellName = "unknown";
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
  if (!fs.existsSync(configPath)) return new Set<string>();

  const content = fs.readFileSync(configPath, "utf-8");
  return getSourcedDotfilesFromContent(content);
}

/**
 * Parses sourced dotfiles from the raw content of a shell config file.
 * Optimization: Uses a pre-compiled regex for better performance in batch operations.
 */
export function getSourcedDotfilesFromContent(content: string): Set<string> {
  const sourced = new Set<string>();
  
  // Reset lastIndex for global regex use across calls
  SOURCE_CAPTURE_PATTERN.lastIndex = 0;
  for (const match of content.matchAll(SOURCE_CAPTURE_PATTERN)) {
    const name = match[1];
    if (name && FILENAME_REGEX.test(name) && name !== "." && name !== "..") {
      sourced.add(name);
    }
  }

  return sourced;
}

export function addSource(configPath: string, dotfileName: string): void {
  assertSafeDotfileName(dotfileName);
  assertSafeConfigPath(configPath);

  // Hardening: Verify the managed dotfile exists and is a regular file (not a symlink) before sourcing it.
  // This prevents polluting shell configs with broken source lines or dangerous symlinks.
  const managedFilePath = path.join(os.homedir(), ".dotfiles-manager", dotfileName);
  if (!fs.existsSync(managedFilePath)) {
    throw new Error(`Managed dotfile not found: ${dotfileName}. Please seed it first.`);
  }

  try {
    const lstats = fs.lstatSync(managedFilePath);
    if (!lstats.isFile() || lstats.isSymbolicLink()) {
      throw new Error(
        `Managed dotfile is not a regular file or is a symbolic link: ${dotfileName}`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Managed dotfile not found")) {
      throw error;
    }
    throw new Error(
      `Could not access managed dotfile: ${dotfileName}`
    );
  }

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    fs.accessSync(configPath, fs.constants.W_OK);
  } catch {
    throw new Error(`Config file is not writable: ${configPath}`);
  }

  // Optimization: Read once and use the content to check if already sourced
  const content = fs.readFileSync(configPath, "utf-8");
  if (getSourcedDotfilesFromContent(content).has(dotfileName)) {
    throw new Error(`${dotfileName} is already sourced in ${configPath}`);
  }

  const needsLeadingNewline = content.length > 0 && !content.endsWith("\n");
  const sourceLine = `${needsLeadingNewline ? "\n" : ""}source "${MANAGED_DOTFILE_SOURCE_PATH}/${dotfileName}"\n`;
  const newContent = content + sourceLine;

  const stats = fs.statSync(configPath);
  atomicWriteFile(configPath, newContent, { mode: stats.mode });
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

  const stats = fs.statSync(configPath);
  atomicWriteFile(configPath, newContent, { mode: stats.mode });
}

function getManagedSourceLinePattern(
  dotfileName: string,
  options: { includeLineEnd?: boolean } = {}
): RegExp {
  const dotfilesPathPattern = `${getManagedSourcePathPattern()}\\/${escapeRegex(
    dotfileName
  )}`;
  const trailingContent = "(?:[\\t ]*(?:#.*)?)?";
  const lineEnd = options.includeLineEnd ? "(?:\\r?\\n|$)" : "$";

  return new RegExp(
    `^[ \\t]*(?:source|\\.)\\s+["']?${dotfilesPathPattern}["']?${trailingContent}${lineEnd}`,
    "gm"
  );
}

function assertSafeDotfileName(dotfileName: string): void {
  try {
    DotfileFilename.parse(dotfileName);
  } catch {
    throw new Error(`Invalid dotfile name: ${dotfileName}`);
  }
}

export function assertSafeConfigPath(configPath: string): void {
  const normalized = path.resolve(configPath);
  if (!SAFE_DOTFILE_SOURCE_PATHS.includes(normalized)) {
    throw new Error(`Invalid shell config path: ${configPath}`);
  }

  if (fs.existsSync(configPath)) {
    try {
      const stats = fs.statSync(configPath);
      if (!stats.isFile()) {
        throw new Error(`Shell config path is not a regular file: ${configPath}`);
      }
    } catch (error) {
      throw new Error(
        `Could not access shell config at ${configPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

export function assertSupportedShell(shell: ShellInfo): asserts shell is ShellInfo & { shell: "zsh" | "bash" | "fish" } {
  if (shell.shell === "unknown") {
    throw new Error("Your shell is not supported. Only zsh, bash, and fish are supported.");
  }
  if (!shell.configExists) {
    throw new Error(`Shell configuration file not found for ${shell.shell}. Please create it first.`);
  }
}

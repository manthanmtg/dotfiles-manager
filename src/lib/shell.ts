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

  const shell = (["zsh", "bash", "fish"].includes(shellName)
    ? shellName
    : "unknown") as ShellInfo["shell"];

  const configFile = SHELL_CONFIG_MAP[shell] || ".bashrc";
  const configPath = path.join(home, configFile);
  const configExists = fs.existsSync(configPath);

  return { shell, configPath, configExists };
}

export function isSourced(configPath: string, dotfileName: string): boolean {
  if (!fs.existsSync(configPath)) return false;

  const content = fs.readFileSync(configPath, "utf-8");
  const sourcePattern = new RegExp(
    `^\\s*source\\s+.*\\.dotfiles-manager/${escapeRegex(dotfileName)}\\s*$`,
    "m"
  );
  return sourcePattern.test(content);
}

export function addSource(configPath: string, dotfileName: string): void {
  const dotfilesDir = path.join(os.homedir(), ".dotfiles-manager");
  const sourceLine = `\nsource ${dotfilesDir}/${dotfileName}\n`;

  if (isSourced(configPath, dotfileName)) {
    throw new Error(`${dotfileName} is already sourced in ${configPath}`);
  }

  fs.appendFileSync(configPath, sourceLine, "utf-8");
}

export function removeSource(configPath: string, dotfileName: string): void {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, "utf-8");
  const sourcePattern = new RegExp(
    `\\n?\\s*source\\s+.*\\.dotfiles-manager/${escapeRegex(dotfileName)}\\s*\\n?`,
    "g"
  );

  const newContent = content.replace(sourcePattern, "\n");
  fs.writeFileSync(configPath, newContent, "utf-8");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

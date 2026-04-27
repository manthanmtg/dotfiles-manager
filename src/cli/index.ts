#!/usr/bin/env node
import { addSource, detectShell, isSourced, removeSource } from "../lib/shell";
import {
  applyVariables,
  getDotfile,
  listDotfiles,
  updateDotfileContent,
} from "../lib/dotfiles";
import { assertSupported } from "../lib/platform";
import { seedDotfiles } from "../lib/seed";
import {
  collectVariableValues,
  formatDotfileList,
  formatHelp,
  formatShell,
  parseCliArgs,
  parseSetFlags,
  success,
  warning,
} from "./core";

async function main(argv: string[]): Promise<number> {
  const parsed = parseCliArgs(argv);

  if (parsed.command === "help" || parsed.flags.help === true) {
    console.log(formatHelp());
    return 0;
  }

  assertSupported();

  switch (parsed.command) {
    case "seed": {
      const result = seedDotfiles();
      console.log(
        success(
          `Seeded ${result.seeded}, updated ${result.updated}, skipped ${result.skipped}.`
        )
      );
      return 0;
    }

    case "shell": {
      console.log(formatShell(detectShell()));
      return 0;
    }

    case "list": {
      const shell = detectShell();
      let dotfiles = listDotfiles(shell.configPath);
      if (parsed.flags.installed === true) {
        dotfiles = dotfiles.filter((dotfile) => dotfile.installed);
      }
      if (parsed.flags.available === true) {
        dotfiles = dotfiles.filter((dotfile) => !dotfile.installed);
      }
      console.log(formatDotfileList(dotfiles));
      return 0;
    }

    case "show": {
      const filename = requireFilename(parsed.positionals, "show");
      const shell = detectShell();
      const dotfile = getDotfile(filename, shell.configPath);
      if (!dotfile) {
        throw new Error(`Dotfile not found: ${filename}. Run dotfiles-manager seed first.`);
      }
      console.log(dotfile.content);
      return 0;
    }

    case "install": {
      const filename = requireFilename(parsed.positionals, "install");
      const shell = detectShell();
      const dotfile = getDotfile(filename, shell.configPath);
      if (!dotfile) {
        throw new Error(`Dotfile not found: ${filename}. Run dotfiles-manager seed first.`);
      }
      if (isSourced(shell.configPath, filename)) {
        console.log(warning(`${filename} is already installed in ${shell.configPath}.`));
        return 0;
      }

      const providedVariables = parseSetFlags(parsed.flags);
      const collected = collectVariableValues(dotfile.variables, providedVariables);
      if (!collected.ok) {
        throw new Error(collected.error);
      }

      if (Object.keys(collected.values).length > 0) {
        updateDotfileContent(filename, applyVariables(dotfile.content, collected.values));
      }

      addSource(shell.configPath, filename);
      console.log(
        success(`Installed ${dotfile.name}. Run source ${shell.configPath} to apply it.`)
      );
      return 0;
    }

    case "uninstall": {
      const filename = requireFilename(parsed.positionals, "uninstall");
      const shell = detectShell();
      const dotfile = getDotfile(filename, shell.configPath);
      if (!dotfile) {
        throw new Error(`Dotfile not found: ${filename}. Run dotfiles-manager seed first.`);
      }
      if (!isSourced(shell.configPath, filename)) {
        console.log(warning(`${filename} is not installed in ${shell.configPath}.`));
        return 0;
      }

      removeSource(shell.configPath, filename);
      console.log(
        success(`Uninstalled ${dotfile.name}. Run source ${shell.configPath} to apply it.`)
      );
      return 0;
    }

    default:
      throw new Error(`Unknown command "${parsed.command}". Run dotfiles-manager help.`);
  }
}

function requireFilename(positionals: string[], command: string): string {
  const filename = positionals[0];
  if (!filename) {
    throw new Error(`Usage: dotfiles-manager ${command} <filename>`);
  }
  return filename;
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });

import test from "node:test";
import assert from "node:assert/strict";
import {
  parseCliArgs,
  collectVariableValues,
  formatDotfileList,
} from "../src/cli/core";
import type { DotfileEntry } from "../src/lib/schemas";

test("parseCliArgs parses command, positional args, and repeated flags", () => {
  assert.deepEqual(
    parseCliArgs([
      "install",
      "git-aliases",
      "--set",
      "NAME=dev",
      "--set",
      "TOKEN=abc=123",
      "--verbose",
    ]),
    {
      command: "install",
      positionals: ["git-aliases"],
      flags: {
        set: ["NAME=dev", "TOKEN=abc=123"],
        verbose: true,
      },
    }
  );
});

test("parseCliArgs ignores a leading pnpm argument separator", () => {
  assert.deepEqual(parseCliArgs(["--", "list", "--available"]), {
    command: "list",
    positionals: [],
    flags: {
      available: true,
    },
  });
});

test("collectVariableValues requires missing required variables", () => {
  const result = collectVariableValues(
    [
      {
        name: "API_TOKEN",
        label: "API Token",
        required: true,
        sensitive: true,
      },
    ],
    new Map()
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Missing required variable API_TOKEN/);
  }
});

test("collectVariableValues uses defaults for optional variables", () => {
  const result = collectVariableValues(
    [
      {
        name: "EDITOR",
        label: "Editor",
        default: "nvim",
        required: false,
        sensitive: false,
      },
    ],
    new Map()
  );

  assert.deepEqual(result, { ok: true, values: { EDITOR: "nvim" } });
});

test("formatDotfileList groups dotfiles by category and marks installed entries", () => {
  const dotfiles: DotfileEntry[] = [
    {
      filename: "git-aliases",
      name: "Git Aliases",
      description: "Useful git aliases",
      category: "aliases",
      content: "alias gs='git status'",
      installed: true,
      variables: [],
      tags: ["git"],
    },
    {
      filename: "node-helpers",
      name: "Node Helpers",
      description: "Node utilities",
      category: "scripts",
      content: "node --version",
      installed: false,
      variables: [],
      tags: [],
    },
  ];

  const formatted = formatDotfileList(dotfiles);

  assert.match(formatted, /Aliases/);
  assert.match(formatted, /Scripts/);
  assert.match(formatted, /✓ git-aliases/);
  assert.match(formatted, /○ node-helpers/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { applyVariables } from "../src/lib/dotfiles";
import { assertSupportedShell } from "../src/lib/shell";

test("assertSupportedShell throws for unknown shell", () => {
  const shellInfo = { shell: "unknown" as const, configPath: "/tmp/.bashrc", configExists: true };
  assert.throws(() => assertSupportedShell(shellInfo), /Your shell is not supported/);
});

test("assertSupportedShell throws for missing config file", () => {
  const shellInfo = { shell: "zsh" as const, configPath: "/tmp/.zshrc-missing", configExists: false };
  assert.throws(() => assertSupportedShell(shellInfo), /Shell configuration file not found/);
});

test("assertSupportedShell passes for supported shell and existing config", () => {
  const shellInfo = { shell: "zsh" as const, configPath: "/tmp/.zshrc", configExists: true };
  assert.doesNotThrow(() => assertSupportedShell(shellInfo));
});

test("applyVariables correctly substitutes variables", () => {
  const content = "alias proj='cd {{PROJECTS_DIR}}'";
  const variables = { PROJECTS_DIR: "~/projects" };
  const result = applyVariables(content, variables);
  assert.strictEqual(result, "alias proj='cd ~/projects'");
});

test("applyVariables blocks shell metacharacters", () => {
  const content = "alias proj='cd {{PROJECTS_DIR}}'";
  
  const dangerousValues = [
    "~/projects; rm -rf /",
    "~/projects && rm -rf /",
    "~/projects || rm -rf /",
    "~/projects $(ls)",
    "~/projects `ls`",
    "~/projects > /dev/null",
    "~/projects < /etc/passwd",
    "~/projects | grep foo",
    "~/projects\\nrm -rf /",
    "~/projects (ls)",
    "~/projects )",
  ];

  for (const value of dangerousValues) {
    assert.throws(
      () => applyVariables(content, { PROJECTS_DIR: value }),
      /contains forbidden characters/
    );
  }
});

test("applyVariables blocks quotes to prevent breaking out of templates", () => {
  const content = "alias proj='cd {{PROJECTS_DIR}}'";
  
  assert.throws(
    () => applyVariables(content, { PROJECTS_DIR: "~/projects' && ls '" }),
    /forbidden characters/
  );

  assert.throws(
    () => applyVariables(content, { PROJECTS_DIR: '~/projects" && ls "' }),
    /forbidden characters/
  );
});

test("applyVariables allows safe characters", () => {
  const content = "alias proj='cd {{PROJECTS_DIR}}'";
  const safeValue = "~/My Projects-2024.v1_final";
  const result = applyVariables(content, { PROJECTS_DIR: safeValue });
  assert.strictEqual(result, `alias proj='cd ${safeValue}'`);
});

import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import { applyVariables } from "../src/lib/dotfiles";
import { assertSupportedShell, getSourcedDotfilesFromContent } from "../src/lib/shell";
import { parseDotfileSource, MetaParseError } from "../src/lib/parser";

test("getSourcedDotfilesFromContent detects tilde-based sources", () => {
  const content = `
# existing config
source ~/.dotfiles-manager/git-aliases
  source ~/.dotfiles-manager/docker-aliases # with comment
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 2);
  assert.ok(result.has("git-aliases"));
  assert.ok(result.has("docker-aliases"));
});

test("getSourcedDotfilesFromContent detects quoted sources", () => {
  const content = `
source "~/.dotfiles-manager/git-aliases"
source '~/.dotfiles-manager/docker-aliases' # with comment
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 2);
  assert.ok(result.has("git-aliases"));
  assert.ok(result.has("docker-aliases"));
});

test("getSourcedDotfilesFromContent detects $HOME-based sources", () => {
  const content = `
source $HOME/.dotfiles-manager/git-aliases
source "$HOME/.dotfiles-manager/docker-aliases"
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 2);
  assert.ok(result.has("git-aliases"));
  assert.ok(result.has("docker-aliases"));
});

test("getSourcedDotfilesFromContent detects full home path sources", () => {
  const home = os.homedir();
  const content = `
source ${home}/.dotfiles-manager/git-aliases
source ~/.dotfiles-manager/docker-aliases
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 2);
  assert.ok(result.has("git-aliases"));
  assert.ok(result.has("docker-aliases"));
});

test("getSourcedDotfilesFromContent detects ${HOME}-based sources", () => {
  const content = `
source \${HOME}/.dotfiles-manager/git-aliases
source "\${HOME}/.dotfiles-manager/docker-aliases"
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 2);
  assert.ok(result.has("git-aliases"));
  assert.ok(result.has("docker-aliases"));
});

test("getSourcedDotfilesFromContent detects '.' (source alias) sources", () => {
  const content = `
. ~/.dotfiles-manager/git-aliases
  . "$HOME/.dotfiles-manager/docker-aliases" # with comment
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 2);
  assert.ok(result.has("git-aliases"));
  assert.ok(result.has("docker-aliases"));
});

test("getSourcedDotfilesFromContent ignores malformed or unrelated sources", () => {
  const content = `
# not a managed source
source /etc/profile
# incomplete path
source ~/.dotfiles/other
# commented out source
# source ~/.dotfiles-manager/hidden
# not start of line
alias s="source ~/.dotfiles-manager/aliased"
`;
  const result = getSourcedDotfilesFromContent(content);
  assert.strictEqual(result.size, 0);
});

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
    "~/projects\nrm -rf /",
    "~/projects (ls)",
    "~/projects )",
    "~/projects # comment",
    "~/projects!",
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

test("Metadata Validation: allows leading whitespace before META_START", () => {
  const source = `
# @dotfiles-manager
# name: Test
# description: Test
# category: aliases
# @end
ls
`;
  const { metadata } = parseDotfileSource(source, "test.sh");
  assert.strictEqual(metadata.name, "Test");
});

test("Metadata Validation: fails for non-whitespace content before META_START", () => {
  const source = `echo "hi"
# @dotfiles-manager
# name: Test
# description: Test
# category: aliases
# @end
ls
`;
  assert.throws(() => parseDotfileSource(source, "test.sh"), (err) => {
    return err instanceof MetaParseError && err.errors[0].includes("Found non-whitespace content before");
  });
});

test("Metadata Validation: reports correct line numbers for duplicate tags", () => {
  const source = `# @dotfiles-manager
# name: Test
# description: Test
# category: aliases
# tags: tag1, tag1
# @end
ls
`;
  try {
    parseDotfileSource(source, "test.sh");
    assert.fail("Should have thrown MetaParseError");
  } catch (e) {
    if (e instanceof MetaParseError) {
      assert.ok(e.errors[0].includes("Line 5"), `Expected Line 5 in error message, got: ${e.errors[0]}`);
      assert.ok(e.errors[0].includes("tags must be unique"));
    } else {
      throw e;
    }
  }
});

test("Metadata Validation: fails for unknown icons", () => {
  const source = `# @dotfiles-manager
# name: Test
# description: Test
# category: aliases
# icon: InvalidIcon
# @end
ls
`;
  assert.throws(() => parseDotfileSource(source, "test.sh"), (err) => {
    return err instanceof MetaParseError && err.errors[0].includes("icon must be one of");
  });
});

test("Metadata Validation: fails for multiple meta markers", () => {
  const source = `# @dotfiles-manager
# name: Test
# description: Test
# category: aliases
# @end
# @dotfiles-manager
ls
`;
  assert.throws(() => parseDotfileSource(source, "test.sh"), (err) => {
    return err instanceof MetaParseError && err.errors[0].includes("Multiple \"# @dotfiles-manager\" markers found");
  });
});

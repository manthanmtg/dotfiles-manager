# Dotfiles Manager — Agent Guide

## Project Overview

Local-only Next.js web app for managing shell dotfiles stored at `~/.dotfiles-manager/`. Users install/uninstall configs by injecting `source` lines into their shell rc file (`.zshrc`, `.bashrc`, `.config/fish/config.fish`, etc.). No cloud, no remote, no Windows.

## Commands

- `pnpm dev` — start dev server on port 3000
- `pnpm build` — validates all dotfiles, then production build
- `pnpm start` — start production server
- `pnpm lint` — run ESLint
- `pnpm validate` — check all `.sh` files in `dotfiles/` have valid meta comments
- `pnpm test` — run the TypeScript test suite in `tests/**/*.test.ts`
- `pnpm cli [cmd]` — run CLI (e.g. `pnpm cli help`, `pnpm cli seed`, `pnpm cli list`)
- `lsof -ti :3000 | xargs kill -9` — kill process on port 3000

## Architecture

```
bin/
└── dotfiles-manager.mjs   # Global CLI wrapper (pnpm link --global .)

dotfiles/                   # Self-describing .sh files (category-aligned)
├── aliases/
│   ├── docker-aliases.sh
│   ├── edit-aliases.sh
│   ├── git-aliases.sh
│   ├── kubectl-aliases.sh
│   └── nav-aliases.sh
├── scripts/
│   ├── port-utils.sh
│   └── node-helpers.sh
├── prompts/
│   └── git-prompt.sh
├── security/
│   ├── ssh-agent-setup.sh
│   └── safety-nets.sh
├── environment/
│   └── env-defaults.sh
└── functions/
    ├── extract-function.sh
    └── mkcd-function.sh

issues_to_look/             # Notes on non-actionable issues or no-op runs
├── YYYY-MM-DD_short-slug.md
└── resolved/

├── prompts/                # Autonomous improvement prompts
│   ├── random_selector.md  # Orchestrates autonomous runs
│   ├── prompts_metadata.json # Observability and usage counters
│   └── ...                 # Individual task prompts
├── scripts/
└── validate.ts             # Runs pnpm validate — checks all .sh meta blocks
```
src/
├── cli/                   # CLI entrypoint modules
│   ├── index.ts           # CLI entrypoint and command router
│   └── core.ts            # Shared logic for CLI commands
├── app/
│   ├── api/
│   │   ├── dotfiles/       # GET  — list all dotfiles; POST — create new
│   │   ├── install/        # POST — inject source line into shell config
│   │   ├── seed/           # POST — scan dotfiles/, seed into ~/.dotfiles-manager/
│   │   ├── shell/          # GET  — detect user shell + config path
│   │   └── uninstall/      # POST — remove source line from shell config
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx          # Root layout (Geist fonts, dark theme)
│   └── page.tsx            # Main client page (all UI state lives here)
├── components/             # All "use client" React components
├── hooks/
│   ├── useDotfiles.ts      # Central data-fetching hook (fetch, install, uninstall)
│   ├── useDotfileActions.ts # Shared action hook for install/uninstall operations
│   ├── useDotfileView.ts    # Memoized filter/search helpers for list and category views
│   ├── useDotfileStats.ts   # Memoized stats for categories and installation status
│   └── useTrapFocus.ts     # A11y hook for modal focus trapping
├── context/
│   └── TerminalContext.tsx # Terminal event stream utilities via React Context

├── lib/                    # Shared and server-only utilities
│   ├── api.ts              # Robust fetchApi wrapper with Zod validation (Shared)
│   ├── schemas.ts          # Zod v4 schemas for all data types + API payloads (Shared)
│   ├── parser.ts           # Parses meta comment blocks from .sh files
│   ├── scanner.ts          # Recursively discovers all .sh files in dotfiles/
│   ├── shell.ts            # Shell detection, source line add/remove (strict regex)
│   ├── dotfiles.ts         # CRUD for ~/.dotfiles-manager/ files + .meta.json
│   ├── platform.ts         # macOS/Linux guard (rejects win32)
│   ├── errors.ts           # Centralized API error mapping and responses
│   └── seed.ts             # Orchestrates scanner → createDotfile for seeding
├── types/
│   └── index.ts            # Shared TypeScript types + CATEGORY_META constant
└── tests/                  # TypeScript test suite
    ├── cli.test.ts         # CLI command and argument parsing tests
    └── lib.test.ts         # Parser, scanner, and shell logic tests
```

## Meta Comment Spec

Every `.sh` file in `dotfiles/` must have a meta block at the top. The scanner auto-discovers files and the parser extracts metadata — no registry file needed.

### Format

```sh
# @dotfiles-manager
# name: Human-Readable Name
# description: One-line description of what this dotfile does.
# category: aliases
# icon: GitBranch
# tags: git, productivity
# @end

# ... actual shell content below ...
```

### Required fields

| Field         | Description                                                         |
|---------------|---------------------------------------------------------------------|
| `name`        | Display name shown in the UI                                        |
| `description` | One-line summary                                                    |
| `category`    | One of: `aliases`, `scripts`, `prompts`, `security`, `environment`, `functions` |

### Optional fields

| Field      | Description                                                        |
|------------|--------------------------------------------------------------------|
| `icon`     | Lucide icon name (e.g. `GitBranch`, `Shield`, `Terminal`)          |
| `tags`     | Comma-separated tags for search/filtering                          |
| `variable` | Declares a user-configurable variable (can appear multiple times)  |

### Variable syntax

```
# variable: VAR_NAME | Label | Description | default_value | required | sensitive
```

- `VAR_NAME` — placeholder name used as `{{VAR_NAME}}` in the shell content
- `Label` — human-readable label shown in the UI modal
- `Description` — (optional) help text
- `default_value` — (optional) pre-filled default
- `required` or `optional` — (optional, defaults to `required`)
- `sensitive` — (optional) marks the field as a password input

Example:

```sh
# variable: SSH_KEY_PATH | SSH Key Path | Path to your private key | ~/.ssh/id_ed25519 | required
# variable: API_TOKEN | API Token | Your personal access token | | required | sensitive
```

### Validation

- `pnpm validate` checks every `.sh` file under `dotfiles/` for a valid meta block
- `pnpm build` runs validation automatically before compiling
- Missing or malformed meta blocks fail with clear line-level error messages

## Adding a New Dotfile

1. Create `dotfiles/<category>/my-thing.sh` (where `<category>` matches the meta block)
2. Add the meta block at the top (see format above)
3. Write your shell content below `# @end`
4. Run `pnpm validate` — it will tell you if anything is wrong
5. Restart the app or hit the seed endpoint — the new file is auto-discovered

The filename (minus `.sh`) becomes the identifier used in `~/.dotfiles-manager/` and in shell config source lines. **Subdirectories under `dotfiles/` are mandatory and must match the `category` field in the meta block.** The scanner reads all `.sh` files recursively, but `pnpm validate` enforces this directory alignment to prevent confusion.


## Key Conventions

- **pnpm only** — never use npm or yarn.
- **Zod v4** — import from `zod/v4`. All API payloads and form inputs must be validated with Zod schemas defined in `src/lib/schemas.ts`.
- **Shared vs Server logic** — Most logic in `src/lib/` is server-only (uses Node.js `fs`, `path`, `os`, `child_process`) and must NOT be imported in client components. Exceptions: `src/lib/api.ts` and `src/lib/schemas.ts` are shared and safe for client components.
- **Client components in `src/components/`** — must have `"use client"` directive. Use Framer Motion for animations, Lucide React for icons.
- **Tailwind CSS v4** — uses `@theme inline` for CSS variables. Dark mode only (zinc base, neon accents: cyan, emerald, purple, rose, amber, sky).
- **No `app/api/[dynamic]` routes** — each operation has its own route file for clarity.
- **Dotfile runtime storage** — each dotfile is stored in `~/.dotfiles-manager/` as a pair: `<filename>` (content) + `<filename>.meta.json` (metadata).
- **Install = append** `source ~/.dotfiles-manager/<filename>` to shell config. **Uninstall = regex removal** of that exact line.
- **Variable substitution** — dotfile content uses `{{VAR_NAME}}` placeholders. Variables are defined in the meta comment and prompted via modal before install.

## Safety Rules

- Never write to the user's shell config file outside of the `addSource` / `removeSource` functions in `src/lib/shell.ts`.
- The regex in `removeSource` must only match the exact `source ~/.dotfiles-manager/<filename>` pattern — never broader.
- Always check `isSourced()` before installing to prevent duplicate source lines.
- Verify the managed dotfile exists and is a regular file (not a symlink) before appending its `source` line.
- Platform check (`assertSupported()`) must run at the top of every API route.

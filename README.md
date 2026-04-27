# Dotfiles Manager

A locally-hosted Next.js web application and CLI for managing, discovering, and installing shell configurations (dotfiles).

## Features

- **Shell Detection** — Automatically detects your default shell (zsh, bash, fish) and its config file
- **One-Click Install/Uninstall** — Install dotfiles into your shell config with a single click
- **Duplicate Prevention** — Parses your shell config to detect already-installed dotfiles
- **Variable Prompts** — Dotfiles with configurable variables prompt you via a rich modal before installation
- **Live Terminal Console** — Real-time simulated terminal showing step-by-step installation progress
- **Category Organization** — Dotfiles grouped by type: Aliases, Scripts, Prompts, Security, Environment, Functions
- **Code Preview** — Syntax-highlighted preview of any dotfile before installing
- **CLI Fallback** — Manage the same local dotfiles from your terminal when the web UI is not available
- **13 Built-in Configs** — Ships with curated dotfiles for Git, Docker, Kubernetes, Node.js, and more

## Requirements

- **macOS or Linux** (Windows is not supported)
- **Node.js** >= 18
- **pnpm** (required package manager)

## Getting Started

### Web App

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To stop the dev server, press `Ctrl+C` in the terminal. If the port is still in use:

```bash
lsof -ti :3000 | xargs kill -9
```

### CLI

The CLI uses the same `~/.dotfiles-manager/` storage directory and the same shell config safety checks as the web app.

Run it from the repository:

```bash
pnpm cli -- help
pnpm cli -- seed
pnpm cli -- list
pnpm cli -- install git-aliases
```

Install the command globally from this local checkout:

```bash
pnpm install
# Restart your shell, then return to this repository.
pnpm link --global .
dotfiles-manager help
```

`pnpm link --global .` installs a global `dotfiles-manager` command from this
checkout.

Useful commands:

```bash
dotfiles-manager shell
dotfiles-manager seed
dotfiles-manager list --available
dotfiles-manager show git-aliases
dotfiles-manager install git-aliases
dotfiles-manager uninstall git-aliases
```

Dotfiles with variables require explicit `--set NAME=value` arguments:

```bash
dotfiles-manager install ssh-agent-setup --set SSH_KEY_PATH=~/.ssh/id_ed25519
```

If the web app is not available, use the CLI as the primary workflow:

1. Run `dotfiles-manager seed` to copy bundled dotfiles into `~/.dotfiles-manager/`
2. Run `dotfiles-manager list` to find the filename you want
3. Run `dotfiles-manager install <filename>` to append the managed `source` line
4. Run `source ~/.zshrc`, `source ~/.bashrc`, or restart your shell to apply changes

## How It Works

1. On first launch, seed dotfiles are created in `~/.dotfiles-manager/`
2. Each dotfile has a content file and a `.meta.json` metadata file
3. Installing a dotfile appends `source ~/.dotfiles-manager/<filename>` to your shell config (e.g. `~/.zshrc`)
4. Uninstalling removes only the relevant source line — no other config is touched

## Tech Stack

- **Next.js 16** with App Router and API Routes
- **Tailwind CSS v4** with custom dark theme
- **Framer Motion** for animations
- **Lucide React** for iconography
- **Zod v4** for schema validation
- **pnpm** for dependency management

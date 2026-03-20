# Dotfiles Manager

A locally-hosted Next.js web application for managing, discovering, and installing shell configurations (dotfiles) through a premium terminal-inspired UI.

## Features

- **Shell Detection** — Automatically detects your default shell (zsh, bash, fish) and its config file
- **One-Click Install/Uninstall** — Install dotfiles into your shell config with a single click
- **Duplicate Prevention** — Parses your shell config to detect already-installed dotfiles
- **Variable Prompts** — Dotfiles with configurable variables prompt you via a rich modal before installation
- **Live Terminal Console** — Real-time simulated terminal showing step-by-step installation progress
- **Category Organization** — Dotfiles grouped by type: Aliases, Scripts, Prompts, Security, Environment, Functions
- **Code Preview** — Syntax-highlighted preview of any dotfile before installing
- **12 Built-in Configs** — Ships with curated dotfiles for Git, Docker, Kubernetes, Node.js, and more

## Requirements

- **macOS or Linux** (Windows is not supported)
- **Node.js** >= 18
- **pnpm** (required package manager)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To stop the dev server, press `Ctrl+C` in the terminal. If the port is still in use:

```bash
lsof -ti :3000 | xargs kill -9
```

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

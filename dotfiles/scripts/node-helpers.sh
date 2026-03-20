# @dotfiles-manager
# name: Node.js Helpers
# description: Aliases and functions for Node.js development — nvm auto-switching, npm shortcuts, and project scaffolding.
# category: scripts
# icon: Braces
# tags: nodejs, npm, development
# @end

alias ni='npm install'
alias nid='npm install --save-dev'
alias nr='npm run'
alias nrd='npm run dev'
alias nrb='npm run build'
alias nrt='npm run test'
alias nrc='npm run clean'
alias pni='pnpm install'
alias pnr='pnpm run'
alias pnd='pnpm dev'
alias pnb='pnpm build'

# Quick package.json scripts viewer
scripts() {
  if [ -f package.json ]; then
    cat package.json | grep -A 100 '"scripts"' | grep -B 100 '}' | head -n -1
  else
    echo "No package.json found"
  fi
}

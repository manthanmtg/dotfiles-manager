# @dotfiles-manager
# name: Navigation Aliases
# description: Quick directory navigation aliases and listing enhancements. Prefers eza or exa for rich, colorized listings if available.
# category: aliases
# icon: FolderOpen
# tags: navigation, filesystem, productivity, eza, exa
# variable: PROJECTS_DIR | Projects Directory | Path to your projects folder | ~/projects | required
# variable: DOWNLOADS_DIR | Downloads Directory | Path to your downloads folder | ~/Downloads | required
# variable: DESKTOP_DIR | Desktop Directory | Path to your desktop folder | ~/Desktop | required
# @end

# --- Basic Navigation ---
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~'
alias -- -='cd -'

# --- Better Listing ---
# Checks for eza (modern ls replacement) or exa (original eza predecessor)
if command -v eza >/dev/null 2>&1; then
  alias l='eza --icons'
  alias ll='eza -lh --icons --git'
  alias la='eza -a --icons'
  alias lt='eza --tree --level=2 --icons'
elif command -v exa >/dev/null 2>&1; then
  alias l='exa --icons'
  alias ll='exa -lh --icons --git'
  alias la='exa -a --icons'
  alias lt='exa --tree --level=2 --icons'
else
  alias l='ls -CF'
  alias ll='ls -lah'
  alias la='ls -A'
fi

# --- Quick Directory Access ---
alias proj='cd {{PROJECTS_DIR}}'
alias dl='cd {{DOWNLOADS_DIR}}'
alias dt='cd {{DESKTOP_DIR}}'

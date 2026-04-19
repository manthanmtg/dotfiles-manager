# @dotfiles-manager
# name: Dotfile Quick Access
# description: Instant shortcuts to open, reload, and view common shell, editor, terminal, and dev config files.
# category: aliases
# icon: FileEdit
# tags: editor, config, productivity, dotfiles
# @end

# ============================================================================
#  QUICK EDIT — open config files in $EDITOR (defaults to vim)
# ============================================================================

# --- Shell configs ---
alias ezsh='${EDITOR:-vim} ~/.zshrc'
alias ezshenv='${EDITOR:-vim} ~/.zshenv'
alias ezprof='${EDITOR:-vim} ~/.zprofile'
alias ezlogin='${EDITOR:-vim} ~/.zlogin'
alias ezlogout='${EDITOR:-vim} ~/.zlogout'
alias ebash='${EDITOR:-vim} ~/.bashrc'
alias ebprof='${EDITOR:-vim} ~/.bash_profile'
alias eprofile='${EDITOR:-vim} ~/.profile'
alias einputrc='${EDITOR:-vim} ~/.inputrc'

# --- Editor configs ---
alias evim='${EDITOR:-vim} ~/.vimrc'
alias envim='${EDITOR:-vim} ~/.config/nvim/init.lua'
alias envimdir='${EDITOR:-vim} ~/.config/nvim/'
alias eemacs='${EDITOR:-vim} ~/.emacs.d/init.el'
alias ecode='${EDITOR:-vim} ~/Library/Application\ Support/Code/User/settings.json'
alias ekeybinds='${EDITOR:-vim} ~/Library/Application\ Support/Code/User/keybindings.json'

# --- Terminal emulator configs ---
alias ealac='${EDITOR:-vim} ~/.config/alacritty/alacritty.toml'
alias ekitty='${EDITOR:-vim} ~/.config/kitty/kitty.conf'
alias ewez='${EDITOR:-vim} ~/.config/wezterm/wezterm.lua'

# --- Prompt configs ---
alias estarship='${EDITOR:-vim} ~/.config/starship.toml'
alias ep10k='${EDITOR:-vim} ~/.p10k.zsh'

# --- Multiplexer configs ---
alias etmux='${EDITOR:-vim} ~/.tmux.conf'
alias escreen='${EDITOR:-vim} ~/.screenrc'

# --- Git configs ---
alias egit='${EDITOR:-vim} ~/.gitconfig'
alias egitign='${EDITOR:-vim} ~/.gitignore_global'
alias egitmsg='${EDITOR:-vim} ~/.gitmessage'

# --- SSH / GPG ---
alias essh='${EDITOR:-vim} ~/.ssh/config'
alias esshkeys='${EDITOR:-vim} ~/.ssh/authorized_keys'
alias esshknown='${EDITOR:-vim} ~/.ssh/known_hosts'
alias egpg='${EDITOR:-vim} ~/.gnupg/gpg.conf'
alias egpgagent='${EDITOR:-vim} ~/.gnupg/gpg-agent.conf'

# --- Package managers / runtimes ---
alias ebrew='${EDITOR:-vim} ~/.Brewfile'
alias enpmrc='${EDITOR:-vim} ~/.npmrc'
alias eyarnrc='${EDITOR:-vim} ~/.yarnrc.yml'
alias epipconf='${EDITOR:-vim} ~/.pip/pip.conf'
alias egemrc='${EDITOR:-vim} ~/.gemrc'
alias ecargo='${EDITOR:-vim} ~/.cargo/config.toml'

# --- Dev tool configs (project-level) ---
alias eeslint='${EDITOR:-vim} .eslintrc*'
alias eprettier='${EDITOR:-vim} .prettierrc*'
alias etsconfig='${EDITOR:-vim} tsconfig.json'
alias epackage='${EDITOR:-vim} package.json'
alias emakefile='${EDITOR:-vim} Makefile'
alias edockerfile='${EDITOR:-vim} Dockerfile'
alias edcompose='${EDITOR:-vim} docker-compose.yml'
alias eenvfile='${EDITOR:-vim} .env'
alias eenvlocal='${EDITOR:-vim} .env.local'
alias egitlocign='${EDITOR:-vim} .gitignore'
alias ereadme='${EDITOR:-vim} README.md'

# --- System files (macOS / Linux) ---
alias ehosts='sudo ${EDITOR:-vim} /etc/hosts'
alias eresolvconf='sudo ${EDITOR:-vim} /etc/resolv.conf'
alias efstab='sudo ${EDITOR:-vim} /etc/fstab'
alias ecrontab='crontab -e'

# --- Misc tool configs ---
alias ewget='${EDITOR:-vim} ~/.wgetrc'
alias ecurl='${EDITOR:-vim} ~/.curlrc'
alias ehtop='${EDITOR:-vim} ~/.config/htop/htoprc'
alias eaws='${EDITOR:-vim} ~/.aws/config'
alias eawscreds='${EDITOR:-vim} ~/.aws/credentials'
alias ekube='${EDITOR:-vim} ~/.kube/config'
alias elazygit='${EDITOR:-vim} ~/.config/lazygit/config.yml'
alias elazydocker='${EDITOR:-vim} ~/.config/lazydocker/config.yml'
alias eripgrep='${EDITOR:-vim} ~/.ripgreprc'
alias efd='${EDITOR:-vim} ~/.config/fd/ignore'
alias ebat='${EDITOR:-vim} ~/.config/bat/config'

# ============================================================================
#  QUICK RELOAD — re-source shell configs without restarting
# ============================================================================

alias reload-zsh='source ~/.zshrc'
alias reload-bash='source ~/.bashrc'
alias reload-profile='source ~/.profile'
alias reload-env='source ~/.zshenv'
alias reload-tmux='tmux source-file ~/.tmux.conf'

# ============================================================================
#  QUICK VIEW — cat / less common config files
# ============================================================================

alias viewzsh='cat ~/.zshrc'
alias viewbash='cat ~/.bashrc'
alias viewgit='cat ~/.gitconfig'
alias viewssh='cat ~/.ssh/config'
alias viewhosts='cat /etc/hosts'
alias viewkube='cat ~/.kube/config'
alias viewaws='cat ~/.aws/config'
alias viewenv='cat .env 2>/dev/null || echo "No .env in current directory"'
alias viewpath='echo "$PATH" | tr ":" "\n"'
alias viewfpath='echo "$FPATH" | tr ":" "\n"'
alias viewaliases='alias | sort'

# ============================================================================
#  QUICK BACKUP — snapshot a config before editing
# ============================================================================

backup-config() {
  local file="$1"
  [ -z "$file" ] && { echo "Usage: backup-config <file>"; return 1; }
  [ ! -f "$file" ] && { echo "File not found: $file"; return 1; }
  cp "$file" "${file}.bak.$(date +%Y%m%d-%H%M%S)"
  echo "Backed up to ${file}.bak.$(date +%Y%m%d-%H%M%S)"
}

alias bkzsh='backup-config ~/.zshrc'
alias bkgit='backup-config ~/.gitconfig'
alias bkssh='backup-config ~/.ssh/config'
alias bktmux='backup-config ~/.tmux.conf'

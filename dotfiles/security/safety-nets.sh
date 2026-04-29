# @dotfiles-manager
# name: Safety Nets
# description: Protective aliases that add confirmation prompts to destructive commands like rm, mv, and cp.
# category: security
# icon: ShieldAlert
# tags: safety, protection, best-practices
# @end

alias rm='rm -i'
alias mv='mv -i'
alias cp='cp -i'
alias ln='ln -i'

# Preserve root for dangerous filesystem mutations when available
__dnet_has_preserve_root() {
  command "$1" --help 2>/dev/null | grep -q -- '--preserve-root'
}

__dnet_preserve_root() {
  local cmd="$1"
  shift
  if __dnet_has_preserve_root "$cmd"; then
    command "$cmd" --preserve-root "$@"
  else
    command "$cmd" "$@"
  fi
}

chown() {
  __dnet_preserve_root chown "$@"
}

chmod() {
  __dnet_preserve_root chmod "$@"
}

chgrp() {
  __dnet_preserve_root chgrp "$@"
}

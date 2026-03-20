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

# Prevent accidental root operations
alias chown='chown --preserve-root'
alias chmod='chmod --preserve-root'
alias chgrp='chgrp --preserve-root'

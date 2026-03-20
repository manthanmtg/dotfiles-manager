# @dotfiles-manager
# name: Navigation Aliases
# description: Quick directory navigation aliases and listing enhancements using ls/eza.
# category: aliases
# icon: FolderOpen
# tags: navigation, filesystem, productivity
# @end

alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~'
alias -- -='cd -'

# Better listing
alias ll='ls -lah'
alias la='ls -A'
alias l='ls -CF'

# Quick project dirs
alias proj='cd ~/projects'
alias dl='cd ~/Downloads'
alias dt='cd ~/Desktop'

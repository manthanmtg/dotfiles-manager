# @dotfiles-manager
# name: Git-Aware Prompt
# description: A colorful PS1 prompt that shows the current directory and Git branch with status indicators.
# category: prompts
# icon: Terminal
# tags: prompt, git, customization
# @end

parse_git_branch() {
  git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

parse_git_dirty() {
  [[ $(git status --porcelain 2>/dev/null) ]] && echo "*"
}

if [ -n "$ZSH_VERSION" ]; then
  setopt PROMPT_SUBST
  PROMPT='%F{cyan}%~%f%F{magenta}$(parse_git_branch)%f%F{yellow}$(parse_git_dirty)%f %F{green}❯%f '
elif [ -n "$BASH_VERSION" ]; then
  PS1='\[\033[36m\]\w\[\033[35m\]$(parse_git_branch)\[\033[33m\]$(parse_git_dirty)\[\033[32m\] ❯ \[\033[0m\]'
fi

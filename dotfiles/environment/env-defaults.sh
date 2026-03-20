# @dotfiles-manager
# name: Environment Defaults
# description: Sensible environment variable defaults for EDITOR, LANG, PATH extensions, and history behavior.
# category: environment
# icon: Settings
# tags: environment, defaults, configuration
# variable: EDITOR_CMD | Preferred Editor | Your preferred terminal text editor | vim | optional
# @end

export EDITOR="{{EDITOR_CMD}}"
export VISUAL="$EDITOR"
export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

# History
export HISTSIZE=10000
export SAVEHIST=10000
export HISTCONTROL=ignoredups:erasedups

# Path additions
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/bin:$PATH"

# @dotfiles-manager
# name: Make & Enter Directory
# description: Combines mkdir and cd — create a directory and immediately cd into it in a single command.
# category: functions
# icon: FolderPlus
# tags: utility, navigation, productivity
# @end

mkcd() {
  mkdir -p "$1" && cd "$1"
}

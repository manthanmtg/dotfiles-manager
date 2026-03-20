# @dotfiles-manager
# name: Port Utilities
# description: Quick functions to find processes listening on a port and kill them — invaluable for dev server conflicts.
# category: scripts
# icon: Network
# tags: network, debugging, development
# @end

# Find process on a port
listening() {
  if [ -z "$1" ]; then
    echo "Usage: listening <port>"
    return 1
  fi
  lsof -i :"$1"
}

# Kill process on a port
killport() {
  if [ -z "$1" ]; then
    echo "Usage: killport <port>"
    return 1
  fi
  lsof -ti :"$1" | xargs kill -9 2>/dev/null && echo "Killed process on port $1" || echo "No process found on port $1"
}

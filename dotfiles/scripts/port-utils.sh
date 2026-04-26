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

  if ! echo "$1" | grep -Eq '^[0-9]+$'; then
    echo "killport expects a numeric port"
    return 1
  fi

  local pids
  pids="$(lsof -ti :"$1" 2>/dev/null)"

  if [ -z "$pids" ]; then
    echo "No process found on port $1"
    return 0
  fi

  kill -9 $pids
  echo "Killed process(es) on port $1: $pids"
}

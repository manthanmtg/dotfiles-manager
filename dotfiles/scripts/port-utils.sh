# @dotfiles-manager
# name: Port Utilities
# description: Lightweight helpers to inspect port usage and terminate local processes by port without opening apps.
# category: scripts
# icon: Network
# tags: network, debugging, processes, development
# @end

# Find process on a port
listening() {
  if [ -z "$1" ]; then
    echo "Usage: listening <port>"
    return 1
  fi

  if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof is required for listening()"
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

  if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof is required for killport()"
    return 1
  fi

  local pids
  pids="$(lsof -ti :"$1" 2>/dev/null)"

  if [ -z "$pids" ]; then
    echo "No process found on port $1"
    return 0
  fi

  printf '%s\n' "$pids" | xargs kill -9
  echo "Killed process(es) on port $1: $pids"
}

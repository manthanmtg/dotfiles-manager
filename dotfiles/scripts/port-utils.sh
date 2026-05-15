# @dotfiles-manager
# name: Port Utilities
# description: Lightweight helpers to inspect port usage and terminate local processes by port. Uses lsof for detection.
# category: scripts
# icon: Network
# tags: network, debugging, processes, development, lsof
# variable: DEFAULT_KILL_SIGNAL | Default Kill Signal | Signal to use for killport (e.g., 15 for SIGTERM, 9 for SIGKILL) | 15 | optional
# @end

# Find process on a port
listening() {
  if [ -z "$1" ]; then
    echo "Usage: listening <port>"
    return 1
  fi

  if ! echo "$1" | grep -Eq '^[0-9]+$'; then
    echo "listening expects a numeric port"
    return 1
  fi

  if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof is required for listening()"
    return 1
  fi

  # -n: suppresses the conversion of network numbers to host names.
  # -P: suppresses the conversion of port numbers to port names.
  lsof -nP -i :"$1"
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

  local signal="{{DEFAULT_KILL_SIGNAL}}"
  while IFS= read -r pid; do
    kill -"$signal" -- "$pid"
  done <<< "$pids"
  echo "Sent signal $signal to process(es) on port $1: $pids"
}

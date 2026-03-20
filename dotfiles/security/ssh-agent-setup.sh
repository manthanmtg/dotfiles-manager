# @dotfiles-manager
# name: SSH Agent Auto-Start
# description: Automatically starts ssh-agent on shell login and adds your default key for seamless Git and SSH operations.
# category: security
# icon: Shield
# tags: ssh, security, authentication
# variable: SSH_KEY_PATH | SSH Key Path | Path to the SSH private key to auto-add | ~/.ssh/id_ed25519 | required
# @end

if [ -z "$SSH_AUTH_SOCK" ]; then
  eval "$(ssh-agent -s)" > /dev/null 2>&1
  ssh-add {{SSH_KEY_PATH}} 2>/dev/null
fi

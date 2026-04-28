# @dotfiles-manager
# name: Docker Aliases
# description: Quick Docker and docker compose shortcuts for container, image, and volume workflows.
# category: aliases
# icon: Box
# tags: docker, containers, devops, compose, maintenance
# @end

alias d='docker'
alias dc='docker compose'
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias drm='docker rm'
alias drmi='docker rmi'
alias dex='docker exec -it'
alias dvol='docker volume ls'
alias dprune='docker system prune -af'

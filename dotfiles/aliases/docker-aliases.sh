# @dotfiles-manager
# name: Docker Aliases
# description: Quick Docker and docker compose shortcuts for container, image, and volume workflows.
# category: aliases
# icon: Box
# tags: docker, containers, devops, compose, maintenance, productivity
# @end

# --- Docker ---
alias d='docker'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias drm='docker rm'
alias drmi='docker rmi'
alias dex='docker exec -it'
alias dstart='docker start'
alias dstop='docker stop'
alias drestart='docker restart'
alias dstats='docker stats'
alias dinspect='docker inspect'
alias db='docker build'
alias dvol='docker volume ls'
alias dprune='docker system prune -af'

# --- Docker Compose ---
alias dc='docker compose'
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dcr='docker compose restart'
alias dcb='docker compose build'
alias dcpull='docker compose pull'
alias dcps='docker compose ps'

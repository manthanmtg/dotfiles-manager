# @dotfiles-manager
# name: Kubectl Aliases
# description: Time-saving Kubernetes aliases for pods, deployments, services, and logs.
# category: aliases
# icon: Container
# tags: kubernetes, devops, cloud
# @end

alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deployments'
alias kgn='kubectl get nodes'
alias kdp='kubectl describe pod'
alias kds='kubectl describe svc'
alias kdd='kubectl describe deployment'
alias kl='kubectl logs'
alias klf='kubectl logs -f'
alias kex='kubectl exec -it'
alias kaf='kubectl apply -f'
alias kdf='kubectl delete -f'
alias kns='kubectl config set-context --current --namespace'
alias kcgc='kubectl config get-contexts'
alias kcuc='kubectl config use-context'

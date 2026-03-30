# @dotfiles-manager
# name: Git Aliases
# description: Comprehensive Git aliases for faster workflow — covers status, branching, logging, and more.
# category: aliases
# icon: GitBranch
# tags: git, productivity
# @end

# ============================================================================
#  SHORT ALIASES — one- and two-letter shortcuts for frequent git commands
# ============================================================================

# --- git add ---
alias ga='git add'
alias gaa='git add --all'
alias gap='git add --patch'
alias gau='git add --update'

# --- git branch ---
alias gb='git branch'
alias gbm='git branch --merged'
alias gbnm='git branch --no-merged'
alias gbed='git branch --edit-description'
alias gbv='git branch -v'
alias gbvv='git branch -vv'

# --- git commit ---
alias gc='git commit'
alias gca='git commit --amend'
alias gcam='git commit --amend --message'
alias gcane='git commit --amend --no-edit'
alias gcaa='git commit --amend --all'
alias gcaam='git commit --amend --all --message'
alias gcaane='git commit --amend --all --no-edit'
alias gci='git commit --interactive'
alias gcm='git commit --message'

# --- git checkout ---
alias gco='git checkout'
alias gcog='git checkout --guess'
alias gcong='git checkout --no-guess'
alias gcob='git checkout -b'

# --- git cherry-pick ---
alias gcp='git cherry-pick'
alias gcpa='git cherry-pick --abort'
alias gcpc='git cherry-pick --continue'
alias gcpn='git cherry-pick -n'
alias gcpnx='git cherry-pick -n -x'

# --- git diff ---
alias gd='git diff'
alias gdd='git diff --stat --summary --patch'
alias gdc='git diff --cached'
alias gds='git diff --staged'
alias gdwd='git diff --word-diff'
alias gdstat='git diff --stat'

# --- git fetch ---
alias gf='git fetch'
alias gfa='git fetch --all'
alias gfav='git fetch --all --verbose'
alias gfap='git fetch --all --prune'

# --- git grep ---
alias gg='git grep'
alias ggg='git grep --break --heading --line-number'
alias ggn='git grep -n'

# --- git log ---
alias gl='git log'
alias gll='git log --oneline --graph --decorate -20'
alias glll='git log --graph --decorate --stat --summary'
alias gla='git log --oneline --graph --decorate --all'
alias glg='git log --graph'
alias glo='git log --oneline'
alias glor='git log --oneline --reverse'
alias glp='git log --patch'
alias glfp='git log --first-parent'
alias glto='git log --topo-order'

# --- git ls-files ---
alias gls='git ls-files'
alias glsd='git ls-files --debug'
alias glsfn='git ls-files --full-name'
alias glsio='git ls-files --ignored --others --exclude-standard'

# --- git merge ---
alias gm='git merge'
alias gma='git merge --abort'
alias gmc='git merge --continue'
alias gmncnf='git merge --no-commit --no-ff'

# --- git pull ---
alias gpl='git pull'
alias gpf='git pull --ff-only'
alias gpr='git pull --rebase'
alias gprp='git pull --rebase=preserve'

# --- git push ---
alias gp='git push'
alias gpushy='git push --force-with-lease'

# --- git rebase ---
alias grb='git rebase'
alias grba='git rebase --abort'
alias grbc='git rebase --continue'
alias grbs='git rebase --skip'
alias grbi='git rebase --interactive'
alias grbiu='git rebase --interactive @{upstream}'

# --- git reflog ---
alias grl='git reflog'

# --- git remote ---
alias grr='git remote'
alias grrs='git remote show'
alias grru='git remote update'
alias grrp='git remote prune'

# --- git revert ---
alias grv='git revert'
alias grvnc='git revert --no-commit'

# --- git show-branch ---
alias gsb='git show-branch'
alias gsbdo='git show-branch --date-order'
alias gsbto='git show-branch --topo-order'

# --- git submodule ---
alias gsm='git submodule'
alias gsmi='git submodule init'
alias gsma='git submodule add'
alias gsms='git submodule sync'
alias gsmu='git submodule update'
alias gsmui='git submodule update --init'
alias gsmuir='git submodule update --init --recursive'

# --- git status ---
alias gs='git status'
alias gss='git status --short'
alias gssb='git status --short --branch'

# --- git stash ---
alias gst='git stash'
alias gstp='git stash pop'
alias gsta='git stash apply'
alias gstl='git stash list'
alias gstd='git stash drop'
alias gsts='git stash show --patch'

# --- git whatchanged ---
alias gw='git whatchanged'

# ============================================================================
#  FRIENDLY ALIASES — helpers, lookups, and utilities
# ============================================================================

# --- Recommended helpers ---

git-initer() {
  git init "$@" && git commit --allow-empty -m "Initial empty commit (rebaseable root)"
}

git-cloner() {
  git clone --recurse-submodules "$@"
}

git-pruner() {
  git prune --expire=now
  git reflog expire --expire-unreachable=now --rewrite --all
}

git-repacker() {
  git repack -a -d -f --depth=300 --window=300 --window-memory=1g
}

git-optimizer() {
  git-pruner && git-repacker
}

# --- Quick highlights ---

git-chart() {
  git shortlog --summary --numbered --no-merges "$@"
}

git-churn() {
  git log --all --find-copies --find-renames --name-only --format='format:' "$@" \
    | sort | grep -v '^$' | uniq -c | sort -rn | head -20
}

git-summary() {
  echo "--- Repository Summary ---"
  echo "Commits:      $(git rev-list --count HEAD 2>/dev/null || echo 0)"
  echo "Authors:      $(git shortlog -sn --no-merges | wc -l | tr -d ' ')"
  echo "Files:        $(git ls-files | wc -l | tr -d ' ')"
  echo "Branches:     $(git branch --list | wc -l | tr -d ' ')"
  echo "Tags:         $(git tag --list | wc -l | tr -d ' ')"
  echo "Remotes:      $(git remote | wc -l | tr -d ' ')"
  echo "First commit: $(git log --reverse --format='%ai' | head -1)"
  echo "Last commit:  $(git log -1 --format='%ai')"
}

# --- Branch names ---

git-default-branch() {
  git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' \
    || git config init.defaultBranch \
    || echo "main"
}

git-current-branch() {
  git rev-parse --abbrev-ref HEAD
}

git-upstream-branch() {
  git rev-parse --abbrev-ref '@{upstream}' 2>/dev/null
}

git-topic-base-branch() {
  git-default-branch
}

# --- Branch commits ---

git-branch-commit-first() {
  local base
  base=$(git-default-branch)
  git log "$base"..HEAD --oneline --reverse | head -1 | cut -d' ' -f1
}

git-branch-commit-last() {
  git log -1 --format='%H'
}

git-branch-commit-prev() {
  git log -1 --format='%H' HEAD~1 2>/dev/null
}

git-branch-commit-next() {
  local current next
  current=$(git rev-parse HEAD)
  next=$(git log --reverse --ancestry-path "${current}..HEAD" 2>/dev/null | head -1 | awk '{print $2}')
  echo "${next:-"(no next commit)"}"
}

# --- Friendly plurals ---

git-aliases() {
  git config --get-regexp '^alias\.' | sed 's/^alias\.//' | sort
}

git-branches() {
  git branch -a --sort=-committerdate \
    --format='%(HEAD) %(refname:short) - %(committerdate:relative) - %(subject)'
}

git-tags() {
  git tag --list --sort=-version:refname
}

git-stashes() {
  git stash list
}

# --- Undo ---

alias guncommit='git reset --soft HEAD~1'
alias gunadd='git reset HEAD'

# --- Logging & reporting ---

git-who() {
  git shortlog --summary --numbered --no-merges "$@"
}

git-log-my()      { git log --author="$(git config user.email)" "$@"; }
git-log-my-day()  { git log --author="$(git config user.email)" --since='1 day ago' "$@"; }
git-log-my-week() { git log --author="$(git config user.email)" --since='1 week ago' "$@"; }
git-log-my-month(){ git log --author="$(git config user.email)" --since='1 month ago' "$@"; }
git-log-my-year() { git log --author="$(git config user.email)" --since='1 year ago' "$@"; }

git-log-1-hour()  { git log --since='1 hour ago' "$@"; }
git-log-1-day()   { git log --since='1 day ago' "$@"; }
git-log-1-week()  { git log --since='1 week ago' "$@"; }
git-log-1-month() { git log --since='1 month ago' "$@"; }
git-log-1-year()  { git log --since='1 year ago' "$@"; }

git-log-date-first() { git log --reverse --format='%aI' | head -1; }
git-log-date-last()  { git log -1 --format='%aI'; }
git-log-fresh()      { git log ORIG_HEAD.. --stat --no-merges "$@"; }
git-log-fetched()    { git log HEAD..origin/"$(git-default-branch)" --oneline "$@"; }
git-log-refs()       { git log --all --oneline --decorate --simplify-by-decoration "$@"; }

# --- Log count/format helpers ---

git-log-of-count-and-email()        { git shortlog -sne "$@"; }
git-log-of-count-and-day()          { git log --format='%ad' --date='format:%Y-%m-%d' "$@" | sort | uniq -c | sort -rn; }
git-log-of-count-and-day-of-week()  { git log --format='%ad' --date='format:%A' "$@" | sort | uniq -c | sort -rn; }
git-log-of-count-and-hour()         { git log --format='%ad' --date='format:%Y-%m-%d %H' "$@" | sort | uniq -c | sort -rn; }
git-log-of-count-and-hour-of-day()  { git log --format='%ad' --date='format:%H' "$@" | sort | uniq -c | sort -rn; }
git-log-of-count-and-week()         { git log --format='%ad' --date='format:%Y-W%V' "$@" | sort | uniq -c | sort -rn; }
git-log-of-count-and-month()        { git log --format='%ad' --date='format:%Y-%m' "$@" | sort | uniq -c | sort -rn; }
git-log-of-count-and-year()         { git log --format='%ad' --date='format:%Y' "$@" | sort | uniq -c | sort -rn; }

# --- Lookups ---

git-whois() {
  git log --all --format='%aN <%aE>' | sort -u | grep -i "${1:?Usage: git-whois <name>}"
}

git-whatis() {
  git cat-file -t "${1:?Usage: git-whatis <object>}" && git cat-file -p "$1"
}

# --- Commit details ---

git-commit-parents() {
  git rev-parse "${1:-HEAD}^@"
}

git-commit-is-merge() {
  local count
  count=$(git rev-list --parents -n 1 "${1:-HEAD}" | wc -w)
  [ "$count" -gt 2 ]
}

git-commit-message-key-lines() {
  git log --format='%B' -n 1 "${1:-HEAD}" | grep -E '^[A-Za-z-]+:'
}

# --- Add / edit files by type ---

git-add-cached()   { git diff --cached --name-only --diff-filter=M | xargs git add; }
git-add-deleted()  { git ls-files --deleted | xargs git add; }
git-add-modified() { git ls-files --modified | xargs git add; }
git-add-others()   { git ls-files --others --exclude-standard | xargs git add; }
git-add-unmerged() { git diff --name-only --diff-filter=U | xargs git add; }

git-edit-cached()   { "${EDITOR:-vim}" $(git diff --cached --name-only --diff-filter=M); }
git-edit-deleted()  { "${EDITOR:-vim}" $(git ls-files --deleted); }
git-edit-modified() { "${EDITOR:-vim}" $(git ls-files --modified); }
git-edit-others()   { "${EDITOR:-vim}" $(git ls-files --others --exclude-standard); }
git-edit-unmerged() { "${EDITOR:-vim}" $(git diff --name-only --diff-filter=U); }

# --- Script helpers ---

alias gtop='git rev-parse --show-toplevel'

git-exec() { (cd "$(git rev-parse --show-toplevel)" && exec "$@"); }

# --- Remotes ---

git-remotes-prune() {
  for remote in $(git remote); do git remote prune "$remote"; done
}

git-remotes-push() {
  for remote in $(git remote); do git push "$remote" "$@"; done
}

# --- New repos ---

alias ginit-empty='git init && git commit --allow-empty -m "Initial empty commit (rebaseable root)"'

git-clone-lean() { git clone --depth 1 --single-branch "$@"; }

# --- Hew — delete merged branches ---

git-hew() {
  local base="${1:-$(git-default-branch)}"
  git branch --merged "$base" | grep -v "^\*\|$base" | xargs -r git branch -d
}

git-hew-dry-run() {
  local base="${1:-$(git-default-branch)}"
  git branch --merged "$base" | grep -v "^\*\|$base"
}

git-hew-local()        { git-hew "$@"; }
git-hew-local-dry-run(){ git-hew-dry-run "$@"; }

git-hew-remote() {
  local base="${1:-$(git-default-branch)}"
  git branch -r --merged "$base" | grep -v "origin/$base\|origin/HEAD" \
    | sed 's|origin/||' | xargs -r -I{} git push origin --delete {}
}

git-hew-remote-dry-run() {
  local base="${1:-$(git-default-branch)}"
  git branch -r --merged "$base" | grep -v "origin/$base\|origin/HEAD"
}

# --- Saving work ---

git-snapshot() {
  git stash push -m "snapshot: $(date '+%Y-%m-%d %H:%M:%S')" \
    && git stash apply 'stash@{0}'
}

git-panic() {
  cd "$(git rev-parse --show-toplevel)" || return
  git add --all
  git commit -m "PANIC: $(date '+%Y-%m-%d %H:%M:%S')"
}

git-archive-repo() {
  local name
  name=$(basename "$(git rev-parse --show-toplevel)")
  git archive --format=tar.gz --prefix="$name/" -o "$name-$(date +%Y%m%d).tar.gz" HEAD
}

# --- Misc helpers ---

git-orphans()          { git fsck --unreachable --no-reflogs; }
git-fixup()            { git commit --fixup="${1:-HEAD}"; }
git-heads()            { git log --oneline --decorate --simplify-by-decoration --all; }
git-discard()          { git checkout -- "$@"; }
git-search-commits()   { git log --all --source --pretty=oneline -S "${1:?Usage: git-search-commits <string>}"; }
git-refs-by-date()     { git for-each-ref --sort=committerdate --format='%(committerdate:short) %(refname:short)' refs/heads/; }
git-cherry-pick-merge(){ git cherry-pick -m 1 "$@"; }
git-last-tag()         { git describe --tags --abbrev=0 2>/dev/null; }
git-last-tagged()      { git describe --tags "$(git rev-list --tags --max-count=1)" 2>/dev/null; }

git-ignore() {
  echo "$@" >> "$(git rev-parse --show-toplevel)/.gitignore"
}

git-show-unreachable() {
  git fsck --unreachable | grep commit | cut -d' ' -f3 \
    | xargs git log --merges --no-walk --oneline
}

git-rev-list-all-objects-by-size() {
  git rev-list --objects --all \
    | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
    | sed -n 's/^blob //p' \
    | sort -rnk2 \
    | head -20
}

git-rev-list-all-objects-by-size-and-name() {
  git rev-list --objects --all \
    | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
    | sed -n 's/^blob //p' \
    | sort -rnk2 \
    | head -40 \
    | awk '{printf "%s %8d %s\n", $1, $2, $3}'
}

# ============================================================================
#  WORKFLOW ALIASES — topic branching, flow, and collaboration
# ============================================================================

# --- Topic branching ---

git-topic-begin() {
  local name="$1" base="${2:-$(git-default-branch)}"
  [ -z "$name" ] && { echo "Usage: git-topic-begin <name> [base]"; return 1; }
  git checkout "$base" && git pull && git checkout -b "$name"
}
alias git-topic-start='git-topic-begin'

git-topic-end() {
  local current base
  current=$(git-current-branch)
  base=$(git-default-branch)
  git checkout "$base" && git merge "$current" && git branch -d "$current"
}
alias git-topic-finish='git-topic-end'

git-topic-sync() {
  local base
  base=$(git-default-branch)
  git fetch origin && git rebase "origin/$base"
}

git-topic-move() {
  [ -z "$1" ] && { echo "Usage: git-topic-move <new-name>"; return 1; }
  git branch -m "$1"
}

# --- Flow aliases ---

git-get() { git pull --rebase && git submodule update --init --recursive; }
git-put() { git push --set-upstream origin "$(git-current-branch)"; }

git-ours()   { git checkout --ours   -- "$@" && git add "$@"; }
git-theirs() { git checkout --theirs -- "$@" && git add "$@"; }

git-wip() { git add --all && git commit -m "WIP"; }

git-unwip() {
  local last_msg
  last_msg=$(git log -1 --format='%s')
  [ "$last_msg" = "WIP" ] && git reset --soft HEAD~1
}

git-assume()      { git update-index --assume-unchanged "$@"; }
git-unassume()    { git update-index --no-assume-unchanged "$@"; }
git-assume-all()  { git ls-files -z | xargs -0 git update-index --assume-unchanged; }
git-unassume-all(){ git ls-files -v | grep '^h' | awk '{print $2}' | xargs git update-index --no-assume-unchanged; }
git-assumed()     { git ls-files -v | grep '^h' | awk '{print $2}'; }

git-publish()   { git push --set-upstream origin "$(git-current-branch)"; }
git-unpublish() { git push origin --delete "$(git-current-branch)"; }

# --- Reset & undo ---

git-reset-commit()            { git reset --soft HEAD~1; }
git-reset-commit-hard()       { git reset --hard HEAD~1; }
git-reset-commit-hard-clean() { git reset --hard HEAD~1 && git clean -fd; }
git-reset-to-pristine()       { git reset --hard && git clean -ffdx; }
git-reset-to-upstream()       { git reset --hard "$(git-upstream-branch)"; }

alias git-undo-commit='git-reset-commit'
alias git-undo-commit-hard='git-reset-commit-hard'
alias git-undo-commit-hard-clean='git-reset-commit-hard-clean'
alias git-undo-to-pristine='git-reset-to-pristine'
alias git-undo-to-upstream='git-reset-to-upstream'

# --- Track & untrack ---

git-track() {
  local branch="${1:-$(git-current-branch)}"
  echo "git branch --set-upstream-to=origin/$branch $branch"
  git branch --set-upstream-to="origin/$branch" "$branch"
}

git-untrack() {
  local branch="${1:-$(git-current-branch)}"
  echo "git branch --unset-upstream $branch"
  git branch --unset-upstream "$branch"
}

# --- Inbound & outbound ---

git-inbound()  { git fetch && git log ..@{upstream} --oneline "$@"; }
git-outbound() { git log @{upstream}.. --oneline "$@"; }

# --- Pull1 & push1 ---

git-pull1() { git pull origin "$(git-current-branch)"; }
git-push1() { git push origin "$(git-current-branch)"; }

# --- Misc workflow ---

git-issues() {
  git log --oneline "$@" | grep -oiE '(#[0-9]+|[A-Z]+-[0-9]+)' | sort -u
}

git-expunge() {
  [ -z "$1" ] && { echo "Usage: git-expunge <file>"; return 1; }
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch '$1'" \
    --prune-empty --tag-name-filter cat -- --all
}

git-reincarnate() {
  local branch="$1"
  [ -z "$branch" ] && { echo "Usage: git-reincarnate <branch>"; return 1; }
  git branch -D "$branch" && git checkout -b "$branch"
}

git-serve() {
  git daemon --reuseaddr --verbose --base-path=. --export-all ./.git
}

git-track-all-remote-branches() {
  for branch in $(git branch -r | grep -v '\->'); do
    git branch --track "${branch#origin/}" "$branch" 2>/dev/null
  done
}

git-cleaner()  { git clean -df "$@"; }
git-cleanest() { git clean -ffdx "$@"; }
git-cleanout() { git clean -df && git checkout -- .; }

git-mainly() {
  local base
  base=$(git-default-branch)
  git checkout "$base" && git pull
}

# --- Diff helpers ---

git-diff-stat()    { git diff --stat "$@"; }
git-diff-changes() { git diff --name-status "$@"; }
git-diff-staged()  { git diff --cached "$@"; }
git-diff-deep()    { git diff --stat --summary --patch "$@"; }
git-diff-chunk()   { git log -p -1 "$1" -- "$2"; }

# --- Merge span ---

git-merge-span-log()     { git log "$1^..$1"; }
git-merge-span-diff()    { git diff "$1^..$1"; }
git-merge-span-difftool(){ git difftool "$1^..$1"; }

# --- Rebase helpers ---

git-rebase-branch() {
  git rebase --interactive "$(git merge-base HEAD "$(git-default-branch)")"
}

git-rebase-recent() {
  git rebase --interactive "HEAD~${1:-10}"
}

# --- Graphviz ---

git-graphviz() {
  echo 'digraph git {'
  git log --pretty='format:  "%h" -> { %p }' "$@" \
    | sed 's/[a-f0-9][a-f0-9]*/\"&\"/g'
  echo '}'
}

# ============================================================================
#  TOOLING ALIASES — gitk, graphviz, and interop
# ============================================================================

alias gitk-conflict='gitk --left-right HEAD...MERGE_HEAD'
alias gitk-history-all='gitk --all'

git-debug() {
  GIT_TRACE=1 git "$@"
}

git-intercommit() {
  [ $# -lt 2 ] && { echo "Usage: git-intercommit <commit1> <commit2> [interdiff-opts]"; return 1; }
  local a="$1" b="$2"; shift 2
  interdiff <(git show "$a") <(git show "$b") "$@"
}

alias gs='git status'
alias gd='git diff'
alias gpush='git push'
alias gpull='git pull'
alias gl='git log'
alias gb='git branch'
alias gap='git add -p'
alias gaa='git add -A'
alias gc='git commit -m'
alias gac='git commit -am'
alias gco='git checkout'
alias gcob='git checkout -b'
alias gamend='git commit --amend'
alias grhh='git reset --hard HEAD'

# from http://haacked.com/archive/2014/07/28/github-flow-aliases/
# Cleans up branches merged into master
alias bclean='!f() { git branch --merged ${1-master} | grep -v " ${1-master}$" | xargs -r git branch -d; }; f'
alias bdone='!f() { git checkout ${1-master} && git up && git bclean ${1-master}; }; f'

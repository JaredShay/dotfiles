source ~/.bash/git-completion.bash
source ~/.bash/git-prompt.bash

export EDITOR=vim

export PATH="/usr/local/bin:/usr/local/sbin:~/bin:~/.rbenv/bin:$PATH"

# nvm
export NVM_DIR="/Users/jshay/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

export HISTCONTROL=erasedups
export HISTSIZE=10000
shopt -s histappend

eval "$(rbenv init -)"

export EDITOR=vim

# load zsh completions
autoload -Uz compinit && compinit

# Load colors for prompt customization
autoload -U colors && colors

# Load version control information
autoload -Uz vcs_info
precmd() { vcs_info }

autoload -Uz add-zsh-hook

# Format the vcs_info_msg_0_ variable
zstyle ':vcs_info:*' enable git
zstyle ':vcs_info:*' formats "%{$reset_color%}%r/%S %F{green}%c%u%b%f"
zstyle ':vcs_info:*' actionformats "%{$reset_color%}%r/%S %F{green}%c%u%b%f %a"
zstyle ':vcs_info:*' stagedstr "%F{yellow}"
zstyle ':vcs_info:*' unstagedstr "%F{magenta}"
zstyle ':vcs_info:*' check-for-changes true

zstyle ':vcs_info:git*+set-message:*' hooks git-untracked

+vi-git-untracked() {
  if git --no-optional-locks status --porcelain 2> /dev/null | grep -q "^??"; then
    hook_com[staged]+="%F{red}"
  fi
}

# Set up the prompt
setopt PROMPT_SUBST
#export PROMPT='$vcs_info_msg_0_ %# '
PROMPT='${vcs_info_msg_0_} $ '

export PATH="/usr/local/bin:/usr/local/sbin:~/bin:~/.rbenv/bin:$PATH"

# Clean up history and increase default size
setopt HIST_IGNORE_ALL_DUPS
export HISTSIZE=10000

# Share history across sessions
setopt APPEND_HISTORY

# Immeadiately add commands to history
setopt INC_APPEND_HISTORY

# Add time stamp to history. Allows for searching N cmds sorted by timestamp
#   e.g `history -E 10`
export HISTTIMEFORMAT="[%F %T] "
setopt EXTENDED_HISTORY


if command -v rbenv &> /dev/null
then
  eval "$(rbenv init -)"
else
  echo "Need to install rbenv: https://github.com/rbenv/rbenv"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

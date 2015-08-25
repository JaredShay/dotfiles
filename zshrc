if [ -f ~/.bashrc ]; then
  [[ -e ~/.bashrc ]] && emulate sh -c 'source ~/.bashrc'
fi

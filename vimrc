call pathogen#infect()

set nocp           " Disable vi compatibility, enables vim awesome
set expandtab
set tabstop=2
set bs=2
set shiftwidth=2
set number
set autoindent
set wildmode=longest,list
set wildignore=*.rbc,.git,*.o,*.gem
set history=100
set colorcolumn=80
set encoding=utf-8
set hlsearch

set winwidth=81
syntax on
syntax enable

if has("gui_running")
  set guioptions=egmrt
end

set t_Co=256
set background=dark
colorscheme solarized

call togglebg#map("<F3>")

if has("mouse")
  set mouse=a
  set mousehide
end

set backup
set backupdir=~/.vim-tmp,~/.tmp,~/tmp,/var/tmp,/tmp
set directory=~/.vim-tmp,~/.tmp,~/tmp,/var/tmp,/tmp

set grepprg=ack
set grepformat=%f:%l:%m

" Disable F1 so mashing esc is easier
map <F1> <Esc>
imap <F1> <Esc>

" Expand current directory.
cnoremap %% <C-R>=expand('%:h').'/'<cr>

" Remove trailing white space on save
autocmd BufWritePre * :%s/\s\+$//e

set nocompatible
filetype off

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

" let Vundle manage Vundle, required
Plugin 'gmarik/Vundle.vim'

" Solarize color scheme
Plugin 'altercation/vim-colors-solarized'

" Coffee-script syntax
Plugin 'kchmck/vim-coffee-script'

" Nerdtree for better file structure views
Plugin 'scrooloose/nerdtree'

" Ctrlsf for searching directly in vim
Plugin 'dyng/ctrlsf.vim'

" CtrlP for searching file paths
"Plugin 'kien/ctrlp.vim' - this is the original repo that went dark
Plugin 'ctrlpvim/ctrlp.vim'

" All plugins must be added before these two lines
call vundle#end()
filetype plugin indent on

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
set background=light
colorscheme solarized

" Syntax highlighting for Gemfiles
autocmd BufNewFile,BufRead Gemfile set filetype=ruby
autocmd BufNewFile,BufRead *.gemfile set filetype=ruby

" Syntax highlighting for bash_profile
autocmd BufNewFile,BufRead bash_profile set filetype=sh

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

" CtrlSF mappings
nmap <C-f> <Plug>CtrlSFPrompt
vmap <C-f> <Plug>CtrlSFVwordPath
vmap <C-f>f <Plug>CtrlSFVwordExec

let g:ctrlsf_default_root = 'project'

" NerdTree Settings
" Open NerdTree at startup
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif

" Open with Ctrl+n
map <C-n> :NERDTreeToggle<CR>

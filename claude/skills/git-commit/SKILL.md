---
name: git-commit
description: Use when writing or running any git commit message. Auto-invoke when the user asks to commit, stage and commit, or write a commit message.
---

# Git Commit Messages

## Subject Line
- Imperative mood: "Fix bug" not "Fixed bug" or "Fixes bug"
- 50 characters or fewer
- Capitalized first word
- No trailing period

## Structure
- Blank line between subject and body
- Body lines wrapped at 72 characters
- Body explains *what* and *why*, not *how*

## Examples
Good: `Add user authentication via OAuth`
Bad:  `added oauth` / `Adding OAuth authentication to the user login system so users can log in`

## Multi-paragraph body
Use blank lines between paragraphs. Each paragraph should address
a distinct aspect of the change.

## Committing

IMPORTANT: Use ANSI-C quoting (`$'...'`) for the commit message — never use a heredoc or `$()` command substitution. Encode newlines as `\n`:

  git commit -m $'Subject line\n\nBody text.\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'

## Validation
Before committing, run the validator and fix all errors before proceeding.

IMPORTANT: Always use `printf` — never use a heredoc (`cat <<'EOF'`) or `$()`. The command MUST be a single line.

  printf 'subject line\n\nbody line 1\nbody line 2\n' | ~/.claude/scripts/validate-commit-msg.sh

Encode all newlines as `\n` in the printf format string.
Output will be "OK" or a list of errors with exact line numbers and lengths.
Do not commit until the script outputs "OK".

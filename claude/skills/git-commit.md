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

## Validation
Before committing, run the validator and fix all errors before proceeding:

  cat <<'EOF' | ~/.claude/scripts/validate-commit-msg.sh
  <your commit message here>
  EOF

Output will be "OK" or a list of errors with exact line numbers and lengths.
Do not commit until the script outputs "OK".

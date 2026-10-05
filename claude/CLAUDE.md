## MCP

All MCP setups go through executor:
- Never guess tool paths. Start with `tools.search({ query: "<service>" })` and use the returned `path` exactly.
- Always `return` from execute code; `result` is null otherwise.
- Some integrations expose meta-tools (search_X_tools / execute_X_tool); follow their hints.

## Git Commits
Before writing or running any git commit, read and follow ~/.claude/skills/git-commit.md.

## System Specs
Before writing or modifying any system spec, read and follow ~/.claude/skills/system-specs.md.

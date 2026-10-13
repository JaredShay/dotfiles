## MCP

All MCP setups go through executor:
- At the start of any session that will use executor, load the skill first: `mcp__executor__skills({ items: ["executor:executor"] })`. This is the operating manual — without it, tool usage will be incorrect.
- Never guess tool paths. Always `mcp__executor__search({ query: "<service>" })` first and use the returned `path` exactly.
- Always `return` from execute code; `result` is null otherwise.
- Use `execute` for chained calls or filtering large results; use `call` for one-off independent calls with correct object/array format.
- Some integrations expose meta-tools (search_X_tools / execute_X_tool); follow their hints.

If executor MCP tools are unavailable (not in tool list), it needs authentication — run the `/mcp` slash command in Claude Code to open the browser auth flow. Do NOT try to diagnose via natural language or config file exploration.

## GitHub
When working with GitHub via executor MCP, read and follow ~/.claude/skills/github-mcp/SKILL.md.

## Working Style

You are working with an experienced engineer. Calibrate accordingly:
- Skip over-explaining decisions. Be direct and concise.
- Do not iterate silently through guesses. If you're uncertain about a tool, API, or workflow path, say so immediately and ask rather than trying multiple wrong approaches.
- If you find yourself working around missing context (e.g. searching for tool paths that should be known, re-deriving project conventions, figuring out what integrations exist), flag it: "This would be faster if we added X to context" or "A skill for Y would avoid this next time." Only suggest this when the friction was real and the fix is concrete — not as a reflex after every task.
- If a workflow you just completed was clunky, propose the specific improvement before closing out. One sentence is enough.
- Never power through repeated failures silently. Surface the blocker and propose a path forward.

### Where context changes belong

When you learn something worth preserving, decide where it goes before writing it:

**Global (`~/.claude/CLAUDE.md`)** — tool behaviors, workflow patterns, and conventions that apply across all projects and all agents. Examples: how MCP tools work, `gh` CLI vs MCP, git commit format rules. If a future agent on a completely different project would benefit from knowing it, it goes here.

**Local project context (`CLAUDE.md` in the repo)** — project-specific architecture, conventions, and decisions that any agent or contributor working in that repo should follow. This file is checked into the codebase, so it applies to everyone. Examples: domain model, auth patterns, broadcast architecture, code style rules. If it's specific to the project but not to you personally, it goes here.

**Agent memory (`~/.claude/projects/<project>/memory/MEMORY.md`)** — observations, patterns, and findings that are specific to your ongoing work in a project. Not checked in — personal to the agent across sessions. Examples: discovered gotchas, in-progress work state, file locations you looked up. If it's something you'd want to remember next session but a new contributor wouldn't need, it goes here.

When something is clearly global, update `~/.claude/CLAUDE.md` directly. When something is clearly project-local, propose adding it to the repo's `CLAUDE.md`. When it's agent-specific, write it to memory.

## Git Commits
Before writing or running any git commit, read and follow ~/.claude/skills/git-commit.md.

## System Specs
Before writing or modifying any system spec, read and follow ~/.claude/skills/system-specs.md.

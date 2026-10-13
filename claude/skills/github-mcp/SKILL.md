---
name: github-mcp
description: Use when working with GitHub via executor MCP — PRs, CI checks, annotations, issues, workflow runs. Covers when to use executor MCP vs gh CLI.
---

# GitHub: executor MCP vs gh CLI

Two tools are available for GitHub. Choose based on what the API returns:

## Use executor MCP (JSON responses)
- PR details, check run status/conclusions, annotations, commit info, issues, workflow run metadata
- Creating/updating resources (comments, labels, reviews)
- `checks.listAnnotations` returns 200 JSON — good for seeing TypeScript/lint error locations in CI

## Use `gh` CLI via Bash (blob storage redirects)
Endpoints that redirect to blob storage always return 302 — executor MCP fails with 502 on these.
- Job logs: `gh run view --repo owner/repo --job <job_id> --log`
- Failed-only logs: `gh run view --repo owner/repo --log-failed <run_id>`
- Any `downloadJobLogsForWorkflowRun` / `downloadWorkflowRunLogs` call

## Rule of thumb
- Need pass/fail or structured metadata → MCP
- Need to read what a CI step actually printed → `gh` CLI

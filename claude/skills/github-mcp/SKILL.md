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

## If `gh` returns auth/visibility errors
Only applies when `gh` itself errors on a repo (e.g. "Could not resolve to a Repository", or HTTP 404 on `actions/jobs/...` for a private repo). That means the active `gh` login/token can't see the repo. Do not apply this to unrelated failures, and do not reproduce the failure locally or guess at the cause; the failing log is the only valid evidence.

Check `gh auth status`. If the active account is marked `(GITHUB_TOKEN)`, the `GITHUB_TOKEN` env var is overriding the keyring login, and it may belong to a different account or have narrower scopes.

Fix per command, no config changes:
```
env -u GITHUB_TOKEN -u GH_TOKEN gh run view --repo <owner>/<repo> --job <job_id> --log-failed
```

Find the job id with executor `tools.github.checks.listForRef` (the check run `id` is the job id; `html_url` ends in `/job/<id>`).

If that still fails, stop and tell the user. Suggest `! gh auth status` and `! gh auth refresh -s repo,workflow`.

## Reading CI failures
- Annotations on failed jobs are often just "Process completed with exit code 1". They do not say what failed. Read the job log.
- Check which step failed before assuming a code problem. Infra flakes happen (e.g. `yarn install` failing with `502 Bad Gateway` from registry.yarnpkg.com, which fails the job before lint runs). A flake needs a re-run, not a code fix.
- Re-run a check with executor `tools.github.checks.rerequestRun` (asks for approval).

## Rule of thumb
- Need pass/fail or structured metadata → MCP
- Need to read what a CI step actually printed → `gh` CLI

# Security

## Status

The Players Platform (Sadara) is in development and has no production
deployment. Nothing here claims a certification, an audit, or a compliance
standard, and nothing should — not in code, docs, UI copy, or a commit message
— until it has actually been completed.

## Reporting a vulnerability

Use GitHub's [private vulnerability reporting](https://github.com/OmarSweiti/Players_Platform_Frontend/security/advisories/new).

- **Do not open a public issue**, and do not describe the flaw in a PR title.
- Include the affected version or commit and the smallest reproduction you have.
- Never paste a real credential or personal record into the report.

Expect an acknowledgement within a few working days.

## What is enforced by a machine

| Enforced | By |
|---|---|
| No secret in a commit | Gitleaks in `pre-commit`, `pre-push`, CI (`supply-chain`), and a weekly full-history scan; GitHub secret scanning + push protection |
| No sensitive file type or oversized blob | `.githooks/pre-commit` (staged index) |
| Changes arrive through pull requests only, on legal routes | rulesets on `development`, `staging`, `main`; the `topology` required check |
| Release tags never move or disappear | the `tags-v-append-only` ruleset, which binds the admin too |
| The code type-checks and builds | the `test` required check |
| No high or critical npm advisory in the lockfile | `npm audit` judged by `scripts/npm-audit-gate.mjs` in the `supply-chain` required check and the weekly security lane; Dependabot alerts + security updates. The only exceptions are reviewed, expiring entries in `.npm-audit-allowlist.json`, each with a reason, read from the base branch (a pull request cannot excuse its own advisory) and valid only while npm's lockfile marks every copy of the package development-only |
| Code-level vulnerabilities are looked for | CodeQL default setup (extended suite) on every PR and weekly |
| Workflow security | SHA-pinned actions (enforced repository-wide), read-only default token, zizmor + actionlint |

## Known gaps

| Gap | What closes it |
|---|---|
| Lint is not a gate yet: 20 eslint problems at adoption | the change that clears them adds lint to the `test` check |
| No automated UI or end-to-end tests | a test runner and the first tests, then a CI step |
| No required approvals: a sole maintainer cannot approve their own PR | `required_approving_review_count: 1` when a second developer arrives |
| The admin can bypass the branch rulesets (through a PR only, and logged) | remove the bypass when a second maintainer exists |

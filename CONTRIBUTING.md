# Contributing

The frontend of the Players Platform. The plan, and the order work happens in,
live in [OmarSweiti/Players_Platform](https://github.com/OmarSweiti/Players_Platform).

## Once per clone

```bash
just setup    # hooks, identity, tag signing, the secret scanner, npm ci
just guards   # every guard proves it still refuses what it must
```

Needs `git`, `gh` (authenticated), `just`, `jq`, `gitleaks` ≥ 8.19 and Node
from `.nvmrc`.

## The flow

```text
feat/<slug> ──squash──► development ──merge commit──► staging ──merge commit──► main
                         (default)                     (candidate: vX.Y.Z-rc.N)  (release: vX.Y.Z)
```

```bash
just branch feat/player-profile                      # from a fresh development
git commit -m "feat(players): add the profile page  [#12]"
just pr 'feat(players): add the profile page  [#12]'  # local gate → push → PR → waits for required checks
just evidence <PR URL> report.md shots/    # in the umbrella: the validation evidence, for the head commit
# … the maintainer reviews and approves on GitHub …
just merge                                           # only once approved: squash, bound to the checked head
```

- **Work branches** are `feat|fix|chore|docs|refactor|perf|test/<kebab-slug>`
  and always target `development`. A production emergency is `hotfix/<slug>`
  from `main`.
- **Titles** are `type(scope): summary  [ref]`. The PR title becomes the
  squash commit, so CI checks it. `ref` is `#12` for an issue or `—` for none.
  The scopes are listed in `scripts/validate-change-title.sh`.
- **Promotions** (`just promote-staging`, `just promote-main`, then
  `just promote-merge <PR>`) always use a **merge commit**. A squash would fork
  the branches permanently.
- **Every PR is approved by the maintainer** — Dependabot's too — and GitHub
  enforces it: one approving review from the code owner, dismissed by a new
  push. GitHub refuses an approval from a PR's own author, so `just pr` opens
  the PR as the engineering app (the umbrella's `just engineering-app`),
  assigned to the maintainer with their review requested; commits stay yours.
- **Every PR shows it was validated**: the change run and exercised, with
  screenshots, posted for the head commit by the umbrella's `just evidence`.
  The required `validation` check refuses a PR without it
  (`scripts/check-validation.sh`).
- **No assistant attribution.** Coding assistants are tools, not co-authors:
  `Co-Authored-By:` trailers, "Generated with…" lines and assistant names are
  refused everywhere — commits, branches, titles, PR bodies and comments.

## Calling the API

Every call goes through the client generated from the backend's committed
contract (ADR-0010, ADR-0025): `openapi/openapi.json` is the backend's
`openapi/openapi.json`, byte for byte, at the backend commit
`openapi/source.json` records, and `src/shared/api/schema.d.ts` is what
`openapi-typescript` generates from it.

- A server render reads through `serverApi(locale)` (`src/server/api/`): the
  API's internal address (`API_INTERNAL_URL`, see `.env.example`), the
  session cookie and nothing else of the request, no cache.
- The browser uses `createApiClient({ locale })` (`src/shared/api/`) against
  `/api/v1` on its own origin.
- `unwrap(call)` returns the body, `{ data }` or `{ data, page }`, and throws
  an `ApiProblem` (status, code, field errors, request id) for any failure.
- No request names a tenant: the client refuses the header.

When the backend's contract changes, bring it over and regenerate:

```bash
npm run api:sync -- <backend commit>   # the full SHA, pushed: the copy is read from GitHub
npm run api:generate
```

`just contract` checks it as CI does: the copy is the backend's at the recorded
commit, and the types are the generator's.

## Before you push

`just pre-push` runs the complete local gate: type-check, lint, build, the unit
tests, the browser journeys, every guard, and a full-history secret scan.
`just check` alone is exactly the CI `test` check.

The branch rulesets, the required checks, and the hooks are described in
`.github/rulesets/README.md` and `SECURITY.md`.

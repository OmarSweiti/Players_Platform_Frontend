# Sadara — frontend

The web app of the Sadara player-management platform, in Arabic and English: Next.js 16, React 19,
TypeScript, Tailwind 4. Part of [Players_Platform](https://github.com/OmarSweiti/Players_Platform), which
holds the plan, the local stack and the progress record — **start there**.

```bash
git clone --recurse-submodules git@github.com:OmarSweiti/Players_Platform.git
cd Players_Platform && just setup-all && just up              # the whole local stack
cd frontend && cp .env.example .env.local && npm run dev       # https://sadara.localhost, via the local proxy
```

| Command | Does |
|---|---|
| `just check` | type-check, lint, unit tests and the production build — what CI's required `test` check runs |
| `npx playwright test` | the browser journeys in Arabic and English, with accessibility checks |
| `npm run api:generate` | regenerate the typed API client from the backend's committed contract |
| `just pr '<title>'` · `just merge <URL>` | ship a change through the flow — see `CONTRIBUTING.md` |

**Read `AGENTS.md` before writing code**: this Next.js version differs from what most tools and models
expect. How changes ship: `CONTRIBUTING.md`. Reporting a vulnerability: `SECURITY.md`.

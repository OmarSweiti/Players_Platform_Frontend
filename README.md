# Sadara — frontend

The web app of the Sadara player-management platform, in Arabic and English: Next.js 16, React 19,
TypeScript, Tailwind 4. Part of [Players_Platform](https://github.com/OmarSweiti/Players_Platform), which
holds the plan, the local stack and the progress record — **start there**.

```bash
git clone --recurse-submodules git@github.com:OmarSweiti/Players_Platform.git
cd Players_Platform && just setup-all && just up              # the whole local stack
cd frontend && npm run dev                                     # :3001, served at https://sadara.localhost by the local proxy
```

| Command | Does |
|---|---|
| `just check` | type-check, lint and formatting, the production build, the unit tests and the browser journeys — what CI's required `test` check runs |
| `just format` | rewrite the application code in Prettier's format |
| `just test` · `just test-e2e` | the unit and component tests (Vitest) · the browser journeys in Arabic and English, with accessibility checks (Playwright, axe) |
| `npm run api:generate` | regenerate the typed API client from the backend's committed contract |
| `just pr '<title>'` · `just merge <URL>` | ship a change through the flow — see `CONTRIBUTING.md` |

**Read `AGENTS.md` before writing code**: this Next.js version differs from what most tools and models
expect. How changes ship: `CONTRIBUTING.md`. Reporting a vulnerability: `SECURITY.md`.

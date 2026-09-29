import { defineConfig, devices } from '@playwright/test';

// Browser journeys live in tests/**/*.spec.ts. Vitest owns src/**/*.test.*:
// the globs are disjoint, so neither runner ever loads the other's files.
// Every journey runs twice, in the Arabic and the English project, against
// the production build (`just test-e2e` builds first), and tests/e2e/fixtures.ts
// runs axe on each page a test ends on.
const port = 3910; // not 3000, so a running `next dev` is never mistaken for the build
const baseURL = `http://127.0.0.1:${port}`;
const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  forbidOnly: ci, // a stray test.only must not shrink the suite in CI
  retries: 0, // a flaky journey is a defect to fix, never a retry to hide
  reporter: ci ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'ar', use: { ...devices['Desktop Chrome'], locale: 'ar' } },
    { name: 'en', use: { ...devices['Desktop Chrome'], locale: 'en' } },
  ],
  webServer: {
    command: `npx --no-install next start --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/login`,
    reuseExistingServer: false, // always the build this run made, never a stale server
    timeout: 120_000,
    env: { NEXT_TELEMETRY_DISABLED: '1' },
  },
});

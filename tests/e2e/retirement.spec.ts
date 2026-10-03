import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// The local sign-in pages are retired (0.1.7): the identity provider owns
// passwords and second factors, so no page of ours collects either.

// Values for the dynamic segments the route map uses; any other dynamic
// segment is skipped.
const SEGMENT_VALUES: Record<string, string[]> = { '[locale]': ['ar', 'en'] };

/** Every page route under app/, read from the filesystem: groups dropped. */
function pageRoutes(dir = 'app', prefix = ''): string[] {
  const routes: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      const values = /^\(.*\)$/.test(name)
        ? ['']
        : name.startsWith('[')
          ? (SEGMENT_VALUES[name] ?? []).map((value) => `/${value}`)
          : [`/${name}`];
      for (const value of values)
        routes.push(...pageRoutes(path, prefix + value));
    } else if (/^page\.[jt]sx?$/.test(name)) {
      routes.push(prefix || '/');
    }
  }
  return [...new Set(routes)].sort();
}

/**
 * A retired route renders nothing of its own: Next answers 404, or — signed
 * out — the proxy sends the visitor to the sign-in entry instead.
 */
async function expectRetired(page: Page, route: string): Promise<void> {
  const response = await page.goto(route);
  const landed = new URL(page.url()).pathname;
  expect([
    route,
    response?.status() === 404 || /^\/(ar|en)\/sign-in$/.test(landed),
  ]).toEqual([route, true]);
  await expect(page.locator('input[type="password"]'), route).toHaveCount(0);
}

const RETIRED = [
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/settings/2fa',
];

test('no_route_renders_a_password_field', async ({ page }) => {
  const routes = pageRoutes();
  expect(routes.length).toBeGreaterThan(0);

  for (const route of routes) {
    const response = await page.goto(route);
    expect([route, response?.status()]).toEqual([route, 200]);
    await expect(page.locator('input[type="password"]'), route).toHaveCount(0);
  }
  for (const route of RETIRED) await expectRetired(page, route);
});

test('no_page_generates_security_codes', async ({ page }) => {
  await expectRetired(page, '/settings/2fa');

  for (const route of pageRoutes()) {
    await page.goto(route);
    await expect(
      page.getByText(/backup codes?|recovery codes?/i),
      route,
    ).toHaveCount(0);
  }
});

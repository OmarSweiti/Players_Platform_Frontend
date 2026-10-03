import type { Page } from '@playwright/test';
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';
import { expect, test } from './fixtures';

// The route map (0.9.1): one tree under /{locale}. Until the session of
// 0.9.5, the proxy routes on the presence of a session cookie only, so the
// signed-in crawl sets a placeholder one.

const CATALOGS = { ar, en };
const localeOf = () => test.info().project.name as keyof typeof CATALOGS;
const notFoundTitle = () => CATALOGS[localeOf()].states.notFound.title;

async function signInPlaceholder(page: Page): Promise<void> {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error('baseURL is not configured');
  await page
    .context()
    .addCookies([{ name: 'accessToken', value: 'present', url: baseURL }]);
}

/** Visits `start`, then every same-origin link reachable from it, once each. */
async function crawl(page: Page, start: string): Promise<string[]> {
  const seen = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const path = queue.shift()!;
    const response = await page.goto(path);
    expect([path, response?.status()]).toEqual([path, 200]);
    await expect(
      page.getByRole('heading', { name: notFoundTitle() }),
      path,
    ).toHaveCount(0);

    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
      );
    for (const href of hrefs) {
      if (!seen.has(href)) {
        seen.add(href);
        queue.push(href);
      }
    }
  }
  return [...seen].sort();
}

test('every_internal_link_resolves', async ({ page }) => {
  const locale = localeOf();

  const signedOut = await crawl(page, `/${locale}/sign-in`);
  expect(signedOut).toContain(`/${locale}/sign-in`);

  await signInPlaceholder(page);
  const signedIn = await crawl(page, `/${locale}`);
  for (const noun of ['players', 'contracts', 'legal', 'settings']) {
    expect(signedIn).toContain(`/${locale}/${noun}`);
  }
  for (const path of signedIn) expect(path).toMatch(/^\/(ar|en)(\/|$)/);
});

test('an_unknown_route_renders_not_found', async ({ page }) => {
  const locale = localeOf();
  await signInPlaceholder(page);

  for (const path of [
    `/${locale}/no-such-page`,
    `/${locale}/players/no-such-page`,
  ]) {
    const response = await page.goto(path);
    expect([path, response?.status()]).toEqual([path, 404]);
    await expect(
      page.getByRole('heading', { name: notFoundTitle() }),
    ).toBeVisible();
  }

  // Without a locale, the address first gains the browser's.
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  expect(new URL(page.url()).pathname).toBe(`/${locale}/no-such-page`);
});

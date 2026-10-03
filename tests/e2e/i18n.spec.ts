import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Arabic and English, right to left and left to right (0.9.2): the server
// renders the direction, so nothing flips once JavaScript arrives.

test('the_arabic_layout_renders_rtl_on_the_server', async ({
  page,
  request,
}) => {
  for (const [locale, dir] of [
    ['ar', 'rtl'],
    ['en', 'ltr'],
  ] as const) {
    const response = await request.get(`/${locale}/sign-in`);
    expect(response.status()).toBe(200);

    const html = await response.text(); // the server's HTML, before any script runs
    const root = html.match(/<html[^>]*>/)?.[0] ?? '';
    expect([locale, root]).toEqual([
      locale,
      expect.stringContaining(`lang="${locale}"`),
    ]);
    expect([locale, root]).toEqual([
      locale,
      expect.stringContaining(`dir="${dir}"`),
    ]);
  }

  // And the live page keeps it: the project's own locale, axe-checked.
  const locale = test.info().project.name;
  await page.goto(`/${locale}/sign-in`);
  await expect(page.locator('html')).toHaveAttribute(
    'dir',
    locale === 'ar' ? 'rtl' : 'ltr',
  );
});

test('the_root_follows_the_browser_language', async ({ page, request }) => {
  for (const [acceptLanguage, locale] of [
    ['ar-SA,ar;q=0.9', 'ar'],
    ['en-GB,en;q=0.9', 'en'],
    ['fr-FR,fr;q=0.9', 'ar'], // neither: Arabic first (ADR-0008)
  ] as const) {
    const response = await request.get('/', {
      headers: { 'accept-language': acceptLanguage },
      maxRedirects: 0,
    });
    expect([acceptLanguage, response.status()]).toEqual([acceptLanguage, 307]);
    expect(new URL(response.headers().location, 'http://x').pathname).toBe(
      `/${locale}`,
    );
  }

  // The project's browser speaks its own language, and lands in it.
  const locale = test.info().project.name;
  await page.goto('/');
  expect(new URL(page.url()).pathname).toBe(`/${locale}/sign-in`);
});

/** The platform fonts Chrome draws the first `selector` match with. */
async function fontsDrawing(page: Page, selector: string): Promise<string[]> {
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector,
  });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  return fonts.map(({ familyName }) => familyName);
}

test('arabic_and_latin_text_use_their_typefaces', async ({ page }) => {
  const locale = test.info().project.name;
  await page.goto(`/${locale}/sign-in`);

  // Nothing is drawn by a fallback such as Arial: Arabic letters come from
  // IBM Plex Sans Arabic, Latin ones — and the spaces between words — from
  // Geist.
  const fonts = await fontsDrawing(page, 'h1');
  expect(fonts).toContain(locale === 'ar' ? 'IBM Plex Sans Arabic' : 'Geist');
  for (const font of fonts) {
    expect(['IBM Plex Sans Arabic', 'Geist']).toContain(font);
  }
});

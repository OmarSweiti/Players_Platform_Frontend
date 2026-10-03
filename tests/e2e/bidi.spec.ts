import { expect, test } from './fixtures';

// The browser's own bidi algorithm, measured on screen: inside Arabic text a
// Latin token such as "12-AB" is shown as "AB-12" unless it is isolated.

const TOKEN = '12-AB';
// What <Bidi>12-AB</Bidi> renders, pinned by src/shared/ui/bidi.test.tsx.
// Playwright's runner rewrites JSX for component testing, so the component
// itself cannot render here.
const ISOLATED = `<bdi dir="ltr">${TOKEN}</bdi>`;

test('an_isolated_identifier_keeps_its_order_on_screen', async ({ page }) => {
  const isolated = ISOLATED;
  await page.setContent(`<!doctype html>
    <html lang="ar" dir="rtl"><head><title>عزل الاتجاه</title></head><body><main>
      <p id="bare">رقم اللاعب ${TOKEN} مسجّل</p>
      <p id="isolated">رقم اللاعب ${isolated} مسجّل</p>
    </main></body></html>`);

  /** The on-screen left edge of each character of the token, in logical order. */
  const edges = (id: string) =>
    page.evaluate(
      ([id, token]) => {
        const paragraph = document.getElementById(id)!;
        const walker = document.createTreeWalker(
          paragraph,
          NodeFilter.SHOW_TEXT,
        );
        const characters: { node: Text; offset: number }[] = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          for (let offset = 0; offset < node.textContent!.length; offset++) {
            characters.push({ node: node as Text, offset });
          }
        }
        const text = paragraph.textContent!;
        const start = text.indexOf(token);
        return characters
          .slice(start, start + token.length)
          .map(({ node, offset }) => {
            const range = document.createRange();
            range.setStart(node, offset);
            range.setEnd(node, offset + 1);
            return range.getBoundingClientRect().left;
          });
      },
      [id, TOKEN] as const,
    );
  const leftToRight = (xs: number[]) =>
    xs.every((x, i) => i === 0 || x > xs[i - 1]);

  expect(leftToRight(await edges('bare'))).toBe(false); // the problem is real
  expect(leftToRight(await edges('isolated'))).toBe(true); // and Bidi solves it
});

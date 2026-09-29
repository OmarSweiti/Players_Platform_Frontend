import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Page } from '@playwright/test';

// The product target is WCAG 2.2 AA (docs/reference/ui-ux.md). A serious or
// critical finding fails the test; moderate and minor findings are attached
// to the report so they stay visible without blocking.
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BLOCKING = new Set(['serious', 'critical']);

type Violation = Awaited<
  ReturnType<AxeBuilder['analyze']>
>['violations'][number];

// Enough to find the element: the rule, its impact and the first selectors.
const summarize = ({ id, impact, help, nodes }: Violation) =>
  `${impact}: ${id} — ${help} — ${nodes
    .slice(0, 3)
    .map((n) => n.target.join(' '))
    .join(', ')}` + (nodes.length > 3 ? ` and ${nodes.length - 3} more` : '');

/** Runs axe on the page as it stands; call it after every in-journey navigation. */
export async function expectAccessible(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_AA)
    .analyze();
  const blocking = violations.filter((v) => BLOCKING.has(v.impact ?? ''));
  const advisory = violations.filter((v) => !BLOCKING.has(v.impact ?? ''));
  if (advisory.length > 0) {
    await base
      .info()
      .attach(`axe advisory findings on ${new URL(page.url()).pathname}`, {
        body: JSON.stringify(advisory.map(summarize), null, 2),
        contentType: 'application/json',
      });
  }
  expect(
    blocking.map(summarize),
    `axe found serious or critical WCAG 2.2 AA violations on ${page.url()}`,
  ).toEqual([]);
}

// Every test gets the check on the page it ends on, even if it forgets to ask.
export const test = base.extend<{ accessibleEnd: void }>({
  accessibleEnd: [
    async ({ page }, run, testInfo) => {
      await run();
      if (testInfo.status === testInfo.expectedStatus && !page.isClosed()) {
        await expectAccessible(page);
      }
    },
    { auto: true },
  ],
});

export { expect };

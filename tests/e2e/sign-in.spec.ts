import ar from '../../messages/ar.json';
import en from '../../messages/en.json';
import { expect, test } from './fixtures';

const CATALOGS = { ar, en };

test('each_locale_project_opens_the_sign_in_page', async ({ page }) => {
  const locale = test.info().project.name as keyof typeof CATALOGS;
  const { signIn } = CATALOGS[locale];

  const response = await page.goto(`/${locale}/sign-in`);

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { level: 1, name: signIn.title }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: signIn.action })).toBeVisible();
});

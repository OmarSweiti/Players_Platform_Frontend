import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LOCALES } from './locales';

// Every route lives under its locale (0.9.1); a path without one is sent to
// the locale the browser prefers, else Arabic.
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});

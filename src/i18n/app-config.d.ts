import type en from '../../messages/en.json';
import type { Locale } from './locales';

// Typed keys: `t('players.title')` checks against the catalog, so a missing
// or misspelled key fails the type-check. Both catalogs have the same keys
// (the_catalogs_have_identical_keys), so English stands for both.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof en;
  }
}

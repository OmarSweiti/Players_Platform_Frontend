/** The languages the product ships in, together (ADR-0008). */
export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Arabic-first for its users (ADR-0008): the fallback when the browser names neither. */
export const DEFAULT_LOCALE: Locale = 'ar';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The writing direction the server renders on `<html dir>`. */
export function directionOf(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

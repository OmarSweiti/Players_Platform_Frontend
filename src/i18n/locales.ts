/** The languages the product ships in, together (ADR-0008). */
export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Arabic-first for its users (ADR-0008); 0.9.2 negotiates from the browser. */
export const DEFAULT_LOCALE: Locale = 'ar';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

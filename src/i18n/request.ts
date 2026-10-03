import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (
      (await import(`../../messages/${locale}.json`)) as {
        default: Record<string, unknown>;
      }
    ).default,
    // Instants render in the tenant's IANA zone once the session carries it
    // (UX-007); until then one fixed zone keeps server and browser identical.
    timeZone: 'UTC',
  };
});

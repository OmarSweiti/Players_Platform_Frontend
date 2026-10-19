import 'server-only';
import { cookies } from 'next/headers';
import { type ApiLocale, createApiClient } from '@/shared/api/client';
import { apiInternalUrl } from './internal-url';

/** The session cookie the API sets at sign-in (ADR-0023). */
export const SESSION_COOKIE = '__Host-Http-sadara_session';

/**
 * The API for a server render (ADR-0025): at its internal address, with the
 * incoming request's session cookie and nothing else of the request, and
 * uncached, since every read is this member's, now. It returns the API's
 * data unchanged and decides nothing: authorization is the API's.
 *
 *     const api = await serverApi(locale);
 *     const ready = await unwrap(api.GET('/health/ready'));
 */
export async function serverApi(locale: ApiLocale) {
  const session = (await cookies()).get(SESSION_COOKIE);
  return createApiClient({
    locale,
    baseUrl: apiInternalUrl(),
    cache: 'no-store',
    headers: session
      ? { Cookie: `${SESSION_COOKIE}=${session.value}` }
      : undefined,
  });
}

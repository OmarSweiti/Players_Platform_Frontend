import createClient, { type Client, type ClientOptions } from 'openapi-fetch';
import { ApiProblem } from './problem';
import type { paths } from './schema';

/** The languages the API answers in (ADR-0008). */
export type ApiLocale = 'ar' | 'en';

export interface ApiClientOptions {
  /** The page's language: the API's messages come back in it. */
  locale: ApiLocale;
  /** Where the API is: this origin, unless a server render calls it directly (src/server/api). */
  baseUrl?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  fetch?: ClientOptions['fetch'];
}

// The tenant comes from the session, never from a request (invariant I-1):
// a header naming one is refused before it leaves.
const TENANT_HEADER = 'x-tenant-id';

/**
 * The API, typed by its committed contract: openapi/openapi.json, generated
 * into schema.d.ts (`npm run api:generate`). In the browser it calls the
 * API's paths (`/api/v1/…`) on this origin, where the proxy routes them to
 * the API (0.2.1), so the session cookie never crosses sites. It asks for
 * answers in the page's language, and sends no tenant.
 */
export function createApiClient<Paths extends object = paths>({
  locale,
  baseUrl = globalThis.location?.origin ?? '',
  headers,
  cache,
  fetch,
}: ApiClientOptions): Client<Paths> {
  const client = createClient<Paths>({
    baseUrl,
    cache,
    fetch,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json, application/problem+json',
      'Accept-Language': locale,
      ...headers,
    },
  });
  client.use({
    onRequest({ request }) {
      if (request.headers.has(TENANT_HEADER)) {
        throw new Error('A request never names its tenant: the session does');
      }
      return request;
    },
  });
  return client;
}

/**
 * The body of a successful call — `{ data }`, or `{ data, page }` for a
 * list; a failure throws its ApiProblem.
 *
 *     const { data } = await unwrap(api.GET('/health/live'));
 */
export async function unwrap<Data>(
  call: Promise<{ data?: Data; error?: unknown; response: Response }>,
): Promise<Data> {
  const { data, error, response } = await call;
  if (!response.ok || error !== undefined) {
    throw ApiProblem.from(response, error);
  }
  return data as Data;
}

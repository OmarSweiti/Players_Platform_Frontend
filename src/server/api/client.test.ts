import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../tests/msw/server';
import { unwrap } from '@/shared/api/client';
import { SESSION_COOKIE, serverApi } from './client';
import { apiInternalUrl } from './internal-url';

// Next marks this layer server-only; the test runs outside a server render.
vi.mock('server-only', () => ({}));

// The incoming request's cookies, as next/headers would read them.
const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        jar.has(name) ? { name, value: jar.get(name) } : undefined,
    }),
}));

const API = 'http://api.internal.test:3000';

describe('the server API layer', () => {
  afterEach(() => jar.clear());

  it('server_reads_forward_only_the_session_cookie_uncached', async () => {
    vi.stubEnv('API_INTERNAL_URL', API);
    jar.set(SESSION_COOKIE, 'session-canary');
    jar.set('NEXT_LOCALE', 'ar');
    jar.set('tracking', 'tracking-canary');
    const sent: Request[] = [];
    server.use(
      http.get(`${API}/health/live`, ({ request }) => {
        sent.push(request.clone());
        return HttpResponse.json({ data: { status: 'live' } });
      }),
    );

    const { data } = await unwrap((await serverApi('ar')).GET('/health/live'));

    expect(data.status).toBe('live');
    expect(sent).toHaveLength(1);
    const [request] = sent;
    expect(request?.url).toBe(`${API}/health/live`);
    expect(request?.headers.get('cookie')).toBe(
      `${SESSION_COOKIE}=session-canary`,
    );
    expect(request?.headers.has('x-tenant-id')).toBe(false);
    expect(request?.headers.get('accept-language')).toBe('ar');
    expect(request?.cache).toBe('no-store');
  });

  it('sends_no_cookie_without_a_session', async () => {
    vi.stubEnv('API_INTERNAL_URL', API);
    jar.set('NEXT_LOCALE', 'en');
    const cookies: (string | null)[] = [];
    server.use(
      http.get(`${API}/health/live`, ({ request }) => {
        cookies.push(request.headers.get('cookie'));
        return HttpResponse.json({ data: { status: 'live' } });
      }),
    );

    await unwrap((await serverApi('en')).GET('/health/live'));

    expect(cookies).toEqual([null]);
  });

  it('the_api_address_is_an_origin_from_the_environment', () => {
    vi.stubEnv('API_INTERNAL_URL', `${API}/`);
    expect(apiInternalUrl()).toBe(API);
    for (const [value, reason] of [
      ['', 'is not set'],
      ['api.internal.test', 'must be a URL'],
      ['ftp://api.internal.test', 'http or https'],
      [`${API}/api/v1`, 'an origin'],
    ] as const) {
      vi.stubEnv('API_INTERNAL_URL', value);
      expect(() => apiInternalUrl()).toThrow(reason);
    }
  });
});

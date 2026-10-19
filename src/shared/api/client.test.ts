import { http, HttpResponse } from 'msw';
import { format } from 'node:util';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../tests/msw/server';
import { createApiClient, unwrap } from './client';

const PASSWORD = 'Canary-password-5e1f!';
const EMAIL = 'member-5e1f@agency.test';

/** A write the contract does not have yet, typed as the generator would type it. */
interface FixturePaths {
  '/api/v1/members': {
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: { 'application/json': { email: string; password: string } };
      };
      responses: {
        200: {
          headers: { [name: string]: unknown };
          content: { 'application/json': { data: { email: string } } };
        };
      };
    };
  };
}

const live = () => HttpResponse.json({ data: { status: 'live' } });

describe('the API client', () => {
  afterEach(() => localStorage.clear());

  it('the_web_client_never_logs_a_request_body', async () => {
    // The old client logged bodies in development, so the test runs as development.
    vi.stubEnv('NODE_ENV', 'development');
    const logged: string[] = [];
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logged.push(format(...args));
      });
    }
    server.use(
      http.post(`${location.origin}/api/v1/members`, () =>
        HttpResponse.json({ data: { email: EMAIL } }),
      ),
    );

    const api = createApiClient<FixturePaths>({ locale: 'en' });
    const body = await unwrap(
      api.POST('/api/v1/members', {
        body: { email: EMAIL, password: PASSWORD },
      }),
    );

    expect(body).toEqual({ data: { email: EMAIL } }); // the request really ran
    for (const line of logged) {
      expect(line).not.toContain(PASSWORD);
      expect(line).not.toContain(EMAIL);
    }
  });

  it('no_request_carries_a_tenant_header', async () => {
    // Where the old client found the tenant it sent; nothing reads it now.
    localStorage.setItem('tenantId', 'tenant-canary');
    const sent: Headers[] = [];
    server.use(
      http.get(`${location.origin}/health/live`, ({ request }) => {
        sent.push(request.headers);
        return live();
      }),
    );

    await unwrap(createApiClient({ locale: 'ar' }).GET('/health/live'));
    expect(sent).toHaveLength(1);
    expect(sent[0]?.has('x-tenant-id')).toBe(false);
    expect(sent[0]?.get('accept-language')).toBe('ar');

    // A caller who adds one is refused before anything is sent.
    const forged = createApiClient({
      locale: 'en',
      headers: { 'X-Tenant-ID': 'tenant-canary' },
    });
    await expect(forged.GET('/health/live')).rejects.toThrow(
      'A request never names its tenant',
    );
    expect(sent).toHaveLength(1);
  });

  it('calls_the_api_on_this_origin_by_default', async () => {
    const urls: string[] = [];
    server.use(
      http.get(`${location.origin}/health/live`, ({ request }) => {
        urls.push(request.url);
        return live();
      }),
    );
    const { data } = await unwrap(
      createApiClient({ locale: 'en' }).GET('/health/live'),
    );
    expect(data.status).toBe('live');
    expect(urls).toEqual([`${location.origin}/health/live`]);
  });
});

import { http, HttpResponse } from 'msw';
import { format } from 'node:util';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../tests/msw/server';
import { apiClient } from './api-client';
import { API_CONFIG } from './constants';

const PASSWORD = 'Canary-password-5e1f!';
const EMAIL = 'member-5e1f@agency.test';

describe('apiClient', () => {
  it('the_web_client_never_logs_a_request_body', async () => {
    // The client used to log bodies in development, so the test runs as development.
    vi.stubEnv('NODE_ENV', 'development');
    const logged: string[] = [];
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logged.push(format(...args));
      });
    }
    server.use(
      http.post(`${API_CONFIG.BASE_URL}/auth/login`, () =>
        HttpResponse.json({ data: { user: { email: EMAIL } } }),
      ),
    );

    const response = await apiClient.post('/auth/login', {
      email: EMAIL,
      password: PASSWORD,
    });

    expect(response).toEqual({ data: { user: { email: EMAIL } } }); // the request really ran
    for (const line of logged) {
      expect(line).not.toContain(PASSWORD);
      expect(line).not.toContain(EMAIL);
    }
  });
});

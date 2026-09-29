import type { RequestHandler } from 'msw';

// The API responses every unit test starts from. A test that needs another
// answer overrides one with `server.use(…)`; tests/setup.ts removes the
// override after that test. Responses follow the API contract: `{ data }`
// on success, RFC 9457 problem details on failure.
export const handlers: RequestHandler[] = [];

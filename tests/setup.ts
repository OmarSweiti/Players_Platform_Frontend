import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

// A request that no handler answers fails the test: a unit test never
// reaches a real network, and a missing handler is loud, not a silent hang.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup(); // Testing Library cleans up by itself only when test globals are on
  server.resetHandlers(); // drop the overrides a test added with server.use(…)
});

afterAll(() => server.close());

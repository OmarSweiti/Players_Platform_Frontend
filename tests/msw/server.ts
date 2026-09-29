import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// One interception server for the whole unit run, started in tests/setup.ts.
export const server = setupServer(...handlers);

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit and component tests live beside the code as src/**/*.test.{ts,tsx}.
// Playwright owns tests/**/*.spec.ts: the globs are disjoint, so neither
// runner ever loads the other's files.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true, // `@/…` resolves exactly as tsconfig.json says
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: false, // an empty suite is a failure, never a pass
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});

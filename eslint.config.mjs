import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The files Next's configs cover — the plugins these rules belong to are
    // registered for them only, and a .cjs tool config would crash ESLint.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    // A zero-warning gate: what is worth reporting is an error, so the
    // baseline in eslint-suppressions.json can record it and only shrink.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'react-hooks/exhaustive-deps': 'error',
      '@next/next/no-img-element': 'error',
      '@next/next/no-location-assign-relative-destination': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Deliberately broken imports for the boundary gate's own test (0.2.10).
    'tests/architecture/fixtures/**',
  ]),
]);

export default eslintConfig;

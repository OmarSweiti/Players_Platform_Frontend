import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Logical CSS only (0.9.3): a physical-direction utility points the wrong way
// in Arabic. Checked where classes are written — className values and the
// arguments of cn, clsx and cva — so prose and props are never caught.
const PHYSICAL_UTILITY =
  '/(^|\\s)([\\w-]+:)*!?-?(m[lr]|p[lr]|scroll-[mp][lr]|left|right|border-[lr]|rounded-[lr]|rounded-[tb][lr]|text-(left|right)|float-(left|right)|clear-(left|right))(-|\\s|$)/';
const PHYSICAL_MESSAGE =
  'A physical direction points the wrong way in Arabic: use the logical utility (ms-/me-, ps-/pe-, start-/end-, border-s/-e, rounded-s/-e, text-start/-end).';
// One selector per kind of string, so a string inside both — a cn() call in a
// className — is reported once.
const CLASS_STRINGS =
  ":matches(JSXAttribute[name.name='className'], CallExpression[callee.name=/^(cn|clsx|cva)$/])";
const physicalUtilities = [
  `${CLASS_STRINGS} Literal[value=${PHYSICAL_UTILITY}]`,
  `${CLASS_STRINGS} TemplateElement[value.raw=${PHYSICAL_UTILITY}]`,
].map((selector) => ({ selector, message: PHYSICAL_MESSAGE }));

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
      'no-restricted-syntax': ['error', ...physicalUtilities],
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

// Module boundaries (0.2.10): a feature is imported only through its
// index.ts, and src/shared imports no feature. The browser boundary — nothing
// under src/server, and nothing that imports `server-only`, reaches a client
// bundle (ADR-0025) — needs the 'use client' directive, which this rule
// language cannot see: scripts/client-boundary.mjs checks it on the same
// graph. `just boundaries` runs both, in `just check` and CI, independently
// of the linter. Violations in code a later step rebuilds are recorded in
// .dependency-cruiser-known-violations.json, which only shrinks.

const PAST_THE_INDEX = {
  path: '^src/features/[^/]+/',
  pathNot: '^src/features/[^/]+/index\\.tsx?$',
};

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'features-meet-through-their-index',
      comment:
        "A feature reaches another feature only through that feature's index.ts.",
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: PAST_THE_INDEX.path,
        pathNot: ['^src/features/$1/', PAST_THE_INDEX.pathNot],
      },
    },
    {
      name: 'the-app-uses-features-through-their-index',
      comment:
        "Routes, layouts and components outside src/features use a feature only through its index.ts.",
      severity: 'error',
      from: { pathNot: '^src/features/' },
      to: PAST_THE_INDEX,
    },
    {
      name: 'shared-imports-no-feature',
      comment:
        'src/shared is what every feature may use; it depends on no feature.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/features/' },
    },
  ],
  options: {
    // Application code only: tests compose what they need.
    exclude: { path: '\\.test\\.tsx?$' },
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true, // a type-only import crosses a boundary too
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
    },
  },
};

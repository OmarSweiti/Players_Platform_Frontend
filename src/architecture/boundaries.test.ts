// @vitest-environment node
import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import extractTSConfig from 'dependency-cruiser/config-utl/extract-ts-config';
import { describe, expect, it } from 'vitest';
import {
  clientBoundaryViolations,
  isClientModule,
} from '../../scripts/client-boundary.mjs';

// The real rules of .dependency-cruiser.cjs and the browser boundary of
// scripts/client-boundary.mjs, run over a fixture tree in which each rule is
// broken exactly once, next to imports they must allow
// (tests/architecture/fixtures).
const FIXTURES = 'tests/architecture/fixtures';

async function cruiseFixtures() {
  const options = await extractDepcruiseOptions('./.dependency-cruiser.cjs');
  const { output } = await cruise(
    ['app', 'src'],
    { ...options, baseDir: FIXTURES },
    undefined,
    { tsConfig: extractTSConfig('tsconfig.json') },
  );
  if (typeof output === 'string') throw new Error('expected a cruise result');
  return output;
}

describe('the module boundary gate', () => {
  it('feature_boundary_gate_rejects_imports_past_an_index', async () => {
    const output = await cruiseFixtures();

    const violations = output.summary.violations
      .map(({ rule, from }) => `${rule.name}: ${from}`)
      .sort();
    expect(violations).toEqual([
      'features-meet-through-their-index: src/features/beta/uses-alpha.ts',
      'shared-imports-no-feature: src/shared/uses-feature.ts',
      'the-app-uses-features-through-their-index: app/past-the-index.tsx',
    ]);
  });

  it('browser_boundary_gate_rejects_server_only_imports', async () => {
    const output = await cruiseFixtures();

    const breaches = clientBoundaryViolations(output.modules, (source) =>
      isClientModule(FIXTURES, source),
    );
    expect(breaches).toEqual([
      'src/components/client-reaches-server-only.tsx → src/lib/secrets.ts (imports server-only)',
      'src/components/client-reaches-server.tsx → src/server/api.ts',
    ]);
  });
});

// Module boundaries (0.2.10): one dependency-cruiser pass over app/ and src/.
// A rule violation that is not in the recorded baseline fails, and so does a
// baseline entry that no longer occurs, until `--prune` drops it — the
// baseline only shrinks. The browser boundary has no baseline: any breach fails.
//   node scripts/check-boundaries.mjs           check
//   node scripts/check-boundaries.mjs --prune   rewrite the baseline without the fixed entries
import { readFile, writeFile } from 'node:fs/promises';
import { cruise } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import extractTSConfig from 'dependency-cruiser/config-utl/extract-ts-config';
import {
  clientBoundaryViolations,
  isClientModule,
} from './client-boundary.mjs';

const CONFIG = './.dependency-cruiser.cjs';
const BASELINE = '.dependency-cruiser-known-violations.json';
const prune = process.argv.includes('--prune');

const options = await extractDepcruiseOptions(CONFIG);
const { output } = await cruise(['app', 'src'], options, undefined, {
  tsConfig: extractTSConfig('tsconfig.json'),
});
const found = output.summary.violations.map(({ rule, from, to }) => ({
  rule: rule.name,
  from,
  to,
}));
const known = JSON.parse(await readFile(BASELINE, 'utf8'));

const key = (v) => `${v.rule}: ${v.from} → ${v.to}`;
const knownKeys = new Set(known.map(key));
const foundKeys = new Set(found.map(key));
const added = found.filter((v) => !knownKeys.has(key(v)));
const fixed = known.filter((v) => !foundKeys.has(key(v)));
const breaches = clientBoundaryViolations(output.modules, (source) =>
  isClientModule('.', source),
);

if (added.length > 0) {
  console.error(
    `boundaries: ${added.length} new violation(s) — see the rule's comment in ${CONFIG}:`,
  );
  for (const v of added) console.error(`  ${key(v)}`);
}
if (breaches.length > 0) {
  console.error(
    `boundaries: ${breaches.length} server-only module(s) reach a client bundle (ADR-0025):`,
  );
  for (const breach of breaches) console.error(`  ${breach}`);
}
if (fixed.length > 0 && prune) {
  const kept = known.filter((v) => foundKeys.has(key(v)));
  await writeFile(BASELINE, `${JSON.stringify(kept, null, 2)}\n`);
  console.log(
    `boundaries: dropped ${fixed.length} fixed violation(s) from ${BASELINE}`,
  );
} else if (fixed.length > 0) {
  console.error(
    `boundaries: ${fixed.length} baseline entr(ies) no longer occur — run \`just boundaries-prune\`:`,
  );
  for (const v of fixed) console.error(`  ${key(v)}`);
}
if (added.length > 0 || breaches.length > 0 || (fixed.length > 0 && !prune)) {
  process.exit(1);
}
console.log(
  `boundaries: ${output.summary.totalCruised} modules, no new violation (${found.length} recorded in ${BASELINE}), no server-only module in a client bundle`,
);

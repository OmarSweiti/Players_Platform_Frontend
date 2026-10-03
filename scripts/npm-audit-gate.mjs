#!/usr/bin/env node
// The npm advisory gate: no high or critical advisory in the lockfile, except a
// reviewed, expiring exception that cannot reach code the app ships.
//
//   node scripts/npm-audit-gate.mjs --allowlist <file> --audit <npm audit --json> --lockfile <package-lock.json>
//   node scripts/npm-audit-gate.mjs --self-test
//
// An advisory passes only if an exception names its advisory id and package,
// the exception has not expired, and npm's lockfile marks EVERY copy of that
// package as development-only ("dev": true) — npm's own computation that no
// runtime dependency reaches it. CI reads the exceptions from the trusted base
// branch, never from the pull request being checked, so a change cannot excuse
// its own advisory. Standard library only.
import { readFileSync } from 'node:fs';

const BLOCKING = new Set(['high', 'critical']);

/** The high and critical advisories in `npm audit --json` output, as {advisory, package, title}. */
export function findings(audit) {
  const out = new Map();
  for (const [name, entry] of Object.entries(audit.vulnerabilities ?? {})) {
    for (const via of entry.via ?? []) {
      if (typeof via !== 'object' || !BLOCKING.has(via.severity)) continue; // a string is a dependent, not a cause
      const advisory =
        /\/advisories\/(GHSA-[\w-]+)/.exec(via.url ?? '')?.[1] ??
        String(via.source);
      const pkg = via.name ?? name;
      out.set(`${advisory} ${pkg}`, {
        advisory,
        package: pkg,
        title: via.title ?? '',
      });
    }
  }
  return [...out.values()];
}

/** Every lockfile entry of a package, wherever it is nested. */
function copiesOf(lockfile, pkg) {
  return Object.entries(lockfile.packages ?? {}).filter(
    ([path]) => path.split('node_modules/').pop() === pkg,
  );
}

/** The findings that block, each with its reason; the exceptions that matched nothing (stale). */
export function evaluate(audit, lockfile, allowlist, today) {
  if (
    audit.error ||
    typeof audit.vulnerabilities !== 'object' ||
    audit.vulnerabilities === null
  ) {
    return {
      blocked: ['the audit produced no report (npm audit failed to run)'],
      stale: [],
    };
  }
  const blocked = [];
  const used = new Set();
  for (const finding of findings(audit)) {
    const where = `${finding.advisory} in ${finding.package}${finding.title ? ` (${finding.title})` : ''}`;
    const exception = allowlist.find(
      (e) => e.advisory === finding.advisory && e.package === finding.package,
    );
    if (!exception) {
      blocked.push(`${where}: no exception`);
      continue;
    }
    used.add(exception);
    if (!exception.expires || !exception.reason) {
      blocked.push(`${where}: the exception needs a reason and an expiry date`);
    } else if (today > exception.expires) {
      blocked.push(`${where}: the exception expired on ${exception.expires}`);
    } else {
      const copies = copiesOf(lockfile, finding.package);
      const runtime = copies
        .filter(([, meta]) => meta.dev !== true)
        .map(([path]) => path);
      if (copies.length === 0)
        blocked.push(
          `${where}: not found in the lockfile, so its reach cannot be proven`,
        );
      else if (runtime.length > 0)
        blocked.push(
          `${where}: reaches code the app ships (${runtime.join(', ')})`,
        );
    }
  }
  const stale = allowlist
    .filter((e) => !used.has(e))
    .map((e) => `${e.advisory} in ${e.package}`);
  return { blocked, stale };
}

function selfTest() {
  const audit = (severity = 'high') => ({
    vulnerabilities: {
      braces: {
        severity,
        via: [
          {
            source: 1,
            name: 'braces',
            severity,
            title: 'stack exhaustion',
            url: 'https://github.com/advisories/GHSA-test-0001-aaaa',
          },
        ],
      },
      micromatch: { severity, via: ['braces'] },
    },
  });
  const lock = (dev) => ({
    packages: {
      '': {},
      'node_modules/braces': { dev },
      'node_modules/micromatch': { dev: true },
    },
  });
  const exception = (overrides = {}) => [
    {
      advisory: 'GHSA-test-0001-aaaa',
      package: 'braces',
      reason: 'dev-only lint path',
      expires: '2026-11-02',
      ...overrides,
    },
  ];
  const cases = [
    [
      'an advisory without an exception blocks',
      evaluate(audit(), lock(true), [], '2026-10-03').blocked.length === 1,
    ],
    [
      'an exception reached only through development tools passes',
      evaluate(audit(), lock(true), exception(), '2026-10-03').blocked
        .length === 0,
    ],
    [
      'an expired exception blocks',
      /expired/.test(
        evaluate(audit(), lock(true), exception(), '2026-11-03').blocked[0] ??
          '',
      ),
    ],
    [
      'an advisory that reaches shipped code blocks despite its exception',
      /reaches code the app ships/.test(
        evaluate(audit(), lock(false), exception(), '2026-10-03').blocked[0] ??
          '',
      ),
    ],
    [
      'a nested runtime copy blocks too',
      /reaches code/.test(
        evaluate(
          audit(),
          {
            packages: {
              'node_modules/braces': { dev: true },
              'node_modules/x/node_modules/braces': {},
            },
          },
          exception(),
          '2026-10-03',
        ).blocked[0] ?? '',
      ),
    ],
    [
      'an exception without a reason blocks',
      /reason/.test(
        evaluate(audit(), lock(true), exception({ reason: '' }), '2026-10-03')
          .blocked[0] ?? '',
      ),
    ],
    [
      'an exception for another advisory does not excuse this one',
      evaluate(
        audit(),
        lock(true),
        exception({ advisory: 'GHSA-other' }),
        '2026-10-03',
      ).blocked.length === 1,
    ],
    [
      'a moderate advisory does not block',
      evaluate(audit('moderate'), lock(false), [], '2026-10-03').blocked
        .length === 0,
    ],
    [
      'an audit that failed to run blocks',
      /no report/.test(
        evaluate(
          { error: { code: 'ENOTFOUND' } },
          lock(true),
          exception(),
          '2026-10-03',
        ).blocked[0] ?? '',
      ),
    ],
    [
      'an unused exception is reported as stale',
      evaluate({ vulnerabilities: {} }, lock(true), exception(), '2026-10-03')
        .stale.length === 1,
    ],
  ];
  let failed = 0;
  for (const [label, ok] of cases) {
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!ok) failed += 1;
  }
  console.log(
    failed
      ? `npm-audit-gate: ${failed} self-test case(s) FAILED`
      : 'npm-audit-gate: every rule refuses what it must',
  );
  return failed ? 1 : 0;
}

function main(argv) {
  if (argv[0] === '--self-test') return selfTest();
  const arg = (flag) => {
    const i = argv.indexOf(flag);
    if (i < 0 || !argv[i + 1]) throw new Error(`missing ${flag} <file>`);
    return argv[i + 1];
  };
  const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
  const today = new Date().toISOString().slice(0, 10);
  const { blocked, stale } = evaluate(
    read(arg('--audit')),
    read(arg('--lockfile')),
    read(arg('--allowlist')),
    today,
  );
  for (const entry of stale)
    console.log(
      `::warning::npm advisory exception ${entry} no longer matches anything: remove it`,
    );
  for (const reason of blocked) console.log(`::error::npm advisory ${reason}`);
  console.log(
    blocked.length
      ? `npm-audit-gate: ${blocked.length} blocking advisory(ies)`
      : 'npm-audit-gate: no blocking advisory',
  );
  return blocked.length ? 1 : 0;
}

process.exitCode = main(process.argv.slice(2));

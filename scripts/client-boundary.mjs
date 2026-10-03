// The browser boundary (0.2.10, ADR-0025): every module a 'use client' module
// imports, directly or not, ships to the browser. None of them may live under
// src/server or import `server-only`. Works on a dependency-cruiser result.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The directive, after nothing but whitespace and comments.
const USE_CLIENT =
  /^(?:\s+|\/\/[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*(['"])use client\1/;

/**
 * Whether the file at `source` (relative to `baseDir`) starts with 'use client'.
 * @param {string} baseDir
 * @param {string} source
 * @returns {boolean}
 */
export function isClientModule(baseDir, source) {
  return USE_CLIENT.test(readFileSync(join(baseDir, source), 'utf8'));
}

/**
 * Each pair of a client module and a server-only module it reaches, as
 * `client → server module`, sorted.
 * @param {{ source: string, dependencies?: { module: string, resolved: string }[] }[]} modules a cruise result's modules
 * @param {(source: string) => boolean} isClient
 * @returns {string[]}
 */
export function clientBoundaryViolations(modules, isClient) {
  const bySource = new Map(modules.map((entry) => [entry.source, entry]));
  const found = new Set();
  // Roots are the application's own files; packages are never read.
  const roots = modules.filter(
    (entry) => /^(app|src)\//.test(entry.source) && isClient(entry.source),
  );
  for (const root of roots) {
    const seen = new Set([root.source]);
    const queue = [root.source];
    while (queue.length > 0) {
      const source = queue.shift();
      const entry = bySource.get(source);
      if (source.startsWith('src/server/'))
        found.add(`${root.source} → ${source}`);
      for (const dependency of entry?.dependencies ?? []) {
        if (dependency.module === 'server-only') {
          found.add(`${root.source} → ${source} (imports server-only)`);
        }
        if (
          bySource.has(dependency.resolved) &&
          !seen.has(dependency.resolved)
        ) {
          seen.add(dependency.resolved);
          queue.push(dependency.resolved);
        }
      }
    }
  }
  return [...found].sort();
}

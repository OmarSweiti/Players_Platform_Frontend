#!/usr/bin/env node
// The API contract the web app is typed against (0.9.4). openapi/openapi.json
// is the backend's committed contract, byte for byte, at the backend commit
// openapi/source.json records; the client's types (src/shared/api/schema.d.ts,
// `npm run api:generate`) come from it and from nothing else — never from a
// running server.
//
//   node scripts/contract.mjs sync <backend-commit>   copy the contract at that commit, and record where it came from
//   node scripts/contract.mjs verify                  the copy is intact, and is the backend's at that commit
//   node scripts/contract.mjs --self-test
//
// A commit is a full 40-character SHA: a branch moves, so it proves nothing.
// The copy is read from GitHub, so the commit must be pushed. Standard library
// only.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

export const REPOSITORY = 'OmarSweiti/Players_Platform_Backend';
/** The contract's path, in the backend and here alike. */
export const CONTRACT = 'openapi/openapi.json';
export const SOURCE = 'openapi/source.json';

const COMMIT = /^[0-9a-f]{40}$/;

export const sha256 = (text) =>
  createHash('sha256').update(text).digest('hex');

export const urlOf = (commit) =>
  `https://raw.githubusercontent.com/${REPOSITORY}/${commit}/${CONTRACT}`;

/** What `source.json` says about a copy of the contract fetched at `commit`. */
export function sourceOf(commit, text) {
  return { repository: REPOSITORY, commit, path: CONTRACT, sha256: sha256(text) };
}

/**
 * Why this copy cannot be trusted, or [] when it is the backend's contract at
 * the commit its source names. `fetchText` reads a URL.
 */
export async function problemsWith({ contract, source, fetchText }) {
  const problems = [];
  if (!COMMIT.test(source.commit ?? '')) {
    problems.push(`${SOURCE} names no full commit SHA`);
  }
  if (source.repository !== REPOSITORY || source.path !== CONTRACT) {
    problems.push(`${SOURCE} names another file than ${REPOSITORY}'s ${CONTRACT}`);
  }
  if (sha256(contract) !== source.sha256) {
    problems.push(`${CONTRACT} was edited: it is not the copy ${SOURCE} records`);
  }
  if (problems.length > 0) return problems;
  if (sha256(await fetchText(urlOf(source.commit))) !== source.sha256) {
    problems.push(`${CONTRACT} is not the backend's contract at ${source.commit}`);
  }
  return problems;
}

/** The contract at `commit`, checked to be an OpenAPI 3.1 document. */
export async function fetchContract(commit, fetchText) {
  if (!COMMIT.test(commit ?? '')) {
    throw new Error('name the backend commit by its full 40-character SHA');
  }
  const text = await fetchText(urlOf(commit));
  let document;
  try {
    document = JSON.parse(text);
  } catch {
    throw new Error(`${urlOf(commit)} is not JSON`);
  }
  if (!String(document?.openapi ?? '').startsWith('3.1.')) {
    throw new Error(`${urlOf(commit)} is not an OpenAPI 3.1 document`);
  }
  return text;
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'error' });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.text();
}

async function selfTest() {
  const commit = 'f'.repeat(40);
  const contract = '{"openapi":"3.1.0","info":{"title":"t","version":"1"},"paths":{}}\n';
  const backend = (text) => async (url) => {
    if (url !== urlOf(commit)) throw new Error(`unexpected ${url}`);
    return text;
  };
  const cases = [
    ['an intact copy of the recorded commit', 0, { contract, source: sourceOf(commit, contract), fetchText: backend(contract) }],
    ['an edited copy', 1, { contract: contract.replace('"t"', '"edited"'), source: sourceOf(commit, contract), fetchText: backend(contract) }],
    ['a copy the backend never had at that commit', 1, { contract, source: sourceOf(commit, contract), fetchText: backend(contract.replace('"t"', '"other"')) }],
    ['a branch instead of a commit', 1, { contract, source: { ...sourceOf(commit, contract), commit: 'development' }, fetchText: backend(contract) }],
    ['another repository', 1, { contract, source: { ...sourceOf(commit, contract), repository: 'someone/else' }, fetchText: backend(contract) }],
  ];
  let failed = 0;
  console.log('the API contract');
  for (const [label, refused, input] of cases) {
    const ok = (await problemsWith(input)).length > 0 === Boolean(refused);
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!ok) failed += 1;
  }
  for (const [label, args] of [
    ['syncing a branch', ['development', backend(contract)]],
    ['syncing a page that is not a contract', [commit, backend('<html>')]],
  ]) {
    const refused = await fetchContract(...args).then(
      () => false,
      () => true,
    );
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!refused) failed += 1;
  }
  console.log(
    failed
      ? `contract: ${failed} self-test case(s) FAILED`
      : 'contract: every rule refuses what it must',
  );
  return failed ? 1 : 0;
}

async function main([command, commit]) {
  if (command === '--self-test') return selfTest();
  if (command === 'sync') {
    const text = await fetchContract(commit, fetchText);
    writeFileSync(CONTRACT, text);
    writeFileSync(SOURCE, `${JSON.stringify(sourceOf(commit, text), null, 2)}\n`);
    console.log(`contract: ${CONTRACT} is the backend's at ${commit}; now run npm run api:generate`);
    return 0;
  }
  if (command === 'verify') {
    const problems = await problemsWith({
      contract: readFileSync(CONTRACT, 'utf8'),
      source: JSON.parse(readFileSync(SOURCE, 'utf8')),
      fetchText,
    });
    for (const problem of problems) console.log(`::error::contract: ${problem}`);
    if (problems.length === 0) {
      const { commit: recorded } = JSON.parse(readFileSync(SOURCE, 'utf8'));
      console.log(`contract: ${CONTRACT} is the backend's at ${recorded}`);
    }
    return problems.length ? 1 : 0;
  }
  console.error('usage: contract.mjs sync <backend-commit> | verify | --self-test');
  return 2;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(`contract: ${error.message}`);
    process.exitCode = 1;
  },
);

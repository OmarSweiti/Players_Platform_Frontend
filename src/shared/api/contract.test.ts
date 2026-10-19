// @vitest-environment node
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import openapiTS, { astToString, type OpenAPI3 } from 'openapi-typescript';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const committed = JSON.parse(
  readFileSync('openapi/openapi.json', 'utf8'),
) as OpenAPI3 & {
  paths: Record<string, unknown>;
  components: {
    schemas: Record<
      string,
      { properties: Record<string, unknown>; required: string[] }
    >;
  };
};

// One call, written as the committed contract describes it.
const PROBE = `
import createClient from 'openapi-fetch';
import type { paths } from './schema';

const api = createClient<paths>({ baseUrl: 'https://api.sadara.test' });

export async function probe(): Promise<'live' | undefined> {
  const { data } = await api.GET('/health/live');
  return data?.data.status;
}
`;

/** The type errors the probe has against the client generated from `contract`. */
async function typeErrorsAgainst(contract: OpenAPI3): Promise<string[]> {
  // Inside the project, so the probe resolves openapi-fetch as the app does.
  const cache = join(process.cwd(), 'node_modules', '.cache');
  mkdirSync(cache, { recursive: true });
  const dir = mkdtempSync(join(cache, 'contract-probe-'));
  try {
    writeFileSync(
      join(dir, 'schema.d.ts'),
      astToString(await openapiTS(contract)),
    );
    writeFileSync(join(dir, 'probe.ts'), PROBE);
    const program = ts.createProgram([join(dir, 'probe.ts')], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      types: [],
    });
    return ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('the typed client', () => {
  it('a_contract_change_breaks_the_typecheck', async () => {
    // As committed, the call type-checks.
    expect(await typeErrorsAgainst(committed)).toEqual([]);

    // The route is removed.
    const removed = structuredClone(committed);
    delete removed.paths['/health/live'];
    expect(await typeErrorsAgainst(removed)).not.toEqual([]);

    // A field the call reads is renamed.
    const renamed = structuredClone(committed);
    const live = renamed.components.schemas.Live;
    live.properties = { state: live.properties.status };
    live.required = ['state'];
    expect(await typeErrorsAgainst(renamed)).not.toEqual([]);
  }, 60_000);
});

// @vitest-environment node
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Logical CSS only (0.9.3): the project's own ESLint configuration refuses a
// physical-direction utility wherever classes are written.

const eslint = new ESLint();

async function physicalFindings(code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, {
    filePath: 'src/shared/ui/probe.tsx',
  });
  return result.messages
    .filter(({ ruleId }) => ruleId === 'no-restricted-syntax')
    .map(({ message }) => message);
}

describe('logical CSS', () => {
  it('the_lint_refuses_a_physical_margin', async () => {
    for (const code of [
      'export const A = () => <div className="ml-4" />;',
      'export const B = () => <div className="flex lg:-mr-2" />;',
      "export const C = () => <div className={cn('p-2', 'pl-3')} />;",
      'export const D = ({ x }: { x: string }) => <div className={`text-right ${x}`} />;',
      "export const E = cva('rounded-l-md border-r');",
    ]) {
      expect([code, (await physicalFindings(code)).length]).toEqual([code, 1]);
    }
  }, 30_000);

  it('lets logical and symmetric utilities, prose and props through', async () => {
    for (const code of [
      'export const A = () => <div className="ms-4 pe-2 start-0 border-e rounded-s-md text-start mx-auto px-4" />;',
      'export const B = () => <p title="left or right">{t(\'left\')}</p>;',
      'export const C = () => <Popover side="left" />;',
    ]) {
      expect([code, await physicalFindings(code)]).toEqual([code, []]);
    }
  }, 30_000);
});

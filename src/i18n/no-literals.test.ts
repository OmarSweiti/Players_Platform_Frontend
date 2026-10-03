// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Every user-facing string comes from the catalogs (0.9.2): a component
// renders no letter it did not get from them.

const ROOTS = ['app', 'src'];
const USER_FACING_ATTRIBUTES = new Set([
  'alt',
  'aria-description',
  'aria-label',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
  'label',
  'placeholder',
  'title',
]);
const LETTER = /\p{L}/u;

function componentFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return componentFiles(path);
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [path] : [];
  });
}

/**
 * Whether a string literal is rendered: it reaches JSX children only through
 * the branches of `?:`, `&&`, `||` or `??` — never as a call's argument such
 * as t('key'), an attribute, a comparison or a condition.
 */
function isRendered(node: ts.Node): boolean {
  let child: ts.Node = node;
  for (
    let parent = node.parent;
    parent;
    child = parent, parent = parent.parent
  ) {
    if (
      ts.isCallExpression(parent) ||
      ts.isJsxAttribute(parent) ||
      ts.isElementAccessExpression(parent)
    ) {
      return false;
    }
    if (ts.isBinaryExpression(parent)) {
      const kind = parent.operatorToken.kind;
      const logical =
        kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        kind === ts.SyntaxKind.BarBarToken ||
        kind === ts.SyntaxKind.QuestionQuestionToken;
      if (!logical) return false; // a comparison or arithmetic: a value
      if (
        kind === ts.SyntaxKind.AmpersandAmpersandToken &&
        parent.left === child
      ) {
        return false; // the condition of `cond && <x />`
      }
    }
    if (ts.isConditionalExpression(parent) && parent.condition === child) {
      return false;
    }
    if (ts.isJsxExpression(parent)) {
      return ts.isJsxElement(parent.parent) || ts.isJsxFragment(parent.parent);
    }
  }
  return false;
}

function literalsIn(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found: string[] = [];
  const report = (node: ts.Node, text: string) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    found.push(`${file}:${line + 1}  ${JSON.stringify(text.trim())}`);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && LETTER.test(node.text)) report(node, node.text);
    if (
      ts.isJsxAttribute(node) &&
      USER_FACING_ATTRIBUTES.has(node.name.getText()) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      LETTER.test(node.initializer.text)
    ) {
      report(node, `${node.name.getText()}=${node.initializer.text}`);
    }
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      LETTER.test(node.text) &&
      isRendered(node)
    ) {
      report(node, node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe('user-facing text', () => {
  it('no_user_facing_literal_remains', () => {
    const files = ROOTS.flatMap(componentFiles);
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(literalsIn)).toEqual([]);
  });

  it('finds a literal in text, in a labelling attribute and in a rendered expression', () => {
    const probe = join(process.cwd(), 'src', 'i18n', '__probe__.tsx');
    const lines = [
      'export const A = () => <p>Hello</p>;',
      'export const B = () => <img alt="A player" src="/p.png" />;',
      "export const C = ({ busy }: { busy: boolean }) => <span>{busy ? 'Saving' : t('save')}</span>;",
      'export const D = () => <span className="text-sm">{t(\'ok\')}</span>;',
      "export const E = () => <div>{process.env.NODE_ENV === 'development' && <i />}</div>;",
      "export const F = ({ name }: { name?: string }) => <b>{name ?? 'Unknown'}</b>;",
    ];
    const source = ts.createSourceFile(
      probe,
      lines.join('\n'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const found: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isJsxText(node) && LETTER.test(node.text))
        found.push(node.text.trim());
      if (
        ts.isJsxAttribute(node) &&
        USER_FACING_ATTRIBUTES.has(node.name.getText()) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      )
        found.push(node.initializer.text);
      if (
        ts.isStringLiteral(node) &&
        LETTER.test(node.text) &&
        isRendered(node)
      )
        found.push(node.text);
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(found).toEqual(['Hello', 'A player', 'Saving', 'Unknown']);
  });
});

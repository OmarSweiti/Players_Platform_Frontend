// @vitest-environment node
import {
  parse,
  TYPE,
  type MessageFormatElement,
} from '@formatjs/icu-messageformat-parser';
import { describe, expect, it } from 'vitest';
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';

const CATALOGS = { ar, en };

/** Every message of a catalog, by its dotted key. */
function flatten(tree: object, prefix = ''): Map<string, string> {
  const messages = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') messages.set(path, value);
    else
      for (const entry of flatten(value as object, path))
        messages.set(...entry);
  }
  return messages;
}

/**
 * The plural categories of `locale` a message leaves out — Arabic has six
 * (zero, one, two, few, many, other), English two.
 */
function missingPluralCategories(message: string, locale: string): string[] {
  const required = new Intl.PluralRules(locale).resolvedOptions()
    .pluralCategories;
  const missing: string[] = [];
  const walk = (elements: MessageFormatElement[]) => {
    for (const element of elements) {
      if (element.type === TYPE.plural) {
        for (const category of required) {
          if (!(category in element.options)) {
            missing.push(`${element.value}: ${category}`);
          }
        }
      }
      if (element.type === TYPE.plural || element.type === TYPE.select) {
        for (const option of Object.values(element.options)) walk(option.value);
      }
      if (element.type === TYPE.tag) walk(element.children);
    }
  };
  walk(parse(message));
  return missing.sort();
}

describe('the message catalogs', () => {
  it('the_catalogs_have_identical_keys', () => {
    const [arabic, english] = [flatten(CATALOGS.ar), flatten(CATALOGS.en)];
    expect([...arabic.keys()].sort()).toEqual([...english.keys()].sort());

    for (const [locale, catalog] of Object.entries(CATALOGS)) {
      for (const [key, message] of flatten(catalog)) {
        expect(message.trim(), `${locale}: ${key}`).not.toBe('');
        expect(
          missingPluralCategories(message, locale),
          `${locale}: ${key}`,
        ).toEqual([]);
      }
    }
  });

  it('refuses a plural that leaves out one of the language’s categories', () => {
    const englishOnly = '{count, plural, one {# player} other {# players}}';
    expect(missingPluralCategories(englishOnly, 'en')).toEqual([]);
    expect(missingPluralCategories(englishOnly, 'ar')).toEqual([
      'count: few',
      'count: many',
      'count: two',
      'count: zero',
    ]);

    const arabic =
      '{count, plural, zero {لا لاعبين} one {لاعب واحد} two {لاعبان} few {# لاعبين} many {# لاعبًا} other {# لاعب}}';
    expect(missingPluralCategories(arabic, 'ar')).toEqual([]);
  });
});

import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Bidi } from './bidi';

describe('Bidi', () => {
  it('a_mixed_identifier_does_not_reorder_in_arabic', () => {
    render(
      <p dir="rtl" lang="ar">
        رقم اللاعب <Bidi>12-AB</Bidi> مسجّل
      </p>,
    );

    // The token sits in an isolate of its own, left to right, and keeps its
    // characters in their logical order; the browser lays it out as a unit
    // (tests/e2e/bidi.spec.ts measures that on screen).
    const token = screen.getByText('12-AB');
    expect(token.tagName).toBe('BDI');
    expect(token).toHaveAttribute('dir', 'ltr');
    expect(token.closest('p')).toHaveAttribute('dir', 'rtl');

    // The exact markup the on-screen test measures.
    expect(renderToStaticMarkup(<Bidi>12-AB</Bidi>)).toBe(
      '<bdi dir="ltr">12-AB</bdi>',
    );
  });
});

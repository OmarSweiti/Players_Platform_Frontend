import type { ReactNode } from 'react';

/**
 * Keeps a token in its own direction inside text of the other script:
 * identifiers, emails, URLs and mixed Latin numbers inside Arabic, so that
 * "AB-12/34" never reads "34/12-AB" (docs/reference/ui-ux.md). `<bdi>`
 * isolates the token from the text around it, in both directions.
 */
export function Bidi({
  children,
  dir = 'ltr',
}: {
  children: ReactNode;
  dir?: 'ltr' | 'rtl' | 'auto';
}) {
  return <bdi dir={dir}>{children}</bdi>;
}

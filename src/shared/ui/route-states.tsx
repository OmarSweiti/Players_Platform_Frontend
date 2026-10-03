'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from './button';

// The loading, error and not-found states every route segment has (0.9.1).
// 0.9.6 grows them into the shell's shared states.

export function RouteLoading() {
  return (
    <div role="status" aria-live="polite" className="p-6 text-muted-foreground">
      Loading…
    </div>
  );
}

// No logging here: an error can carry personal data, and the browser console
// is no place for it (0.1.4).
export function RouteError({ retry }: { error: Error; retry: () => void }) {
  return (
    <div role="alert" className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        This page could not be shown. Try again in a moment.
      </p>
      <Button type="button" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}

export function RouteNotFound() {
  const { locale } = useParams<{ locale?: string }>();
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">There is no page at this address.</p>
      <Link
        // Outside a locale, `/` is the proxy's: it leads to the default locale.
        href={locale ? `/${locale}` : ('/' as Route)}
        className="underline underline-offset-4"
      >
        Go to the home page
      </Link>
    </div>
  );
}

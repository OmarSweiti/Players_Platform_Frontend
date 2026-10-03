'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from './button';

// The loading, error and not-found states every route segment has (0.9.1).
// 0.9.6 grows them into the shell's shared states.

export function RouteLoading() {
  const t = useTranslations('states');
  return (
    <div role="status" aria-live="polite" className="p-6 text-muted-foreground">
      {t('loading')}
    </div>
  );
}

// No logging here: an error can carry personal data, and the browser console
// is no place for it (0.1.4).
export function RouteError({ retry }: { error: Error; retry: () => void }) {
  const t = useTranslations('states.error');
  return (
    <div role="alert" className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      <Button type="button" onClick={() => retry()}>
        {t('retry')}
      </Button>
    </div>
  );
}

export function RouteNotFound() {
  const t = useTranslations('states.notFound');
  const { locale } = useParams<{ locale?: string }>();
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      <Link
        // Outside a locale, `/` is the proxy's: it leads to a locale.
        href={locale ? `/${locale}` : ('/' as Route)}
        className="underline underline-offset-4"
      >
        {t('home')}
      </Link>
    </div>
  );
}

import { getTranslations } from 'next-intl/server';

// Home. No placeholder metrics or actions that do nothing (docs/reference/
// ui-ux.md): the home dashboard arrives with 1.8.2.
export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}

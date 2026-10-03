import { getTranslations } from 'next-intl/server';

export default async function LegalPage() {
  const t = await getTranslations('legal');

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}

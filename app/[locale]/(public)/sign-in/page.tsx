import { getTranslations } from 'next-intl/server';
import { Button } from '@/shared/ui';

// One entry: the agency's identity provider signs members in, so no page of
// ours collects a password or a second factor. The button is wired to the
// provider in 0.9.5.
export default async function SignInPage() {
  const t = await getTranslations('signIn');

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <Button type="button" className="w-full" disabled>
        {t('action')}
      </Button>
    </div>
  );
}

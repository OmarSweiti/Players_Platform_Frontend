import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';

// Every route lives under a supported locale (0.9.1); the proxy prefixes any
// other path with the default one, so an unknown locale is a missing page.
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}

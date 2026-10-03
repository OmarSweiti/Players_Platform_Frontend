import type { Metadata } from 'next';
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';
import { QueryProvider, AuthProvider } from '@/components/providers';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { directionOf } from '@/i18n/locales';

// The typefaces, both under the SIL Open Font License 1.1 and self-hosted by
// next/font at build time: Geist for Latin script, IBM Plex Sans Arabic for
// Arabic. globals.css orders the stack so each glyph comes from its own face
// (arabic_and_latin_text_use_their_typefaces).
const latin = Geist({
  variable: '--font-latin',
  subsets: ['latin'],
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
});

const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');
  return { title: t('title'), description: t('description') };
}

// The root layout, above /{locale} so that app/not-found.tsx answers every
// unmatched address inside it. `lang` and `dir` come from the request's
// locale on the server, so Arabic never flashes left to right (0.9.2).
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${latin.variable} ${arabic.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Scale,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useLogout, useAuth } from '@/features/auth';

// Features by noun, under the locale (0.9.1). A link to a route that does
// not exist fails the type-check (typedRoutes); areas without routes yet
// join with their pages.
const navigationFor = (locale: string) =>
  [
    { key: 'home', href: `/${locale}` as const, icon: LayoutDashboard },
    { key: 'players', href: `/${locale}/players` as const, icon: Users },
    {
      key: 'contracts',
      href: `/${locale}/contracts` as const,
      icon: FileText,
    },
    { key: 'legal', href: `/${locale}/legal` as const, icon: Scale },
    { key: 'settings', href: `/${locale}/settings` as const, icon: Settings },
  ] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const navigation = navigationFor(locale);
  const t = useTranslations('navigation');
  const tApp = useTranslations('app');
  const { user } = useAuth();
  const logoutMutation = useLogout();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-bold text-xl"
        >
          {tApp('name')}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${locale}` &&
                pathname.startsWith(item.href + '/'));
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="mb-4 px-3">
          <p className="text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? t('loggingOut') : t('logout')}
        </Button>
      </div>
    </aside>
  );
}

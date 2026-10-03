'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const t = useTranslations('navigation');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('toggleMenu')}</span>
      </Button>

      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>

      <div className="flex items-center gap-4">
        {/* Can add notifications, user menu, etc. */}
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/lib/constants';
import {
  LayoutDashboard,
  Users,
  FileText,
  Dumbbell,
  TrendingUp,
  Scale,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useLogout, useAuth } from '@/features/auth';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Players', href: ROUTES.PLAYERS, icon: Users },
  { name: 'Contracts', href: ROUTES.CONTRACTS, icon: FileText },
  { name: 'Training', href: ROUTES.TRAINING, icon: Dumbbell },
  { name: 'Performance', href: ROUTES.PERFORMANCE, icon: TrendingUp },
  { name: 'Legal', href: ROUTES.LEGAL, icon: Scale },
  { name: 'Chat', href: ROUTES.CHAT, icon: MessageSquare },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 font-bold text-xl"
        >
          ⚽ Players Platform
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
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
                  {item.name}
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
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </aside>
  );
}

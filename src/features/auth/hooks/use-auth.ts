'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Sign out, as far as the browser can today: forget every cached query, then
 * return to sign-in. The API has no sign-out yet (`0.5.7`); `0.9.5` calls it
 * through the generated client and then the provider's sign-out.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  return useCallback(() => {
    queryClient.clear();
    router.push(`/${locale}/sign-in`);
  }, [queryClient, router, locale]);
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const signIn = `/${locale}/sign-in` as const;

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();

      // Use Next.js router for proper navigation
      router.push(signIn);
    },
    onError: () => {
      // Even if logout API fails, clear local state and redirect
      queryClient.clear();
      router.push(signIn);
    },
  });
}

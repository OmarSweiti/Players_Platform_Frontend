'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { ROUTES } from '@/shared/lib/constants';

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();

      // Use Next.js router for proper navigation
      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      // Even if logout API fails, clear local state and redirect
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

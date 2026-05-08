'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { queryKeys } from '@/shared/lib/query-keys';
import { ROUTES } from '@/shared/lib/constants';

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      // Invalidate and refetch current user query
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      
      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // Invalidate and refetch current user query
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
      
      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    },
  });
}

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
      
      // Redirect to login
      router.push(ROUTES.LOGIN);
    },
  });
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

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
    // Only run query if we have auth cookies (checked via a simple heuristic)
    // This prevents unnecessary API calls on public routes like /login
    enabled: typeof window !== 'undefined' && 
             (document.cookie.includes('accessToken') || 
              document.cookie.includes('refreshToken') ||
              document.cookie.includes('auth_token')),
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

/**
 * Hook for reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}

/**
 * Hook for change password
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
}

/**
 * Hook for verify email
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
}

/**
 * Hook for resend verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: authApi.resendVerification,
  });
}

/**
 * Hook for enabling 2FA
 */
export function useEnable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: () => {
      // Invalidate current user query to reflect updated 2FA status
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
}

/**
 * Hook for verifying 2FA
 */
export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verify2FA,
    onSuccess: () => {
      // Invalidate current user query to reflect updated 2FA status
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
}

/**
 * Hook for disabling 2FA
 */
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.disable2FA,
    onSuccess: () => {
      // Invalidate current user query to reflect updated 2FA status
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
}

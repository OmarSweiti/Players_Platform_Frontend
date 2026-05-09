import type { UserRole } from '@/shared/types';

/**
 * User entity matching backend structure
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  is2FAEnabled: boolean;
  twoFASecret?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response from login/register
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Login credentials
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Forgot password payload
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * Reset password payload
 */
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

/**
 * Change password payload
 */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Resend verification payload
 */
export interface ResendVerificationPayload {
  email: string;
}

/**
 * Session state
 */
export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import type {
  AuthResponse,
  LoginPayload,
  RefreshTokenResponse,
  RegisterPayload,
  User,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  ResendVerificationPayload,
} from '../types/auth.types';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Login user
   */
  login: (data: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  /**
   * Register new user
   */
  register: (data: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  /**
   * Logout user
   */
  logout: (): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Refresh authentication token
   */
  refreshToken: (): Promise<ApiResponse<RefreshTokenResponse>> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Request password reset email
   */
  forgotPassword: (
    data: ForgotPasswordPayload,
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   */
  resetPassword: (
    data: ResetPasswordPayload,
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/reset-password', data);
  },

  /**
   * Change password for logged-in user
   */
  changePassword: (
    data: ChangePasswordPayload,
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/change-password', data);
  },

  /**
   * Verify email with token
   */
  verifyEmail: (token: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.get(`/auth/verify-email?token=${token}`);
  },

  /**
   * Resend verification email
   */
  resendVerification: (
    data: ResendVerificationPayload,
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/resend-verification', data);
  },

  /**
   * Enable 2FA - generates QR code
   */
  enable2FA: (): Promise<
    ApiResponse<{ secret: string; qrCode: string; message: string }>
  > => {
    return apiClient.post('/auth/2fa/enable');
  },

  /**
   * Verify and enable 2FA
   */
  verify2FA: (data: {
    token: string;
  }): Promise<ApiResponse<{ message: string; is2FAEnabled: boolean }>> => {
    return apiClient.post('/auth/2fa/verify', data);
  },

  /**
   * Disable 2FA
   */
  disable2FA: (data: {
    token: string;
  }): Promise<ApiResponse<{ message: string; is2FAEnabled: boolean }>> => {
    return apiClient.post('/auth/2fa/disable', data);
  },

  /**
   * Get active sessions
   */
  getActiveSessions: (): Promise<
    ApiResponse<
      Array<{
        id: string;
        deviceInfo: string;
        ipAddress: string;
        lastAccessedAt: string;
        createdAt: string;
        isCurrent: boolean;
      }>
    >
  > => {
    return apiClient.get('/auth/sessions');
  },

  /**
   * Revoke a specific session
   */
  revokeSession: (
    sessionId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post(`/auth/sessions/${sessionId}/revoke`);
  },

  /**
   * Logout from all devices
   */
  logoutAllDevices: (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post('/auth/logout-all');
  },
};

import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import type {
  AuthResponse,
  LoginPayload,
  RefreshTokenResponse,
  RegisterPayload,
  User,
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
};

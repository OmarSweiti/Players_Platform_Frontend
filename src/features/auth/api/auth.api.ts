import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';

/**
 * What remains of the local authentication endpoints in the browser. Signing
 * in, passwords and second factors belong to the identity provider (0.1.7);
 * the session arrives with 0.9.5.
 */
export const authApi = {
  /**
   * Logout user
   */
  logout: (): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout');
  },
};

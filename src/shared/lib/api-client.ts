import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/shared/lib/constants';
import type { ApiResponse } from '@/shared/types';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Array<{ field?: string; message: string; code?: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Production-grade API client with interceptors
 * 
 * Features:
 * - Automatic tenant ID injection
 * - Token refresh handling
 * - Centralized error handling
 * - Request/response logging in development
 * - Timeout configuration
 */
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: true, // Important for HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Inject tenant ID from localStorage (non-sensitive)
        const tenantId = this.getTenantId();
        if (tenantId && config.headers) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response] ${response.status} ${response.config.url}`, {
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            await this.refreshToken();
            
            // Process queued requests
            this.processQueue(null);
            
            // Retry original request
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            
            // Auto-logout: Clear client-side state and redirect
            this.handleAutoLogout();
            
            return Promise.reject(new ApiError(
              401,
              'Authentication expired. Please log in again.',
              undefined
            ));
          } finally {
            this.isRefreshing = false;
          }
        }

        // Transform error to our custom ApiError
        const apiError = new ApiError(
          error.response?.status || 500,
          error.response?.data?.message || error.message || 'An unexpected error occurred',
          error.response?.data?.errors
        );

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: unknown): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Get tenant ID from localStorage
   */
  private getTenantId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.TENANT_ID);
  }

  /**
   * Handle auto-logout on authentication failure
   * Clears client-side state and redirects to login page
   */
  private handleAutoLogout(): void {
    if (typeof window === 'undefined') return;

    console.warn('[Auth] Auto-logout triggered: Authentication expired');

    // Clear non-sensitive client-side state
    localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    
    // Optionally clear other app state
    sessionStorage.clear();

    // Show user-friendly message
    if (typeof window !== 'undefined') {
      // Store logout reason for displaying on login page
      sessionStorage.setItem('logout_reason', 'session_expired');
      
      // Redirect to login using Next.js router (preserves SPA behavior)
      // Use window.location for full page reload to clear any cached state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    // The backend handles refresh via HTTP-only cookies
    // This just triggers the refresh endpoint
    await axios.post(
      `${API_CONFIG.BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * File upload with FormData
   */
  async upload<T = unknown>(url: string, formData: FormData, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Expose the raw axios instance for advanced use cases
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Singleton instance
export const apiClient = new ApiClient();
export default apiClient;

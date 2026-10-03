/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  // Every API route is versioned: /api/v1/… (backend 0.3.3)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 1,
} as const;

/**
 * Storage Keys (for non-sensitive data only)
 */
export const STORAGE_KEYS = {
  TENANT_ID: 'tenantId',
  THEME: 'theme',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

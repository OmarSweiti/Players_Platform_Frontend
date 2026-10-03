/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 1,
} as const;

/**
 * Application Constants
 */
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Players Platform',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@playersplatform.com',
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

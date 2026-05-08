/**
 * Common types used across the application
 */

// User roles (must match backend enum)
export type UserRole = 'ADMIN' | 'AGENT' | 'PLAYER' | 'STAFF';

// Tenant context
export interface TenantContext {
  tenantId: string;
  name: string;
}

// Generic entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// File upload result
export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
}

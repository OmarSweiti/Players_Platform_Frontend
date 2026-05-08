/**
 * Common types used across the application
 */

// User roles (must match backend enum)
export type UserRole = 
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'ADMIN'
  | 'SPORTING_DIRECTOR'
  | 'SCOUT'
  | 'COACH'
  | 'ASSISTANT_COACH'
  | 'GOALKEEPER_COACH'
  | 'FITNESS_COACH'
  | 'MEDICAL'
  | 'PHYSIOTHERAPIST'
  | 'LEGAL'
  | 'FINANCE_MANAGER'
  | 'PERFORMANCE_ANALYST'
  | 'VIDEO_ANALYST'
  | 'TRAINING_MANAGER'
  | 'PLAYER'
  | 'GUARDIAN';

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

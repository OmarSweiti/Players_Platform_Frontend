import type { UserRole } from '@/shared/types';

/**
 * User entity matching backend structure. No credential or second-factor
 * field: those belong to the identity provider (0.1.7).
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
  createdAt: string;
  updatedAt: string;
}

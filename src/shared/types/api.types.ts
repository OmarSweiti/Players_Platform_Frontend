/**
 * Standardized API Response Types
 */

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: ApiError[];
  timestamp: string;
}

// Error structure
export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Query parameters for list endpoints
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

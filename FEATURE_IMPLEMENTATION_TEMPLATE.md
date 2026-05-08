# Frontend Feature Implementation Prompt Template

**Copy and paste this template for EVERY new frontend feature request. Fill in the `[FEATURE DETAILS]` section with your specific requirements.**

---

## 🎯 Feature Request

**Feature Name**: [e.g., "Player Management - List & Detail View"]

**Description**: 
[Describe what this feature should do in 2-3 sentences]

**User Stories**:
- As a [user role], I want to [action] so that [benefit]
- As a [user role], I want to [action] so that [benefit]

**Backend API Endpoints** (if already implemented):
- `GET /api/[endpoint]` - [description]
- `POST /api/[endpoint]` - [description]
- `PUT /api/[endpoint]/:id` - [description]
- `DELETE /api/[endpoint]/:id` - [description]

**Expected Behavior**:
[List key interactions and expected outcomes]

---

## ✅ Architecture Compliance Checklist

Before implementing, verify the feature follows these standards:

### 1. **Feature-Sliced Structure**
- [ ] Create feature folder under `src/features/[feature-name]/`
- [ ] Follow standard subfolder structure: `api/`, `hooks/`, `types/`, `components/`
- [ ] Create barrel export in `index.ts`
- [ ] No cross-feature imports (only import from `@/shared/*`)

### 2. **Type Safety First**
- [ ] Define TypeScript interfaces in `types/[feature].types.ts`
- [ ] Match backend response structures exactly
- [ ] Use existing shared types where applicable (`BaseEntity`, `ApiResponse`, etc.)
- [ ] Zero `any` types allowed
- [ ] Export types from feature's `index.ts`

### 3. **API Layer Pattern**
- [ ] Create API service in `api/[feature].api.ts`
- [ ] Use singleton `apiClient` (never create new axios instances)
- [ ] All methods return `Promise<ApiResponse<T>>`
- [ ] Include JSDoc comments for each method
- [ ] Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- [ ] Handle pagination parameters if listing data

### 4. **Custom Hooks Pattern**
- [ ] Create hooks in `hooks/use-[feature].ts`
- [ ] Use React Query for all server state (`useQuery`, `useMutation`)
- [ ] Use centralized `queryKeys` from `@/shared/lib/query-keys`
- [ ] Add query keys to `query-keys.ts` if not present
- [ ] Handle cache invalidation on mutations
- [ ] Include proper `enabled` conditions for conditional queries
- [ ] Return typed results from hooks
- [ ] Mark hooks with `'use client'` directive

### 5. **Component Architecture**
- [ ] Pages are Server Components by default (add `'use client'` only when needed)
- [ ] Pages are thin - delegate logic to hooks
- [ ] Use existing UI components from `@/shared/ui/`
- [ ] Create feature-specific components in `components/` folder if reusable
- [ ] Use `cn()` utility for className merging
- [ ] Implement loading states (use `LoadingSpinner` or skeletons)
- [ ] Implement error states (display user-friendly messages)
- [ ] Implement empty states (use `EmptyState` component)
- [ ] Forms use `react-hook-form` + `zod` validation
- [ ] Buttons show loading state during mutations

### 6. **State Management**
- [ ] Server state → React Query (data fetching, caching)
- [ ] Client state → React local state (`useState`) or form state
- [ ] NO localStorage for sensitive data (tokens handled via HTTP-only cookies)
- [ ] Use `useAuth()` for authentication state
- [ ] Invalidate relevant queries after mutations

### 7. **Routing & Navigation**
- [ ] Add route constants to `ROUTES` in `@/shared/lib/constants.ts`
- [ ] Use Next.js App Router file structure
- [ ] Create page at `app/(dashboard)/[feature]/page.tsx`
- [ ] Use `useRouter()` for programmatic navigation
- [ ] Use `<Link>` for declarative navigation
- [ ] Protected routes automatically handled by middleware

### 8. **Error Handling**
- [ ] Display mutation errors in UI
- [ ] Handle API errors gracefully (show user-friendly messages)
- [ ] Form validation errors displayed inline
- [ ] Network errors caught and displayed
- [ ] Use try-catch only in async operations outside React Query

### 9. **Performance Optimization**
- [ ] Use appropriate `staleTime` for queries
- [ ] Implement pagination for large lists
- [ ] Lazy load heavy components with `next/dynamic` if needed
- [ ] Avoid unnecessary re-renders (proper dependency arrays)
- [ ] Use React Query caching effectively

### 10. **Accessibility & UX**
- [ ] Use semantic HTML elements
- [ ] Include ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus management for forms
- [ ] Responsive design (mobile-first)
- [ ] Loading indicators for async operations
- [ ] Success/error feedback for user actions

---

## 📋 Implementation Steps

Follow this exact order:

### Step 1: Define Types
**File**: `src/features/[feature]/types/[feature].types.ts`

```typescript
import { BaseEntity } from '@/shared/types';

// Define all interfaces matching backend responses
export interface [Entity] extends BaseEntity {
  // fields...
}

export interface Create[Entity]Payload {
  // creation fields...
}

export interface Update[Entity]Payload extends Partial<Create[Entity]Payload> {}

export interface [Entity]Filters {
  // filter fields...
}
```

---

### Step 2: Create API Service
**File**: `src/features/[feature]/api/[feature].api.ts`

```typescript
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, PaginatedResponse, ListQueryParams } from '@/shared/types';
import type { [Entity], Create[Entity]Payload, Update[Entity]Payload, [Entity]Filters } from '../types/[feature].types';

/**
 * [Feature] API endpoints
 */
export const [feature]Api = {
  /**
   * Get paginated list of [entities]
   */
  getList: (params: ListQueryParams & { filters?: [Entity]Filters }): Promise<ApiResponse<PaginatedResponse<[Entity]>>> => {
    return apiClient.get('/[endpoint]', { params });
  },

  /**
   * Get single [entity] by ID
   */
  getById: (id: string): Promise<ApiResponse<[Entity]>> => {
    return apiClient.get(`/[endpoint]/${id}`);
  },

  /**
   * Create new [entity]
   */
  create: (data: Create[Entity]Payload): Promise<ApiResponse<[Entity]>> => {
    return apiClient.post('/[endpoint]', data);
  },

  /**
   * Update [entity]
   */
  update: (id: string, data: Update[Entity]Payload): Promise<ApiResponse<[Entity]>> => {
    return apiClient.put(`/[endpoint]/${id}`, data);
  },

  /**
   * Delete [entity]
   */
  delete: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/[endpoint]/${id}`);
  },
};
```

---

### Step 3: Update Query Keys
**File**: `src/shared/lib/query-keys.ts`

Add query keys if not already present:

```typescript
export const queryKeys = {
  // ... existing keys
  
  [feature]: {
    all: ['[feature]'] as const,
    lists: () => [...queryKeys.[feature].all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.[feature].lists(), filters] as const,
    details: () => [...queryKeys.[feature].all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.[feature].details(), id] as const,
  },
} as const;
```

---

### Step 4: Create Custom Hooks
**File**: `src/features/[feature]/hooks/use-[feature].ts`

```typescript
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { [feature]Api } from '../api/[feature].api';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ListQueryParams, [Entity]Filters } from '@/shared/types';

/**
 * Hook to fetch [entities] list with pagination/filters
 */
export function use[Entity]List(params: ListQueryParams & { filters?: [Entity]Filters }) {
  return useQuery({
    queryKey: queryKeys.[feature].list(params),
    queryFn: async () => {
      const response = await [feature]Api.getList(params);
      return response.data;
    },
  });
}

/**
 * Hook to fetch single [entity]
 */
export function use[Entity](id: string) {
  return useQuery({
    queryKey: queryKeys.[feature].detail(id),
    queryFn: async () => {
      const response = await [feature]Api.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create [entity]
 */
export function useCreate[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: [feature]Api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.[feature].lists() });
    },
  });
}

/**
 * Hook to update [entity]
 */
export function useUpdate[Entity](id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => [feature]Api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.[feature].detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.[feature].lists() });
    },
  });
}

/**
 * Hook to delete [entity]
 */
export function useDelete[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: [feature]Api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.[feature].lists() });
    },
  });
}
```

---

### Step 5: Update Barrel Export
**File**: `src/features/[feature]/index.ts`

```typescript
export * from './api/[feature].api';
export * from './hooks/use-[feature]';
export * from './types/[feature].types';
```

---

### Step 6: Create Page Component
**File**: `app/(dashboard)/[feature]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use[Entity]List, useDelete[Entity] } from '@/features/[feature]';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { EmptyState, LoadingSpinner } from '@/components/shared';
import { ROUTES } from '@/shared/lib/constants';
import { PAGINATION } from '@/shared/lib/constants';

export default function [Feature]Page() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = use[Entity]List({
    page,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
    filters: {
      search: search || undefined,
    },
  });

  const deleteMutation = useDelete[Entity]();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load [entities]: {error.message}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        title="No [entities] found"
        description="Get started by adding your first [entity]."
        action={
          <Link href={ROUTES.[FEATURE]_NEW}>
            <Button>Add [Entity]</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">[Entities]</h1>
          <p className="text-muted-foreground">Manage your [entities]</p>
        </div>
        <Link href={ROUTES.[FEATURE]_NEW}>
          <Button>Add [Entity]</Button>
        </Link>
      </div>

      {/* Search/Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search [entities]..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Data Display */}
      <div className="rounded-lg border">
        {/* Table/Grid/List implementation */}
      </div>

      {/* Pagination */}
      {data.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {data.meta.total} [entities]
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data.meta.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data.meta.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Step 7: Add Route Constants (if needed)
**File**: `src/shared/lib/constants.ts`

```typescript
export const ROUTES = {
  // ... existing routes
  
  [FEATURE]: '/dashboard/[feature]',
  [FEATURE]_DETAIL: (id: string) => `/dashboard/[feature]/${id}`,
  [FEATURE]_NEW: '/dashboard/[feature]/new',
} as const;
```

---

## 🔍 Pre-Implementation Verification

Before starting, answer these questions:

1. **Does this feature already exist partially?**
   - Check `src/features/` for existing folders
   - Check `app/` for existing pages
   - Reuse existing code if present

2. **Are backend endpoints ready?**
   - Confirm API endpoints exist and are documented
   - Test endpoints with curl/Postman first
   - Verify response structure matches expected types

3. **What dependencies are needed?**
   - Check `package.json` for available libraries
   - Use existing dependencies (don't add new ones unless necessary)
   - Current stack: React Query, Axios, React Hook Form, Zod, Radix UI, Lucide icons

4. **What existing patterns should I follow?**
   - Review `src/features/auth/` as reference implementation
   - Check similar features for consistency
   - Follow naming conventions exactly

5. **What shared utilities can I reuse?**
   - `cn()` for className merging
   - `formatDate()` for date formatting
   - Existing UI components (Button, Input, Label)
   - Shared components (LoadingSpinner, EmptyState)

---

## 🚫 Common Mistakes to Avoid

❌ **DON'T**:
- Create new axios instances (use `apiClient`)
- Store tokens in localStorage (use HTTP-only cookies)
- Use `any` types (define proper interfaces)
- Put business logic in pages (use hooks)
- Skip error handling
- Forget to invalidate cache after mutations
- Import directly from deep paths (use barrel exports)
- Create duplicate types (reuse shared types)
- Hardcode route strings (use `ROUTES` constant)
- Forget `'use client'` directive for client hooks

✅ **DO**:
- Follow the feature-sliced structure exactly
- Use React Query for all server state
- Type everything with TypeScript
- Handle loading, error, and empty states
- Invalidate cache on mutations
- Use existing UI components
- Add JSDoc comments
- Test the feature manually before marking complete
- Update barrel exports
- Follow naming conventions

---

## 📊 Quality Assurance Checklist

After implementation, verify:

- [ ] TypeScript compilation passes (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Feature loads without errors
- [ ] All CRUD operations work correctly
- [ ] Error messages are user-friendly
- [ ] Loading states display properly
- [ ] Empty states show when appropriate
- [ ] Mobile responsive design works
- [ ] Cache invalidation works (data updates after mutations)
- [ ] Navigation works correctly
- [ ] Authentication required (if protected route)
- [ ] No console errors or warnings
- [ ] Accessibility basics covered (labels, keyboard nav)

---

## 🎨 UI/UX Guidelines

**Styling**:
- Use Tailwind CSS utility classes
- Follow existing color scheme (primary, secondary, destructive, etc.)
- Maintain consistent spacing (use Tailwind scale)
- Ensure dark mode compatibility

**Components**:
- Use Radix UI primitives for accessibility
- Apply CVA variants for consistency
- Keep components composable and reusable

**Forms**:
- Validate with Zod schemas
- Show inline validation errors
- Disable submit button during submission
- Show success/error feedback

**Tables/Lists**:
- Show loading skeleton while fetching
- Display empty state when no data
- Implement pagination for large datasets
- Provide search/filter functionality

---

## 📝 Example: Complete Feature Request

Here's how to fill out this template:

```markdown
## 🎯 Feature Request

**Feature Name**: Player Management - List & Detail View

**Description**: 
Implement a player management system allowing agents to view, create, edit, and delete player profiles. Includes a searchable list view and detailed player profile page.

**User Stories**:
- As an agent, I want to view all my players in a list so that I can manage them efficiently
- As an agent, I want to search and filter players so that I can find specific players quickly
- As an agent, I want to view detailed player information so that I can see their full profile
- As an agent, I want to create new player profiles so that I can onboard new players

**Backend API Endpoints**:
- `GET /api/players` - Get paginated list with filters
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

**Expected Behavior**:
- List page shows players in a table with name, position, nationality, status
- Clicking a player navigates to detail page
- Search filters players by name
- Delete shows confirmation dialog
- Create/Edit opens a form with validation
```

---

## 🔄 After Implementation

Once the feature is complete:

1. **Test thoroughly**:
   - Manual testing of all interactions
   - Verify API integration works
   - Check error scenarios
   - Test on mobile devices

2. **Document any deviations**:
   - If you had to break patterns, explain why
   - Note any temporary workarounds
   - Suggest future improvements

3. **Update related files**:
   - Add navigation links in sidebar if needed
   - Update documentation if applicable
   - Add new route protection if required

4. **Performance check**:
   - Monitor bundle size impact
   - Check for unnecessary re-renders
   - Verify caching strategy works

---

## 💡 Pro Tips

1. **Start with types** - Define your data structures first
2. **Build bottom-up** - API → Hooks → Components → Page
3. **Reuse aggressively** - Don't reinvent existing patterns
4. **Test as you go** - Verify each layer before moving to next
5. **Keep pages thin** - Maximum 100 lines for page components
6. **Comment complex logic** - Explain WHY, not WHAT
7. **Think about edge cases** - Empty states, errors, loading
8. **Consider accessibility** - Semantic HTML, ARIA labels
9. **Plan for scalability** - Will this work with 1000 items?
10. **Follow the auth pattern** - It's your reference implementation

---

## 📚 Reference Files

Study these files as examples of best practices:

- **Auth Feature**: `src/features/auth/` (complete implementation)
- **API Client**: `src/shared/lib/api-client.ts` (interceptors, error handling)
- **Query Keys**: `src/shared/lib/query-keys.ts` (cache management)
- **UI Components**: `src/shared/ui/button.tsx` (CVA pattern)
- **Login Page**: `app/(auth)/login/page.tsx` (form pattern)
- **Dashboard Layout**: `app/(dashboard)/layout.tsx` (layout structure)

---

**Remember**: Consistency is key. Every feature should look like it was built by the same team following the same standards. When in doubt, check how the auth feature does it and follow that pattern.

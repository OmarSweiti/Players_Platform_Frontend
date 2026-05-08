# Quick Start Guide - Players Platform Frontend

## Prerequisites

- Node.js 18+ installed
- Backend running on `http://localhost:3000`
- PostgreSQL database configured

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Players Platform
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## First-Time Setup

### 1. Create Tenant ID

Before registering, you need a Tenant ID. For development:

```javascript
// In browser console or save in localStorage
localStorage.setItem('tenantId', 'dev-tenant-001');
```

### 2. Register Account

1. Navigate to `/register`
2. Fill in your details
3. Enter your Tenant ID
4. Click "Create Account"

### 3. Login

1. Navigate to `/login`
2. Enter your credentials
3. You'll be redirected to the dashboard

## Project Structure Overview

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   └── (dashboard)/       # Protected dashboard routes
├── src/
│   ├── features/          # Feature modules (auth, players, etc.)
│   ├── shared/            # Reusable utilities and components
│   ├── components/        # Layout and provider components
│   └── config/            # Configuration files
└── middleware.ts          # Route protection
```

## Common Tasks

### Adding a New Feature Module

1. Create feature directory:
```bash
mkdir -p src/features/players/{api,components,hooks,types}
```

2. Create API layer:
```typescript
// src/features/players/api/players.api.ts
import { apiClient } from '@/shared/lib/api-client';

export const playersApi = {
  list: () => apiClient.get('/players'),
  get: (id: string) => apiClient.get(`/players/${id}`),
  create: (data: any) => apiClient.post('/players', data),
  update: (id: string, data: any) => apiClient.put(`/players/${id}`, data),
  delete: (id: string) => apiClient.delete(`/players/${id}`),
};
```

3. Create types:
```typescript
// src/features/players/types/player.types.ts
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  // ... other fields
}
```

4. Create hooks:
```typescript
// src/features/players/hooks/use-players.ts
import { useQuery } from '@tanstack/react-query';
import { playersApi } from '../api/players.api';
import { queryKeys } from '@/shared/lib/query-keys';

export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players.list({}),
    queryFn: async () => {
      const response = await playersApi.list();
      return response.data;
    },
  });
}
```

5. Create page:
```typescript
// app/(dashboard)/players/page.tsx
'use client';

import { usePlayers } from '@/features/players/hooks/use-players';

export default function PlayersPage() {
  const { data: players, isLoading } = usePlayers();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Players</h1>
      {/* Render players */}
    </div>
  );
}
```

### Creating a Form with Validation

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label } from '@/shared/ui';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof formSchema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>
        
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
```

### Making API Calls

```typescript
// Using React Query (recommended for server state)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/query-keys';

// Query (GET)
const { data, isLoading } = useQuery({
  queryKey: queryKeys.players.detail(id),
  queryFn: async () => {
    const response = await playersApi.get(id);
    return response.data;
  },
});

// Mutation (POST/PUT/DELETE)
const mutation = useMutation({
  mutationFn: playersApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.players.lists() });
  },
});

mutation.mutate(newPlayerData);
```

### Using UI Components

```typescript
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Input with error
<Input error="This field is required" />

// Loading state
<Button isLoading={true}>Loading...</Button>
```

## Debugging

### Check API Requests

Open browser DevTools → Network tab to see all API requests.

### React Query DevTools

Available in development mode at the bottom-right corner of the screen.

### View Authentication State

```typescript
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log('User:', user);
  console.log('Authenticated:', isAuthenticated);
}
```

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next
npm run build
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit
```

### Middleware Issues

Make sure backend is running and CORS is properly configured.

### Authentication Not Working

1. Check that backend is setting HTTP-only cookies
2. Verify API URL in `.env.local`
3. Check browser DevTools → Application → Cookies

## Best Practices

1. **Always use TypeScript** - No `any` types
2. **Validate all inputs** - Use Zod schemas
3. **Handle loading states** - Show spinners or skeletons
4. **Handle errors gracefully** - Show user-friendly messages
5. **Use React Query for server state** - Don't use useState for API data
6. **Keep components small** - Extract reusable logic
7. **Use absolute imports** - `@/features/...` instead of relative paths
8. **Follow feature structure** - Keep related code together

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

## Getting Help

If you encounter issues:

1. Check the console for errors
2. Review the implementation docs: `FRONTEND_IMPLEMENTATION.md`
3. Check backend logs for API errors
4. Verify environment configuration

---

Happy coding! 🚀

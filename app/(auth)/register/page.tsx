'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { Button, Input, Label } from '@/shared/ui';
import { ROUTES, STORAGE_KEYS } from '@/shared/lib/constants';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMutation = useRegister();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tenantId: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TENANT_ID) || '' : '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Save tenant ID for future requests
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, data.tenantId);
    }
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">
          Enter your information to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input
            id="tenantId"
            placeholder="Enter your organization ID"
            error={errors.tenantId?.message}
            {...register('tenantId')}
          />
          <p className="text-xs text-muted-foreground">
            Contact your administrator for your Tenant ID
          </p>
        </div>

        {registerMutation.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {registerMutation.error.message || 'Registration failed. Please try again.'}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { Button, Input, Label } from '@/shared/ui';
import { ROUTES, STORAGE_KEYS } from '@/shared/lib/constants';
import { Check, X } from 'lucide-react';

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
  const [password, setPassword] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tenantId:
        typeof window !== 'undefined'
          ? localStorage.getItem(STORAGE_KEYS.TENANT_ID) || ''
          : '',
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
            {...register('password', {
              onChange: (e) => setPassword(e.target.value),
            })}
          />
          {password && (
            <div className="space-y-2 mt-2">
              {/* Strength bar */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < passwordStrength
                        ? strengthColors[passwordStrength - 1]
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Strength:{' '}
                  {strengthLabels[passwordStrength - 1] || 'Too short'}
                </span>
                <span
                  className={
                    passwordStrength >= 4
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }
                >
                  {Math.round((passwordStrength / 5) * 100)}%
                </span>
              </div>

              {/* Requirements checklist */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    {req.met ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span
                      className={
                        req.met ? 'text-green-600' : 'text-muted-foreground'
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {registerMutation.error.message ||
              'Registration failed. Please try again.'}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? 'Creating account...'
            : 'Create Account'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

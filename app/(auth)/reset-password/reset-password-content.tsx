'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useResetPassword } from '@/features/auth/hooks/use-auth';
import { Button, Input, Label } from '@/shared/ui';
import { ROUTES } from '@/shared/lib/constants';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => {
  if (data.newPassword !== data.confirmPassword) {
    return {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    };
  }
  return true;
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      router.push(ROUTES.LOGIN);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) return;

    resetPasswordMutation.mutate(
      {
        token,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="flex justify-center p-12">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid reset link</p>
          <Link href={ROUTES.LOGIN} className="text-primary hover:underline mt-2 inline-block">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Password Reset Successful</h1>
          <p className="text-muted-foreground">
            Your password has been reset successfully
          </p>
        </div>

        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          You can now log in with your new password. All other sessions have been invalidated for security.
        </div>

        <Link href={ROUTES.LOGIN}>
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {resetPasswordMutation.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {resetPasswordMutation.error.message || 'Failed to reset password. Please try again.'}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}

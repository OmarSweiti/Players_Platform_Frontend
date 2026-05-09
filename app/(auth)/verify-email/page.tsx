'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useVerifyEmail, useResendVerification } from '@/features/auth/hooks/use-auth';
import { Button, Label, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/lib/constants';
import { LoadingSpinner } from '@/components/shared';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification link');
      return;
    }

    verifyEmailMutation.mutate(token, {
      onSuccess: () => {
        setStatus('success');
      },
      onError: (error) => {
        setStatus('error');
        setErrorMessage(error.message || 'Failed to verify email');
      },
    });
  }, [searchParams]);

  const handleResendVerification = () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    resendVerificationMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setErrorMessage('');
          alert('Verification email sent successfully!');
        },
        onError: (error) => {
          setErrorMessage(error.message || 'Failed to resend verification email');
        },
      }
    );
  };

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-12">
        <LoadingSpinner />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been verified successfully
          </p>
        </div>

        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          You can now log in to your account with full access.
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
        <h1 className="text-3xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">
          {errorMessage || 'The verification link is invalid or has expired'}
        </p>
      </div>

      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-semibold mb-2">What you can do:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The link may have expired (valid for 24 hours)</li>
          <li>You may have already verified your email</li>
          <li>The link might be incorrect or corrupted</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Enter your email to resend verification</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          onClick={handleResendVerification}
          className="w-full"
          isLoading={resendVerificationMutation.isPending}
        >
          {resendVerificationMutation.isPending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>

      <div className="text-center text-sm">
        <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}

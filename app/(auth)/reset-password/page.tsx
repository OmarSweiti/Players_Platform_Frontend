'use client';

import { Suspense } from 'react';
import ResetPasswordContent from './reset-password-content';
import { LoadingSpinner } from '@/components/shared';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 p-12">
        <LoadingSpinner />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

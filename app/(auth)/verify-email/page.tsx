'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './verify-email-content';
import { LoadingSpinner } from '@/components/shared';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 p-12">
        <LoadingSpinner />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

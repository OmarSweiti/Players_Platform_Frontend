'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser, useEnable2FA, useVerify2FA, useDisable2FA } from '@/features/auth/hooks/use-auth';
import { Button, Input, Label } from '@/shared/ui';
import { LoadingSpinner } from '@/components/shared';

export default function TwoFASetupPage() {
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const enable2FAMutation = useEnable2FA();
  const verify2FAMutation = useVerify2FA();
  const disable2FAMutation = useDisable2FA();
  
  const [step, setStep] = useState<'disabled' | 'qr' | 'verifying' | 'enabled'>('disabled');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (user?.is2FAEnabled) {
      setStep('enabled');
    } else if (user?.twoFASecret) {
      setStep('qr');
    } else {
      setStep('disabled');
    }
  }, [user]);

  const handleEnable2FA = async () => {
    setError('');
    try {
      const response = await enable2FAMutation.mutateAsync();
      if (response.data) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      }
      setStep('qr');
    } catch (err: any) {
      setError(err.message || 'Failed to enable 2FA');
    }
  };

  const handleVerify2FA = async () => {
    setError('');
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      await verify2FAMutation.mutateAsync({ token: verificationCode });
      setStep('enabled');
      setSuccess('2FA has been enabled successfully!');
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    }
  };

  const handleDisable2FA = async () => {
    setError('');
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code from your authenticator app');
      return;
    }

    try {
      await disable2FAMutation.mutateAsync({ token: verificationCode });
      setStep('disabled');
      setSuccess('2FA has been disabled successfully!');
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    }
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">Two-Factor Authentication (2FA)</h2>
        <p className="mb-6 text-muted-foreground">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>

        {/* Step 1: Disabled */}
        {step === 'disabled' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                2FA is currently disabled. We recommend enabling it for better security.
              </p>
            </div>
            <Button onClick={handleEnable2FA} disabled={enable2FAMutation.isPending}>
              {enable2FAMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Enable 2FA
            </Button>
          </div>
        )}

        {/* Step 2: Show QR Code */}
        {step === 'qr' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">Scan QR Code</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              
              {qrCode && (
                <div className="mb-4 inline-block rounded-lg border p-4">
                  <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" />
                </div>
              )}

              <div className="mb-4">
                <Label className="text-sm font-medium">Secret Key (if you can't scan)</Label>
                <p className="mt-1 rounded-md bg-muted p-2 font-mono text-sm break-all">
                  {secret}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter 6-digit code</Label>
              <Input
                id="verify-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                error={error}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleVerify2FA} disabled={verify2FAMutation.isPending}>
                {verify2FAMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                Verify & Enable
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('disabled')}
                disabled={enable2FAMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Enabled */}
        {step === 'enabled' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ 2FA is enabled. Your account is now protected with two-factor authentication.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Enter 6-digit code to disable 2FA</Label>
              <Input
                id="disable-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                error={error}
              />
            </div>

            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={disable2FAMutation.isPending}
            >
              {disable2FAMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Disable 2FA
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">{success}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">How does 2FA work?</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Enable 2FA on your account</li>
          <li>2. Scan the QR code with an authenticator app</li>
          <li>3. Enter the 6-digit code to verify</li>
          <li>4. Each time you log in, you'll need to enter a code from your app</li>
        </ol>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser, useEnable2FA, useVerify2FA, useDisable2FA } from '@/features/auth/hooks/use-auth';
import { Button, Input, Label } from '@/shared/ui';
import { LoadingSpinner } from '@/components/shared';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Download, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TwoFASetupPage() {
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const enable2FAMutation = useEnable2FA();
  const verify2FAMutation = useVerify2FA();
  const disable2FAMutation = useDisable2FA();
  
  const [step, setStep] = useState<'disabled' | 'qr' | 'verifying' | 'enabled' | 'backup'>('disabled');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState<boolean>(false);

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
      // Generate backup codes
      setBackupCodes(generateBackupCodes());
      setStep('backup'); // Show backup codes before marking as enabled
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

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setSuccess('Backup codes copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const downloadBackupCodes = () => {
    const codesText = `Your 2FA Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\n${backupCodes.join('\n')}\n\nImportant: Keep these codes safe. Each code can only be used once.`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCompleteSetup = () => {
    setStep('enabled');
    setBackupCodes([]);
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
      {/* Header */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>

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
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Setup Instructions
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-300">
                    <li>1. Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
                    <li>2. Open the app and scan the QR code below</li>
                    <li>3. Enter the 6-digit code shown in your app</li>
                  </ol>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-white p-6 dark:bg-card">
                  {qrCode ? (
                    <img src={qrCode} alt="2FA QR Code" className="h-52 w-52" />
                  ) : (
                    <div className="flex h-52 w-52 items-center justify-center text-muted-foreground">
                      Loading QR code...
                    </div>
                  )}
                </div>
              </div>

              {/* Secret Key (Alternative to QR) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Can't scan the QR code?</Label>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showSecret ? 'Hide' : 'Show'} secret key
                  </button>
                </div>
                {showSecret && secret && (
                  <div className="relative rounded-md bg-muted p-3 font-mono text-sm break-all">
                    <p className="pr-8">{secret}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(secret);
                        setSuccess('Secret key copied!');
                        setTimeout(() => setSuccess(''), 3000);
                      }}
                      className="absolute right-2 top-2 rounded p-1 hover:bg-muted-foreground/20"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter this secret key manually in your authenticator app
                </p>
              </div>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter 6-digit verification code</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleVerify2FA} disabled={verify2FAMutation.isPending}>
                {verify2FAMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Verify & Enable
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep('disabled');
                  setError('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 'backup' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <div className="space-y-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Save Your Backup Codes
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    These backup codes can be used if you lose access to your authenticator app.
                    Each code can only be used <strong>once</strong>. Keep them safe!
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold">Your Backup Codes</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBackupCodes}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadBackupCodes}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="rounded-md bg-card px-3 py-2 text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCompleteSetup}>
              <CheckCircle className="mr-2 h-4 w-4" />
              I've Saved My Backup Codes
            </Button>
          </div>
        )}

        {/* Step 4: Enabled */}
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

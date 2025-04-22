'use client';

import { AnonymousLoginButton } from '@/modules/auth/AnonymousLoginButton';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const authState = useAuthState();

  // Get session ID from AuthProvider context
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  // Redirect to app if already authenticated
  useEffect(() => {
    if (authState?.state === 'authenticated') {
      router.push('/app');
    }
  }, [authState, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or continue anonymously
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Future implementation: Regular login form */}
            <p className="text-sm text-center text-gray-500">
              Email/password login will be implemented in a future update
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Or continue with</span>
              </div>
            </div>

            {sessionId && <AnonymousLoginButton sessionId={sessionId} />}
          </div>
        </div>
      </div>
    </div>
  );
}

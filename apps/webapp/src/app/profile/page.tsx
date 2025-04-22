'use client';

import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { NameEditForm } from '@/modules/profile/NameEditForm';
import Link from 'next/link';

export default function ProfilePage() {
  const authState = useAuthState();

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            {authState?.state === 'authenticated' && (
              <div className="space-y-8">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-xl font-semibold mb-2">Account Information</h2>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="font-medium">Account Type:</span>{' '}
                      {authState.user.type === 'anonymous' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Anonymous
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Full Account
                        </span>
                      )}
                    </div>
                    {authState.user.type === 'anonymous' && (
                      <div className="mt-2 text-sm text-gray-500">
                        You are using an anonymous account. Your data will be available as long as
                        you use the same device and don't clear your browser data.
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <NameEditForm />
                </div>

                <div className="border-t pt-6 flex justify-end">
                  <Link href="/app">
                    <Button variant="outline">Back to App</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireLogin>
  );
}

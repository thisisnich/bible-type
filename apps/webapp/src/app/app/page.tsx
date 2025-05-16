'use client';

import { CustomBibleSelector } from '@/components/CustomBibleSelector';
import { CustomTypingInterface } from '@/components/CustomTypingInterface';
import { TypingApp } from '@/components/TypingApp';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import Link from 'next/link';

export default function AppPage() {
  const authState = useAuthState();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">BibleType</h1>
            <Link href="/app/profile">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </Link>
          </div>

          {authState?.state === 'authenticated' && (
            <div className="space-y-4">
              {authState.user.type === 'anonymous' && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Tip:</span> You're using an anonymous account.
                    Visit your{' '}
                    <Link
                      href="/app/profile"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      profile page
                    </Link>{' '}
                    to personalize your display name.
                  </p>
                </div>
              )}
              <div className="p-4 bg-gray-100 rounded-md">
                <TypingApp />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Your Content</h3>
                  <p className="text-sm text-gray-600">
                    No content yet. Start creating by using the app features.
                  </p>
                </div>
                <a className="p-4 border rounded-md" href="/history">
                  <h3 className="font-medium mb-2">History</h3>
                  <p className="text-sm text-gray-600">See your past results</p>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

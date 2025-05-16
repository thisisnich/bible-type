'use client';

import { CustomBibleSelector } from '@/components/CustomBibleSelector';
import { CustomTypingInterface } from '@/components/CustomTypingInterface';
import { TypingApp } from '@/components/TypingApp';
import { TypingHistory } from '@/components/TypingHistory';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import Link from 'next/link';
import { useState } from 'react';

// Define Bible verse structure
type BibleVerse = {
  id: string;
  reference: string;
  bookId: string;
  chapterId: string;
  content: string;
  bibleId?: string;
};

export default function AppPage() {
  const authState = useAuthState();
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  // Handle verse selection from the BibleSelector
  const handleVerseSelect = (verse: BibleVerse) => {
    setSelectedVerse(verse);
  };

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
            <div className="space-y-6">
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

              {/* Bible Selector Component */}
              <CustomBibleSelector onVerseSelect={handleVerseSelect} />

              {/* Typing Interface */}
              <div className="p-4 bg-gray-100 rounded-md">
                <CustomTypingInterface verse={selectedVerse} />
              </div>

              {/* History Section */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Your BibleType Activity</h2>
                <TypingHistory />
              </div>
            </div>
          )}

          {authState?.state !== 'authenticated' && (
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> You need to be logged in to access the
                typing interface and history. Please{' '}
                <Link href="/login" className="text-yellow-600 underline hover:text-yellow-800">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/register" className="text-yellow-600 underline hover:text-yellow-800">
                  register
                </Link>{' '}
                to continue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

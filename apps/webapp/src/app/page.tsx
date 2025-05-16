'use client';
import { Button } from '@/components/ui/button';
import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { BookOpenText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const appInfo = useQuery(api.appinfo.get);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center space-y-10">
          {/* Header with icon */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-indigo-100 p-4 rounded-full">
                <BookOpenText size={64} className="text-indigo-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-900">BibleType</h1>
            <p className="text-xl text-gray-600">
              Improve your typing skills while memorizing scripture
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Multiple Translations</h3>
              <p className="text-gray-600">Practice with KJV, World English Bible, and more</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Track Your Progress</h3>
              <p className="text-gray-600">Monitor your WPM and accuracy as you improve</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Scripture Memorization</h3>
              <p className="text-gray-600">Learning by typing helps with retention</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link href="/app">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-xl rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
                Start Typing
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <div>BibleType | App Version: {appInfo?.version}</div>
      </footer>
    </div>
  );
}

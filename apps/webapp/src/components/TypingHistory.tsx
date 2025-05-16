import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useEffect, useState } from 'react';

type TypingHistoryEntry = {
  userId: string;
  timestamp: number;
  verseId: string;
  wpm: number;
  accuracy: number;
  translation: string;
  reference: string;
};

export function TypingHistory() {
  const [history, setHistory] = useState<TypingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use sessionQuery pattern consistent with the rest of the app
  const typingHistory = useSessionQuery(api.bible.getTypingHistory, {});

  useEffect(() => {
    if (typingHistory) {
      setHistory(typingHistory);
      setIsLoading(false);
    }
  }, [typingHistory]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2.5" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">You haven't completed any typing tests yet.</p>
        <p className="text-gray-500 text-sm mt-2">
          Select a verse above and complete a test to see your history.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Verse</th>
            <th className="px-4 py-3">Translation</th>
            <th className="px-4 py-3">WPM</th>
            <th className="px-4 py-3">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr
              key={`${entry.verseId}-${entry.timestamp}`}
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="px-4 py-3 text-gray-600">{formatDate(entry.timestamp)}</td>
              <td className="px-4 py-3 font-medium">{entry.reference}</td>
              <td className="px-4 py-3">
                {entry.translation === 'kjv'
                  ? 'King James Version'
                  : entry.translation === 'web'
                    ? 'World English Bible'
                    : entry.translation}
              </td>
              <td className="px-4 py-3 font-semibold">{entry.wpm}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.accuracy >= 95
                      ? 'bg-green-100 text-green-800'
                      : entry.accuracy >= 85
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {entry.accuracy}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

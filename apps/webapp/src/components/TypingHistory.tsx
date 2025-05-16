import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useState } from 'react';

type TypingHistoryItem = {
  verseId: string;
  wpm: number;
  accuracy: number;
  translation: string;
  reference: string;
  timestamp: number;
};

export function TypingHistory() {
  const typingHistory = useQuery(api.bible.getTypingHistory) || [];
  const [expanded, setExpanded] = useState(false);

  if (typingHistory.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="font-medium mb-2">Your Typing History</h3>
        <p className="text-sm text-gray-600">
          No history yet. Complete some typing exercises to see your progress.
        </p>
      </div>
    );
  }

  const displayedHistory = expanded ? typingHistory : typingHistory.slice(0, 5);

  return (
    <div className="p-4 bg-white rounded-md border border-gray-200">
      <h3 className="font-medium mb-4">Your Typing History</h3>

      <div className="space-y-3">
        {displayedHistory.map((entry, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={index} className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{entry.reference}</span>
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {entry.translation === 'kjv'
                ? 'King James Version'
                : entry.translation === 'web'
                  ? 'World English Bible'
                  : entry.translation}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-4 text-sm">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  WPM: <strong>{entry.wpm}</strong>
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Accuracy: <strong>{entry.accuracy}%</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {typingHistory.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? 'Show Less' : `Show More (${typingHistory.length - 5} more)`}
        </button>
      )}
    </div>
  );
}

import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { useCallback, useEffect, useState } from 'react';

// Define Bible verse structure
type BibleVerse = {
  id: string;
  reference: string;
  bookId: string;
  chapterId: string;
  content: string;
  bibleId?: string;
};

export function CustomTypingInterface({ verse }: { verse: BibleVerse | null }) {
  const [currentText, setCurrentText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultSaved, setResultSaved] = useState(false);
  const [normalizedTargetText, setNormalizedTargetText] = useState('');

  // Clean up the verse content for typing - bible-api.com returns plain text already
  const getCleanText = useCallback((text: string) => {
    // Remove any potential HTML tags just to be safe
    const withoutTags = text.replace(/<[^>]*>/g, '');
    // Replace typographical quotes and apostrophes with straight ones
    const normalizedText = withoutTags
      .replace(/['']/g, "'") // Replace curly apostrophes with straight ones
      .replace(/[""]/g, '"'); // Replace curly quotes with straight ones
    // Remove extra whitespace and normalize
    return normalizedText.trim().replace(/\s+/g, ' ');
  }, []);

  // Use the provided verse or default to a placeholder
  const targetText = verse ? verse.content : 'Please select a Bible verse to start typing.';

  // Use the same session mutation pattern as seen in BudgetForm
  const saveResult = useSessionMutation(api.bible.saveTypingResult);

  // Reset typing state when verse changes and normalize text
  useEffect(() => {
    handleRestart();
    if (verse) {
      const normalized = getCleanText(verse.content);
      setNormalizedTargetText(normalized);
    } else {
      setNormalizedTargetText('Please select a Bible verse to start typing.');
    }
  }, [verse, getCleanText]);

  const calculateStats = useCallback(() => {
    if (!startTime || !verse) return;

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const keystrokes = currentText.length;
    const newWpm = Math.round(keystrokes / 5 / timeElapsed);

    const matches = currentText
      .split('')
      .filter((char, i) => char === normalizedTargetText[i]).length;
    const newAccuracy = Math.round((matches / Math.max(currentText.length, 1)) * 100);

    // Calculate progress
    const newProgress = Math.min(
      100,
      Math.round((currentText.length / normalizedTargetText.length) * 100)
    );

    setWpm(newWpm);
    setAccuracy(newAccuracy);
    setProgress(newProgress);
  }, [currentText, startTime, normalizedTargetText, verse]);

  // Check for completion
  const checkCompletion = useCallback(
    (text: string) => {
      if (!verse) return false;

      // Check if we've typed the full target text
      return text.length >= normalizedTargetText.length;
    },
    [normalizedTargetText, verse]
  );

  // Effect to save results when typing is complete
  useEffect(() => {
    const saveTypingResult = async () => {
      if (isComplete && verse && !resultSaved) {
        try {
          // Save the typing result to the database with all relevant verse info
          await saveResult({
            verseId: verse.id,
            wpm,
            accuracy,
            translation: verse.bibleId || 'unknown',
            reference: verse.reference,
          });

          setResultSaved(true);
          console.log('Typing result saved successfully');
        } catch (error) {
          console.error('Error saving typing result:', error);
        }
      }
    };

    saveTypingResult();
  }, [isComplete, verse, wpm, accuracy, saveResult, resultSaved]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isComplete || !verse) return;
    if (!startTime) setStartTime(Date.now());

    const newText = e.target.value;
    setCurrentText(newText);
    calculateStats();

    // Check if typing is complete
    if (checkCompletion(newText)) {
      setIsComplete(true);
    }
  };

  const handleRestart = useCallback(() => {
    setCurrentText('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsComplete(false);
    setProgress(0);
    setResultSaved(false);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRestart]);

  return (
    <div className="flex flex-col gap-4">
      {verse && (
        <>
          <div className="text-center mb-2">
            <h3 className="text-lg font-semibold">{verse.reference}</h3>
            <p className="text-sm text-gray-500">
              {verse.bibleId === 'kjv'
                ? 'King James Version'
                : verse.bibleId === 'web'
                  ? 'World English Bible'
                  : verse.bibleId}
            </p>
          </div>

          <div className="flex justify-between items-center text-lg">
            <div className="flex gap-4">
              <span>WPM: {wpm}</span>
              <span>Accuracy: {accuracy}%</span>
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2 transition-colors"
              title="Press Ctrl+R to restart"
            >
              <span>Restart</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-white rounded border shadow-sm">Ctrl+R</kbd>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="font-mono text-lg bg-slate-100 p-4 rounded whitespace-pre-wrap break-words">
            {normalizedTargetText.split('').map((char, i) => {
              const typed = currentText[i];
              let className = '';

              if (typed !== undefined) {
                if (char === ' ' && typed !== ' ') {
                  className = 'text-red-600 border-b-2 border-red-600';
                } else {
                  className = typed === char ? 'text-green-600' : 'text-red-600';
                }
              }

              const uniqueKey = `char-${i}-${char.charCodeAt(0)}`;

              return (
                <span key={uniqueKey} className={className}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>

          <textarea
            value={currentText}
            onChange={handleInput}
            className="font-mono text-lg p-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            disabled={isComplete}
            placeholder="Start typing to begin..."
            // biome-ignore lint/a11y/noAutofocus: autofocus is needed for typing tests
            autoFocus
          />

          {isComplete && (
            <div className="text-center animate-fade-in">
              <div className="mb-4 p-6 bg-green-100 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold text-green-800 mb-2">Test Complete! 🎉</h3>
                <div className="text-green-700 space-y-1">
                  <p className="text-xl">
                    Final WPM: <span className="font-bold">{wpm}</span>
                  </p>
                  <p className="text-xl">
                    Accuracy: <span className="font-bold">{accuracy}%</span>
                  </p>
                  {resultSaved && <p className="text-sm mt-2">Result saved to your history</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}

      {!verse && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg text-gray-500">Select a Bible verse above to start practicing.</p>
        </div>
      )}
    </div>
  );
}

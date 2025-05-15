import { api } from '@workspace/backend/convex/_generated/api';
import { useAction } from 'convex/react';
import { useEffect, useState } from 'react';

// Define type for Bible translation
type BibleTranslation = {
  id: string;
  name: string;
  language: {
    id: string;
    name: string;
  };
};

// Define Bible verse structure
type BibleVerse = {
  id: string;
  reference: string;
  bookId: string;
  chapterId: string;
  content: string;
  bibleId?: string;
};

// Bible books data structure with ID and full name
const BIBLE_BOOKS = [
  { id: 'GEN', name: 'Genesis' },
  { id: 'EXO', name: 'Exodus' },
  { id: 'LEV', name: 'Leviticus' },
  { id: 'NUM', name: 'Numbers' },
  { id: 'DEU', name: 'Deuteronomy' },
  { id: 'JOS', name: 'Joshua' },
  { id: 'JDG', name: 'Judges' },
  { id: 'RUT', name: 'Ruth' },
  { id: '1SA', name: '1 Samuel' },
  { id: '2SA', name: '2 Samuel' },
  { id: '1KI', name: '1 Kings' },
  { id: '2KI', name: '2 Kings' },
  { id: '1CH', name: '1 Chronicles' },
  { id: '2CH', name: '2 Chronicles' },
  { id: 'EZR', name: 'Ezra' },
  { id: 'NEH', name: 'Nehemiah' },
  { id: 'EST', name: 'Esther' },
  { id: 'JOB', name: 'Job' },
  { id: 'PSA', name: 'Psalms' },
  { id: 'PRO', name: 'Proverbs' },
  { id: 'ECC', name: 'Ecclesiastes' },
  { id: 'SNG', name: 'Song of Solomon' },
  { id: 'ISA', name: 'Isaiah' },
  { id: 'JER', name: 'Jeremiah' },
  { id: 'LAM', name: 'Lamentations' },
  { id: 'EZK', name: 'Ezekiel' },
  { id: 'DAN', name: 'Daniel' },
  { id: 'HOS', name: 'Hosea' },
  { id: 'JOL', name: 'Joel' },
  { id: 'AMO', name: 'Amos' },
  { id: 'OBA', name: 'Obadiah' },
  { id: 'JON', name: 'Jonah' },
  { id: 'MIC', name: 'Micah' },
  { id: 'NAM', name: 'Nahum' },
  { id: 'HAB', name: 'Habakkuk' },
  { id: 'ZEP', name: 'Zephaniah' },
  { id: 'HAG', name: 'Haggai' },
  { id: 'ZEC', name: 'Zechariah' },
  { id: 'MAL', name: 'Malachi' },
  { id: 'MAT', name: 'Matthew' },
  { id: 'MRK', name: 'Mark' },
  { id: 'LUK', name: 'Luke' },
  { id: 'JHN', name: 'John' },
  { id: 'ACT', name: 'Acts' },
  { id: 'ROM', name: 'Romans' },
  { id: '1CO', name: '1 Corinthians' },
  { id: '2CO', name: '2 Corinthians' },
  { id: 'GAL', name: 'Galatians' },
  { id: 'EPH', name: 'Ephesians' },
  { id: 'PHP', name: 'Philippians' },
  { id: 'COL', name: 'Colossians' },
  { id: '1TH', name: '1 Thessalonians' },
  { id: '2TH', name: '2 Thessalonians' },
  { id: '1TI', name: '1 Timothy' },
  { id: '2TI', name: '2 Timothy' },
  { id: 'TIT', name: 'Titus' },
  { id: 'PHM', name: 'Philemon' },
  { id: 'HEB', name: 'Hebrews' },
  { id: 'JAS', name: 'James' },
  { id: '1PE', name: '1 Peter' },
  { id: '2PE', name: '2 Peter' },
  { id: '1JN', name: '1 John' },
  { id: '2JN', name: '2 John' },
  { id: '3JN', name: '3 John' },
  { id: 'JUD', name: 'Jude' },
  { id: 'REV', name: 'Revelation' },
];

export function CustomBibleSelector({
  onVerseSelect,
}: { onVerseSelect: (verse: BibleVerse) => void }) {
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string>('kjv');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [chapterInput, setChapterInput] = useState<string>('');
  const [verseInput, setVerseInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslations = useAction(api.bible.fetchTranslations);
  const fetchVerse = useAction(api.bible.fetchVerse);

  // Fetch translations on component mount
  useEffect(() => {
    async function loadTranslations() {
      setError(null);
      try {
        const data = await fetchTranslations({});
        if (data && Array.isArray(data)) {
          setTranslations(data);
          // Default to KJV
          setSelectedTranslation('kjv');
        } else {
          console.log('Using default translations as API returned invalid data');
          setError('Could not load Bible translations. Using defaults instead.');
          // Set default translations as fallback
          setTranslations([
            {
              id: 'kjv',
              name: 'King James Version',
              language: { id: 'eng', name: 'English' },
            },
            {
              id: 'web',
              name: 'World English Bible',
              language: { id: 'eng', name: 'English' },
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        setError('Failed to load Bible translations.');
        // Use default translations as fallback
        setTranslations([
          {
            id: 'kjv',
            name: 'King James Version',
            language: { id: 'eng', name: 'English' },
          },
          {
            id: 'web',
            name: 'World English Bible',
            language: { id: 'eng', name: 'English' },
          },
        ]);
      }
    }

    loadTranslations();
  }, [fetchTranslations]);

  // Handle translation selection
  const handleTranslationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTranslation(e.target.value);
  };

  // Handle book selection
  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBook(e.target.value);
  };

  // Handle chapter input
  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setChapterInput(value);
  };

  // Handle verse input
  const handleVerseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow numbers, hyphens for ranges
    const value = e.target.value.replace(/[^0-9\-]/g, '');
    setVerseInput(value);
  };

  // Validate input and fetch verse
  const validateAndFetchVerses = async () => {
    setError(null);

    // Validate input
    if (!selectedBook) {
      setError('Please select a book.');
      return;
    }

    if (!chapterInput) {
      setError('Please enter a chapter number.');
      return;
    }

    if (!verseInput) {
      setError('Please enter a verse or verse range.');
      return;
    }

    // Parse verse range
    let verseStart: number;
    let verseEnd: number;

    if (verseInput.includes('-')) {
      const [start, end] = verseInput.split('-');
      verseStart = Number.parseInt(start);
      verseEnd = Number.parseInt(end);

      if (Number.isNaN(verseStart) || Number.isNaN(verseEnd)) {
        setError("Invalid verse range format. Please use format like '1-5'.");
        return;
      }

      if (verseStart > verseEnd) {
        setError('Starting verse must be less than ending verse.');
        return;
      }

      if (verseEnd - verseStart > 10) {
        setError('Verse range cannot exceed 10 verses.');
        return;
      }
    } else {
      verseStart = Number.parseInt(verseInput);
      verseEnd = verseStart;

      if (Number.isNaN(verseStart)) {
        setError('Invalid verse number.');
        return;
      }
    }

    // Fetch verses
    await fetchVerses(verseStart, verseEnd);
  };

  // Fetch verses (single or range)
  const fetchVerses = async (startVerse: number, endVerse: number) => {
    setIsLoading(true);

    try {
      const chapter = Number.parseInt(chapterInput);
      const verses = [];

      for (let verse = startVerse; verse <= endVerse; verse++) {
        const verseId = `${selectedBook}.${chapter}.${verse}`;
        const bookName = BIBLE_BOOKS.find((book) => book.id === selectedBook)?.name || selectedBook;

        const verseData = await fetchVerse({
          bibleId: selectedTranslation,
          verseId: verseId,
        });

        if (verseData?.content) {
          verses.push({
            ...verseData,
            bibleId: selectedTranslation,
          });
        } else {
          // Create fallback verse if API fails
          const fallbackVerse = {
            id: verseId,
            reference: `${bookName} ${chapter}:${verse}`,
            bookId: selectedBook,
            chapterId: `${selectedBook}.${chapter}`,
            content: 'Verse content unavailable. The API might be down.',
            bibleId: selectedTranslation,
          };
          verses.push(fallbackVerse);
        }
      }

      // If only one verse, select it directly
      if (verses.length === 1) {
        onVerseSelect(verses[0]);
      } else if (verses.length > 1) {
        // Combine multiple verses into one
        const firstVerse = verses[0];
        const combinedVerse = {
          id: `${firstVerse.id}-combined`,
          reference: `${firstVerse.reference.split(':')[0]}:${startVerse}-${endVerse}`,
          bookId: firstVerse.bookId,
          chapterId: firstVerse.chapterId,
          content: verses.map((v) => v.content).join(' '),
          bibleId: selectedTranslation,
        };
        onVerseSelect(combinedVerse);
      } else {
        setError('Could not load any verses.');
      }
    } catch (error) {
      console.error('Failed to fetch verses:', error);
      setError('Failed to fetch verse content.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Bible Translation Selection - 2 columns on large screens, full width on mobile */}
          <div className="md:col-span-2">
            <label htmlFor="translation" className="block text-sm font-medium text-gray-700 mb-1">
              Bible Translation
            </label>
            <select
              id="translation"
              value={selectedTranslation}
              onChange={handleTranslationChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading || translations.length === 0}
            >
              {translations.length === 0 && <option value="">Loading translations...</option>}
              {translations.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Selection - 2 columns on large screens, full width on mobile */}
          <div className="md:col-span-2">
            <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
              Book
            </label>
            <select
              id="book"
              value={selectedBook}
              onChange={handleBookChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              <option value="">Select a book</option>
              {BIBLE_BOOKS.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Input - 1 column on large screens, half width on mobile (with verse) */}
          <div className="md:col-span-1">
            <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
              Chapter
            </label>
            <input
              id="chapter"
              type="text"
              value={chapterInput}
              onChange={handleChapterChange}
              placeholder="Chapter"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading || !selectedBook}
            />
          </div>

          {/* Verse Input - 1 column on large screens, half width on mobile (with chapter) */}
          <div className="md:col-span-1">
            <label htmlFor="verse" className="block text-sm font-medium text-gray-700 mb-1">
              Verse
            </label>
            <input
              id="verse"
              type="text"
              value={verseInput}
              onChange={handleVerseChange}
              placeholder="e.g., 1 or 1-5"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading || !selectedBook || !chapterInput}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={validateAndFetchVerses}
          disabled={
            isLoading || !selectedTranslation || !selectedBook || !chapterInput || !verseInput
          }
          className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:bg-indigo-300"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            'Load Verse'
          )}
        </button>
      </div>
    </div>
  );
}

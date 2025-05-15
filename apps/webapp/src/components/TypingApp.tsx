import { api } from '@workspace/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useState } from 'react';
import { CustomBibleSelector } from './CustomBibleSelector';
import { CustomTypingInterface } from './CustomTypingInterface';

type BibleVerse = {
  id: string;
  reference: string;
  bookId: string;
  chapterId: string;
  content: string;
  bibleId?: string;
};

export function TypingApp() {
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  const handleVerseSelect = (verse: BibleVerse) => {
    setSelectedVerse(verse);
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">BibleType</h1>
        <p className="text-lg text-slate-600 mb-8">Improve your typing skills with Bible verses</p>

        <div className="flex flex-col gap-6">
          {/* <BibleSelector onVerseSelect={handleVerseSelect} /> */}
          <CustomBibleSelector onVerseSelect={handleVerseSelect} />
          <CustomTypingInterface verse={selectedVerse} />
        </div>
      </div>
    </div>
  );
}

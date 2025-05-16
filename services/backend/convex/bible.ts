import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { getAuthUser } from '../modules/auth/getAuthUser';
import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { action, mutation, query } from './_generated/server';

// Define types for the return values
type Translation = {
  id: string;
  name: string;
  language: { id: string; name: string };
};

type VerseData = {
  id: string;
  reference: string;
  bookId: string;
  chapterId: string;
  content: string;
} | null;

type CachedVerse = {
  id: string;
  bibleId: string;
  content: string;
  reference: string;
  bookId: string;
  chapterId: string;
} | null;

type TypingHistory = Array<{
  userId: Id<'users'>;
  timestamp: number;
  verseId: string;
  wpm: number;
  accuracy: number;
  translation: string;
  reference: string;
}>;

// Bible API interaction using bible-api.com
export const fetchTranslations = action({
  args: {},
  handler: async (ctx): Promise<Translation[]> => {
    // Bible-api.com supports these translations
    return [
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
      {
        id: 'clementine',
        name: 'Clementine Latin Vulgate',
        language: { id: 'lat', name: 'Latin' },
      },
      {
        id: 'almeida',
        name: 'João Ferreira de Almeida',
        language: { id: 'por', name: 'Portuguese' },
      },
      {
        id: 'rccv',
        name: 'Romanian Corrected Cornilescu Version',
        language: { id: 'rom', name: 'Romanian' },
      },
    ];
  },
});

export const fetchVerse = action({
  args: {
    bibleId: v.string(),
    verseId: v.string(),
  },
  handler: async (ctx, args): Promise<VerseData> => {
    try {
      // Try to get from cache first
      const cachedVerse = await ctx.runQuery(api.bible.getCachedVerse, {
        bibleId: args.bibleId,
        verseId: args.verseId,
      });

      if (cachedVerse) {
        return cachedVerse;
      }

      // Convert verseId to format usable by bible-api.com
      // From: JHN.3.16 to john+3:16
      const parts = args.verseId.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid verse ID format');
      }

      const bookCode = parts[0].toLowerCase();
      const bookMapping: Record<string, string> = {
        gen: 'genesis',
        exo: 'exodus',
        lev: 'leviticus',
        num: 'numbers',
        deu: 'deuteronomy',
        jos: 'joshua',
        jdg: 'judges',
        rut: 'ruth',
        '1sa': '1samuel',
        '2sa': '2samuel',
        '1ki': '1kings',
        '2ki': '2kings',
        '1ch': '1chronicles',
        '2ch': '2chronicles',
        ezr: 'ezra',
        neh: 'nehemiah',
        est: 'esther',
        job: 'job',
        psa: 'psalms',
        pro: 'proverbs',
        ecc: 'ecclesiastes',
        sng: 'song of solomon',
        isa: 'isaiah',
        jer: 'jeremiah',
        lam: 'lamentations',
        ezk: 'ezekiel',
        dan: 'daniel',
        hos: 'hosea',
        jol: 'joel',
        amo: 'amos',
        oba: 'obadiah',
        jon: 'jonah',
        mic: 'micah',
        nam: 'nahum',
        hab: 'habakkuk',
        zep: 'zephaniah',
        hag: 'haggai',
        zec: 'zechariah',
        mal: 'malachi',
        mat: 'matthew',
        mrk: 'mark',
        luk: 'luke',
        jhn: 'john',
        act: 'acts',
        rom: 'romans',
        '1co': '1corinthians',
        '2co': '2corinthians',
        gal: 'galatians',
        eph: 'ephesians',
        php: 'philippians',
        col: 'colossians',
        '1th': '1thessalonians',
        '2th': '2thessalonians',
        '1ti': '1timothy',
        '2ti': '2timothy',
        tit: 'titus',
        phm: 'philemon',
        heb: 'hebrews',
        jas: 'james',
        '1pe': '1peter',
        '2pe': '2peter',
        '1jn': '1john',
        '2jn': '2john',
        '3jn': '3john',
        jud: 'jude',
        rev: 'revelation',
      };

      const bookName = bookMapping[bookCode] || bookCode;
      const chapter = parts[1];
      const verse = parts[2];

      const reference = `${bookName}+${chapter}:${verse}`;

      // Add translation if not KJV (which is the default)
      const translation = args.bibleId === 'kjv' ? '' : `?translation=${args.bibleId}`;

      // Fetch from bible-api.com
      const response = await fetch(`https://bible-api.com/${reference}${translation}`);

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data?.text && data.verses) {
        // Format the response to match our expected structure
        const verseData = {
          id: args.verseId,
          reference: data.reference,
          bookId: bookCode,
          chapterId: `${bookCode}.${chapter}`,
          content: data.text.trim(),
        };

        // Cache the verse
        await ctx.runMutation(api.bible.cacheVerse, {
          verseId: args.verseId,
          bibleId: args.bibleId,
          content: verseData.content,
          reference: verseData.reference,
          bookId: verseData.bookId,
          chapterId: verseData.chapterId,
        });

        return verseData;
      }
      console.error('Invalid data format received from Bible API');
      return null;
    } catch (error) {
      console.error('Error fetching Bible verse:', error);
      return null;
    }
  },
});

// Get verse from cache
export const getCachedVerse = query({
  args: {
    bibleId: v.string(),
    verseId: v.string(),
  },
  handler: async (ctx, args): Promise<CachedVerse> => {
    const cached = await ctx.db
      .query('cachedVerses')
      .withIndex('by_verse', (q) => q.eq('verseId', args.verseId).eq('bibleId', args.bibleId))
      .first();

    if (cached) {
      // Transform to match the expected structure
      return {
        id: cached.verseId, // Use verseId as id to match VerseData type
        bibleId: cached.bibleId,
        content: cached.content,
        reference: cached.reference,
        bookId: cached.bookId,
        chapterId: cached.chapterId,
      };
    }

    return null;
  },
});

export const cacheVerse = mutation({
  args: {
    verseId: v.string(),
    bibleId: v.string(),
    content: v.string(),
    reference: v.string(),
    bookId: v.string(),
    chapterId: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const id = await ctx.db.insert('cachedVerses', args);
    return id;
  },
});

// Updated to use SessionIdArg like in budgets.ts
export const saveTypingResult = mutation({
  args: {
    ...SessionIdArg,
    verseId: v.string(),
    wpm: v.number(),
    accuracy: v.number(),
    translation: v.string(),
    reference: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Get authenticated user using same pattern as in budgets.ts
    const user = await getAuthUser(ctx, args);
    if (!user) {
      throw new Error('Unauthorized');
    }

    const id = await ctx.db.insert('typingHistory', {
      userId: user._id,
      timestamp: Date.now(),
      verseId: args.verseId,
      wpm: args.wpm,
      accuracy: args.accuracy,
      translation: args.translation,
      reference: args.reference,
    });

    return id;
  },
});

// Updated to use SessionIdArg like in budgets.ts
export const getTypingHistory = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args): Promise<TypingHistory> => {
    // Get authenticated user using same pattern as in budgets.ts
    const user = await getAuthUser(ctx, args);
    if (!user) {
      return [];
    }

    const results = await ctx.db
      .query('typingHistory')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(10);

    return results as unknown as TypingHistory;
  },
});

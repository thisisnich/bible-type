import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// DEPRECATION NOTICE: The fields `expiresAt` and `expiresAtLabel` in the sessions table are deprecated and no longer used for session expiry. They are only kept for migration compatibility and will be removed in a future migration.

export default defineSchema({
  appInfo: defineTable({
    latestVersion: v.string(),
  }),
  presentationState: defineTable({
    key: v.string(), // The presentation key that identifies this presentation
    currentSlide: v.number(), // The current slide number
    lastUpdated: v.number(), // Timestamp of last update
  }).index('by_key', ['key']),

  // auth
  users: defineTable(
    v.union(
      v.object({
        type: v.literal('full'),
        name: v.string(),
        username: v.string(),
        email: v.string(),
        recoveryCode: v.optional(v.string()),
      }),
      v.object({
        type: v.literal('anonymous'),
        name: v.string(), //system generated name
        recoveryCode: v.optional(v.string()),
      })
    )
  )
    .index('by_username', ['username'])
    .index('by_email', ['email'])
    .index('by_name', ['name']),

  //sessions
  sessions: defineTable({
    sessionId: v.string(), //this is provided by the client
    userId: v.id('users'), // null means session exists but not authenticated
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // DEPRECATED: No longer used for session expiry. Kept for migration compatibility.
    expiresAtLabel: v.optional(v.string()), // DEPRECATED: No longer used for session expiry. Kept for migration compatibility.
  }).index('by_sessionId', ['sessionId']),

  //login codes for cross-device authentication
  loginCodes: defineTable({
    code: v.string(), // The 8-letter login code
    userId: v.id('users'), // The user who generated this code
    createdAt: v.number(), // When the code was created
    expiresAt: v.number(), // When the code expires (1 minute after creation)
  }).index('by_code', ['code']),

  typingHistory: defineTable({
    // sessionId: v.string(), // The session ID of the user
    userId: v.id('users'), // The user who typed
    timestamp: v.number(), // When the typing happened
    wpm: v.number(), // Words per minute
    accuracy: v.number(), // Accuracy percentage
    translation: v.string(), // The translation used
    reference: v.string(), // The reference of the verse typed
    verseId: v.string(), // The ID of the verse
    content: v.optional(v.string()), // Optional: The actual content that was typed
    bookId: v.optional(v.string()), // The book ID (e.g., "JHN")
    chapterId: v.optional(v.string()), // The chapter ID (e.g., "JHN.3")
  }).index('by_user', ['userId']),

  cachedVerses: defineTable({
    verseId: v.string(), // The ID of the verse
    bibleId: v.string(), // The ID of the Bible
    content: v.string(), // The content of the verse
    reference: v.string(), // The reference of the verse
    bookId: v.string(), // The ID of the book
    chapterId: v.string(), // The ID of the chapter
  }).index('by_verse', ['verseId', 'bibleId']),
});

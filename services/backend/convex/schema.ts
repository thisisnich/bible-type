import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
      }),
      v.object({
        type: v.literal('anonymous'),
        name: v.string(), //system generated name
      })
    )
  )
    .index('by_username', ['username'])
    .index('by_email', ['email']),

  //sessions
  sessions: defineTable({
    sessionId: v.string(), //this is provided by the client
    userId: v.id('users'), // null means session exists but not authenticated
    createdAt: v.number(),
    expiresAt: v.number(),
    expiresAtLabel: v.string(),
  }).index('by_sessionId', ['sessionId']),

  //login codes for cross-device authentication
  loginCodes: defineTable({
    code: v.string(), // The 8-letter login code
    userId: v.id('users'), // The user who generated this code
    createdAt: v.number(), // When the code was created
    expiresAt: v.number(), // When the code expires (1 minute after creation)
  }).index('by_code', ['code']),
});

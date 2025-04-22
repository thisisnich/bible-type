import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import type { AuthState } from '../modules/auth/types/AuthState';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Helper function to generate random anonymous usernames
const generateAnonUsername = (): string => {
  const adjectives = [
    'Happy',
    'Curious',
    'Cheerful',
    'Bright',
    'Calm',
    'Eager',
    'Gentle',
    'Honest',
    'Kind',
    'Lively',
    'Polite',
    'Proud',
    'Silly',
    'Witty',
    'Brave',
  ];

  const nouns = [
    'Penguin',
    'Tiger',
    'Dolphin',
    'Eagle',
    'Koala',
    'Panda',
    'Fox',
    'Wolf',
    'Owl',
    'Rabbit',
    'Lion',
    'Bear',
    'Deer',
    'Hawk',
    'Turtle',
  ];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

export const getState = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args): Promise<AuthState> => {
    const exists = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!exists) {
      return {
        sessionId: args.sessionId,
        state: 'unauthenticated' as const,
        reason: 'session_not_found' as const,
      };
    }

    if (!exists.userId) {
      return {
        sessionId: args.sessionId,
        state: 'unauthenticated' as const, //this session was unlinked from the user
        reason: 'session_deauthorized' as const,
      };
    }

    const user = await ctx.db.get(exists.userId);

    if (!user) {
      return {
        sessionId: args.sessionId,
        state: 'unauthenticated' as const, //the linked user log longer exists
        reason: 'user_not_found' as const,
      };
    }

    return {
      sessionId: args.sessionId,
      state: 'authenticated' as const,
      user,
    };
  },
});

// Anonymous login mutation
export const loginAnon = mutation({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Check if the session exists
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    console.log('sessionId', args.sessionId);

    // Create a new session if it doesn't exist
    let sessionId: Id<'sessions'>;
    if (!existingSession) {
      const now = Date.now();
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now
      const expiresAtDate = new Date(expiresAt);
      sessionId = await ctx.db.insert('sessions', {
        sessionId: args.sessionId,
        userId: null,
        createdAt: now,
        expiresAt,
        expiresAtLabel: expiresAtDate.toISOString(),
      });
    } else {
      sessionId = existingSession._id;
    }

    // Create an anonymous user
    const anonName = generateAnonUsername();
    const userId = await ctx.db.insert('users', {
      type: 'anonymous',
      name: anonName,
    });

    // Link the session to the user
    await ctx.db.patch(sessionId, {
      userId,
    });

    return { success: true, userId };
  },
});

// Logout mutation
export const logout = mutation({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Find the session by sessionId
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!existingSession) {
      return { success: false, reason: 'session_not_found' };
    }

    // Unlink the user from the session by setting userId to null
    await ctx.db.patch(existingSession._id, {
      userId: null,
    });

    return { success: true };
  },
});

// Update user name mutation
export const updateUserName = mutation({
  args: {
    newName: v.string(),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Validate input
    if (args.newName.trim().length < 3) {
      return {
        success: false,
        reason: 'name_too_short',
        message: 'Name must be at least 3 characters long',
      };
    }

    if (args.newName.trim().length > 30) {
      return {
        success: false,
        reason: 'name_too_long',
        message: 'Name must be at most 30 characters long',
      };
    }

    // Find the session by sessionId
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!existingSession || !existingSession.userId) {
      return {
        success: false,
        reason: 'not_authenticated',
        message: 'You must be logged in to update your profile',
      };
    }

    // Get the user
    const user = await ctx.db.get(existingSession.userId);
    if (!user) {
      return {
        success: false,
        reason: 'user_not_found',
        message: 'User not found',
      };
    }

    // Update the user's name
    await ctx.db.patch(existingSession.userId, {
      name: args.newName.trim(),
    });

    return {
      success: true,
      message: 'Name updated successfully',
    };
  },
});

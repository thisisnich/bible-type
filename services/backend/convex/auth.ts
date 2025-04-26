import { SessionIdArg } from 'convex-helpers/server/sessions';
import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { generateLoginCode, getCodeExpirationTime, isCodeExpired } from '../modules/auth/codeUtils';
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

    // Create an anonymous user
    const anonName = generateAnonUsername();
    const userId = await ctx.db.insert('users', {
      type: 'anonymous',
      name: anonName,
    });

    // Create a new session if it doesn't exist
    let sessionId: Id<'sessions'>;
    if (!existingSession) {
      const now = Date.now();
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now
      const expiresAtDate = new Date(expiresAt);
      sessionId = await ctx.db.insert('sessions', {
        sessionId: args.sessionId,
        userId: userId as Id<'users'>,
        createdAt: now,
        expiresAt,
        expiresAtLabel: expiresAtDate.toISOString(),
      });
    } else {
      sessionId = existingSession._id;
    }

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

    if (existingSession) {
      await ctx.db.delete(existingSession._id);
    }

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

// Get active login code for the current user
export const getActiveLoginCode = query({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Find the session by sessionId
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!existingSession || !existingSession.userId) {
      return { success: false, reason: 'not_authenticated' };
    }

    const now = Date.now();

    // Find any active code for this user
    const activeCode = await ctx.db
      .query('loginCodes')
      .filter((q) =>
        q.and(q.eq(q.field('userId'), existingSession.userId), q.gt(q.field('expiresAt'), now))
      )
      .first();

    if (!activeCode) {
      return { success: false, reason: 'no_active_code' };
    }

    return {
      success: true,
      code: activeCode.code,
      expiresAt: activeCode.expiresAt,
    };
  },
});

// Generate a login code for cross-device authentication
export const createLoginCode = mutation({
  args: {
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Find the session by sessionId
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    if (!existingSession || !existingSession.userId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to generate a login code',
      });
    }

    // Get the user
    const user = await ctx.db.get(existingSession.userId);
    if (!user) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const now = Date.now();

    // Delete any existing active codes for this user
    const existingCodes = await ctx.db
      .query('loginCodes')
      .filter((q) => q.eq(q.field('userId'), existingSession.userId))
      .collect();

    // Delete all existing codes for this user
    for (const code of existingCodes) {
      await ctx.db.delete(code._id);
    }

    // Generate a new login code
    const codeString = generateLoginCode();
    const expiresAt = getCodeExpirationTime();

    // Store the code in the database
    await ctx.db.insert('loginCodes', {
      code: codeString,
      userId: existingSession.userId,
      createdAt: now,
      expiresAt,
    });

    return {
      success: true,
      code: codeString,
      expiresAt,
    };
  },
});

// Verify and use a login code
export const verifyLoginCode = mutation({
  args: {
    code: v.string(),
    ...SessionIdArg,
  },
  handler: async (ctx, args) => {
    // Clean up the code (removing dashes if any)
    const cleanCode = args.code.replace(/-/g, '').toUpperCase();

    // Find the login code
    const loginCode = await ctx.db
      .query('loginCodes')
      .withIndex('by_code', (q) => q.eq('code', cleanCode))
      .first();

    if (!loginCode) {
      return {
        success: false,
        reason: 'invalid_code',
        message: 'Invalid login code',
      };
    }

    // Check if the code is expired
    if (isCodeExpired(loginCode.expiresAt)) {
      // Delete the expired code
      await ctx.db.delete(loginCode._id);
      return {
        success: false,
        reason: 'code_expired',
        message: 'This login code has expired',
      };
    }

    // Get the user associated with the code
    const user = await ctx.db.get(loginCode.userId);
    if (!user) {
      return {
        success: false,
        reason: 'user_not_found',
        message: 'User not found',
      };
    }

    // Delete the code once used
    await ctx.db.delete(loginCode._id);

    // Check if the session exists
    const existingSession = await ctx.db
      .query('sessions')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .first();

    // Create or update session
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now
    const expiresAtDate = new Date(expiresAt);

    if (existingSession) {
      // Update existing session to point to the user
      await ctx.db.patch(existingSession._id, {
        userId: loginCode.userId,
        expiresAt,
        expiresAtLabel: expiresAtDate.toISOString(),
      });
    } else {
      // Create a new session
      await ctx.db.insert('sessions', {
        sessionId: args.sessionId,
        userId: loginCode.userId,
        createdAt: now,
        expiresAt,
        expiresAtLabel: expiresAtDate.toISOString(),
      });
    }

    return {
      success: true,
      message: 'Login successful',
      user,
    };
  },
});

// Check if a login code is still valid (not used and not expired)
export const checkCodeValidity = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Clean up the code (removing dashes if any)
    const cleanCode = args.code.replace(/-/g, '').toUpperCase();

    // Find the login code
    const loginCode = await ctx.db
      .query('loginCodes')
      .withIndex('by_code', (q) => q.eq('code', cleanCode))
      .first();

    // If the code doesn't exist, it's not valid
    if (!loginCode) {
      return false;
    }

    // Check if the code is expired
    if (isCodeExpired(loginCode.expiresAt)) {
      return false;
    }

    // The code exists and is not expired, so it's valid
    return true;
  },
});

import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalMutation, internalQuery } from './_generated/server';

const BATCH_SIZE = 100; // Process 100 sessions per batch

// Internal mutation to unset expiration fields for a single session
export const unsetSessionExpiration = internalMutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      expiresAt: undefined,
      expiresAtLabel: undefined,
    });
  },
});

// Internal action to iterate through all sessions and unset expiration
export const migrateUnsetSessionExpiration = internalAction({
  args: { cursor: v.optional(v.string()) }, // Convex cursor for pagination
  handler: async (ctx, args) => {
    const paginationOpts = {
      numItems: BATCH_SIZE,
      cursor: args.cursor ?? null,
    };

    // Fetch a batch of sessions
    const results = await ctx.runQuery(internal.migration.getSessionsBatch, {
      paginationOpts,
    });

    // Schedule mutations to update each session in the batch
    for (const session of results.page) {
      await ctx.runMutation(internal.migration.unsetSessionExpiration, {
        sessionId: session._id,
      });
    }

    // If there are more sessions, schedule the next batch
    if (!results.isDone) {
      await ctx.runAction(internal.migration.migrateUnsetSessionExpiration, {
        cursor: results.continueCursor,
      });
    }
  },
});

// Helper query to get sessions with pagination (used by the action)
export const getSessionsBatch = internalQuery({
  args: { paginationOpts: v.any() }, // Using v.any() for simplicity, consider a stricter type
  handler: async (ctx, args) => {
    return await ctx.db.query('sessions').paginate(args.paginationOpts);
  },
});

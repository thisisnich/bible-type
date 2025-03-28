import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get the current state of a presentation
export const getPresentationState = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up the presentation state by key
    const state = await ctx.db
      .query('presentationState')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (!state) {
      // If no state exists for this key, return default values
      return {
        key: args.key,
        currentSlide: 0,
        lastUpdated: 0,
        exists: false,
      };
    }

    return {
      ...state,
      exists: true,
    };
  },
});

// Set the current slide for a presentation
export const setCurrentSlide = mutation({
  args: {
    key: v.string(),
    slide: v.number(),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = args.timestamp || Date.now();

    // Look up the presentation state by key
    const state = await ctx.db
      .query('presentationState')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (!state) {
      // If no state exists for this key, create a new one
      return await ctx.db.insert('presentationState', {
        key: args.key,
        currentSlide: args.slide,
        lastUpdated: timestamp,
      });
    }

    // Only update if the incoming timestamp is newer than the existing one
    if (timestamp > state.lastUpdated) {
      // Update the existing state
      return await ctx.db.patch(state._id, {
        currentSlide: args.slide,
        lastUpdated: timestamp,
      });
    }

    // Return the current state if we didn't update
    return state._id;
  },
});

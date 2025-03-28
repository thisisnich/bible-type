import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  appInfo: defineTable({
    latestVersion: v.string(),
  }),
});

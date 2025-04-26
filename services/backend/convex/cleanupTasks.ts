import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
import { internalMutation } from './_generated/server';

// Internal mutation to clean up expired login codes
export const cleanupExpiredLoginCodes = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expiredCodes = await ctx.db
      .query('loginCodes')
      .filter((q) => q.lt(q.field('expiresAt'), now))
      .collect();

    // Delete each expired code
    let deletedCount = 0;
    for (const code of expiredCodes) {
      await ctx.db.delete(code._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});

// Register the cron job to run cleanup every 5 minutes
const cleanupCronJobs = cronJobs();

cleanupCronJobs.interval(
  'cleanup expired login codes',
  { minutes: 5 },
  internal.cleanupTasks.cleanupExpiredLoginCodes
);

export default cleanupCronJobs;

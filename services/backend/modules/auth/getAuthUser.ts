import type { SessionId } from 'convex-helpers/server/sessions';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';

export const getAuthUser = async (ctx: QueryCtx | MutationCtx, args: { sessionId: SessionId }) => {
  const session = await ctx.db
    .query('sessions')
    .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
    .first();
  if (!session) {
    throw new Error('Session not found');
  }

  // Session expiry is deprecated and no longer checked.

  const user = await ctx.db.get(session.userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

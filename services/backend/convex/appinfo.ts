import { query } from './_generated/server';
export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const appInfo = await ctx.db.query('appInfo').first();
    return {
      version: appInfo?.latestVersion || '1.0.0',
    };
  },
});

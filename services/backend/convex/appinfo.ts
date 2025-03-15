import { query } from './_generated/server';
export const get = query({
  args: {},
  handler: async (ctx, args) => {
    return {
      version: '1.0.0',
    };
  },
});

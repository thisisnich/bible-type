import type { Doc } from '@workspace/backend/convex/_generated/dataModel';

export type AuthState =
  | {
      state: 'unauthenticated';
      reason: string;
    }
  | {
      state: 'authenticated';
      user: Doc<'users'>;
    };

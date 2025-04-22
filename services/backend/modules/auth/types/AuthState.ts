import type { Doc } from '../../../convex/_generated/dataModel';

export type AuthState =
  | {
      sessionId: string;
      state: 'unauthenticated';
      reason: string;
    }
  | {
      sessionId: string;
      state: 'authenticated';
      user: Doc<'users'>;
    };

'use client';
import { api } from '@workspace/backend/convex/_generated/api';
import type { AuthState } from '@workspace/backend/types/auth/AuthState';
import { useQuery } from 'convex/react';
import { createContext, useContext, useEffect, useState } from 'react';
const SESSION_ID_KEY = 'sessionId';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    //1. load from local storage
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (sessionId) {
      setSessionId(sessionId);
    } else {
      //create a new session id
      const newSessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  //2. get the backend validation of what the auth state is
  const authState = useQuery(api.auth.getState, sessionId ? { sessionId } : 'skip');
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

export const useAuthState = () => {
  const authState = useContext(AuthContext);
  return authState;
};

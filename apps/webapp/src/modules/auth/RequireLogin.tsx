'use client';
import { UnauthorizedPage } from '@/components/UnauthorizedPage';
import { useAuthState } from '@/modules/auth/AuthProvider';

export const RequireLogin = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();

  if (!authState) {
    return <></>;
  }

  if (authState.state === 'unauthenticated') {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

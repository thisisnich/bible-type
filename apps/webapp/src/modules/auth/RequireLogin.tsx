'use client';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/modules/auth/AuthProvider';
import Link from 'next/link';
export const RequireLogin = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthState();
  if (!authState) {
    return <></>;
  }
  if (authState.state === 'unauthenticated') {
    return (
      <>
        <div>
          <h1>Unauthorized</h1>
          <p>You must be logged in to access this page.</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </>
    );
  }
  return <>{children}</>;
};

'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@workspace/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const AnonymousLoginButton = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const loginAnon = useMutation(api.auth.loginAnon);

  const handleClick = async () => {
    if (!sessionId) {
      toast.error('Session ID not available. Please try again later.');
      return;
    }

    setIsLoading(true);
    try {
      await loginAnon({ sessionId });
      toast.success('Logged in anonymously');
      router.push('/app');
    } catch (error) {
      console.error('Anonymous login failed:', error);
      toast.error('Failed to login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={handleClick} disabled={isLoading} className="w-full">
            {isLoading ? 'Logging in...' : 'Login Anonymously'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Continue without creating an account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

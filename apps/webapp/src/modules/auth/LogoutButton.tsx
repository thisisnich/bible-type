'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function LogoutButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const logout = useSessionMutation(api.auth.logout);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-sm font-medium"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sign out of your account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

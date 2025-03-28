'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Copy, Info, LinkIcon, Maximize2, Minimize2, MonitorSmartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { usePresentationContext } from './presentation-container';

export function PresentationControls() {
  const {
    currentSlide,
    totalSlides,
    previousSlide,
    nextSlide,
    isFullScreen,
    controlsVisible,
    isSynced,
    toggleFullScreen,
    toggleSyncMode,
  } = usePresentationContext();

  const [showSyncInfo, setShowSyncInfo] = useState(false);

  const handleCloseModal = () => {
    setShowSyncInfo(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseModal();
    }
  };

  const copyShareableLink = () => {
    // Create URL with sync=true parameter and current slide
    const url = new URL(window.location.href);
    url.searchParams.set('sync', 'true');
    url.searchParams.set('slide', currentSlide.toString());

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        toast.success('Link copied!', {
          description: 'Shareable link with sync enabled has been copied to clipboard',
          duration: 3000,
        });
      })
      .catch((error) => {
        toast.error('Failed to copy', {
          description: 'Please copy the URL manually from your address bar',
          duration: 3000,
        });
        console.error('Failed to copy URL:', error);
      });
  };

  return (
    <>
      {/* Main Controls */}
      <div
        className={cn(
          'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-3 transition-opacity duration-300 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md',
          isFullScreen && !controlsVisible && 'opacity-0'
        )}
      >
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={previousSlide}>
            ←
          </Button>
          <div className="min-w-12 text-center">
            {currentSlide} / {totalSlides}
          </div>
          <Button variant="ghost" size="icon" onClick={nextSlide}>
            →
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="h-8 w-8">
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isSynced ? 'default' : 'ghost'}
                size="icon"
                onClick={toggleSyncMode}
                className="h-8 w-8"
              >
                <MonitorSmartphone className={cn('h-4 w-4', isSynced && 'text-background')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSynced ? 'Disable Sync' : 'Enable Sync'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSyncInfo(true)}
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Presentation Info</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Info Modal for Sync */}
      {showSyncInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          aria-hidden="true"
        >
          <dialog
            open
            className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCloseModal();
            }}
          >
            <h2 className="mb-4 text-xl font-bold">Presentation Controls</h2>

            <div className="mb-6 space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Keyboard shortcuts:</span>
              </p>
              <ul className="text-sm">
                <li>
                  <span className="font-mono">←</span> or <span className="font-mono">→</span> -
                  Navigate slides
                </li>
                <li>
                  <span className="font-mono">Space</span> - Next slide
                </li>
                <li>
                  <span className="font-mono">F</span> - Toggle fullscreen
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm">
                <span className="font-semibold">Sync Status:</span>{' '}
                {isSynced ? (
                  <span className="font-medium text-green-500">Enabled</span>
                ) : (
                  <span className="font-medium text-yellow-500">Disabled</span>
                )}
              </p>
              {isSynced && (
                <p className="text-xs text-muted-foreground">
                  When sync is enabled, all viewers will see the same slide as the presenter. Sync
                  status is included in the URL for easy sharing.
                </p>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareableLink}
                  className="flex items-center gap-2 text-xs"
                >
                  <LinkIcon className="h-3 w-3" />
                  Copy shareable link
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCloseModal}>Close</Button>
            </div>
          </dialog>
        </div>
      )}
    </>
  );
}

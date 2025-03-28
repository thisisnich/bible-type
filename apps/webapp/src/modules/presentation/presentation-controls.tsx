'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Copy, Info, LinkIcon, Maximize2, Minimize2, MonitorSmartphone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseModal = useCallback(() => {
    setShowSyncInfo(false);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSyncInfo) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [showSyncInfo, handleCloseModal]);

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

        <div className="flex items-center gap-2">
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
                  ref={infoButtonRef}
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
      </div>

      {/* Info Modal for Sync - Position relative to info button */}
      {showSyncInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          aria-hidden="true"
        >
          <dialog
            open
            className="absolute z-50 bg-card shadow-lg rounded-lg p-4 w-80"
            style={{
              top: infoButtonRef.current
                ? infoButtonRef.current.getBoundingClientRect().top - 330
                : 'auto',
              left: infoButtonRef.current
                ? infoButtonRef.current.getBoundingClientRect().left - 150
                : 'auto',
              margin: 0,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Presentation Controls</h2>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCloseModal}>
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              <section>
                <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
                <ul className="text-xs mt-1 space-y-1">
                  <li className="flex justify-between">
                    <span className="font-mono">←/→</span>
                    <span>Navigate slides</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-mono">Space</span>
                    <span>Next slide</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-mono">F</span>
                    <span>Toggle fullscreen</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-mono">Esc</span>
                    <span>Close this dialog</span>
                  </li>
                </ul>
              </section>

              <div className="h-px w-full bg-border" />

              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Sync Status</h3>
                  <span
                    className={`text-xs font-medium ${isSynced ? 'text-green-500' : 'text-yellow-500'}`}
                  >
                    {isSynced ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {isSynced && (
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, all viewers will see the same slide.
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareableLink}
                  className="flex items-center gap-1 text-xs w-full mt-2 h-8"
                >
                  <LinkIcon className="h-3 w-3" />
                  Copy shareable link
                </Button>
              </section>
            </div>
          </dialog>
        </div>
      )}
    </>
  );
}

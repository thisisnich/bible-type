import { api } from '@workspace/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export function usePresentationSync({
  key,
  initialSlide = 1,
  totalSlides,
  enabled = true,
}: {
  key: string;
  initialSlide?: number;
  totalSlides: number;
  enabled?: boolean;
}) {
  // Internal state for current slide (this is the source of truth)
  const [currentSlide, setCurrentSlideInternal] = useState(initialSlide);

  // Track if we're currently processing an update to avoid loops
  const updatingRef = useRef(false);

  // Convert UI slide (1-based) to API slide (0-based)
  const apiSlide = currentSlide - 1;

  // Get URL parameters to check sync status
  const searchParams = useSearchParams();
  const router = useRouter();
  const syncParam = searchParams.get('sync');
  const slideParam = searchParams.get('slide');

  // Determine if sync is enabled from URL parameter
  const isSyncEnabled = enabled && syncParam === 'true';

  // Read initial slide from URL on mount
  useEffect(() => {
    if (!updatingRef.current && slideParam) {
      const slideFromUrl = Number.parseInt(slideParam, 10);
      if (
        !Number.isNaN(slideFromUrl) &&
        slideFromUrl >= 1 &&
        slideFromUrl <= totalSlides &&
        slideFromUrl !== currentSlide
      ) {
        setCurrentSlideInternal(slideFromUrl);
      }
    }
  }, [slideParam, totalSlides, currentSlide]);

  // Update URL when slide changes (without triggering a full page reload)
  const updateUrlWithSlide = useCallback(
    (slideNumber: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('slide', slideNumber.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Get current state from backend
  const presentationState = useQuery(
    api.presentations.getPresentationState,
    isSyncEnabled ? { key } : 'skip'
  );

  // Mutation to update backend
  const updateSlide = useMutation(api.presentations.setCurrentSlide);

  // Sync to backend
  const syncToBackend = useCallback(
    (slideNumber: number) => {
      if (!isSyncEnabled || !key) return;
      updateSlide({ key, slide: slideNumber - 1 });
    },
    [key, updateSlide, isSyncEnabled]
  );

  // Set the slide with side effects (URL update, backend sync)
  const setCurrentSlide = useCallback(
    (slideNumber: number, { fromBackend = false, updateUrl = true, updateBackend = true } = {}) => {
      try {
        updatingRef.current = true;

        // Validate and clamp slide number
        const validSlide = Math.max(1, Math.min(slideNumber, totalSlides));

        // Update internal state
        setCurrentSlideInternal(validSlide);

        // Update URL if needed
        if (updateUrl) {
          updateUrlWithSlide(validSlide);
        }

        // Update backend if needed and not originated from backend
        if (updateBackend && !fromBackend && isSyncEnabled) {
          syncToBackend(validSlide);
        }
      } finally {
        // Use a small timeout to ensure state updates complete
        // before we start listening to further changes
        setTimeout(() => {
          updatingRef.current = false;
        }, 100);
      }
    },
    [totalSlides, isSyncEnabled, updateUrlWithSlide, syncToBackend]
  );

  // Navigation methods
  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, setCurrentSlide]);

  const previousSlide = useCallback(() => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide, setCurrentSlide]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
    },
    [setCurrentSlide]
  );

  // Handle remote updates from backend
  useEffect(() => {
    if (!isSyncEnabled || !presentationState || updatingRef.current) return;

    const backendSlide = presentationState.currentSlide + 1; // Convert from 0-based to 1-based
    if (backendSlide !== currentSlide) {
      // Only update URL and internal state, not the backend again
      setCurrentSlide(backendSlide, { fromBackend: true, updateBackend: false });
    }
  }, [presentationState, currentSlide, isSyncEnabled, setCurrentSlide]);

  // Function to toggle sync mode by updating URL
  const toggleSyncMode = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newSyncValue = syncParam !== 'true' ? 'true' : 'false';

    params.set('sync', newSyncValue);
    // Always include the current slide in the URL
    params.set('slide', currentSlide.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, syncParam, router, currentSlide]);

  return {
    currentSlide,
    setCurrentSlide,
    nextSlide,
    previousSlide,
    goToSlide,
    isConnected: !!presentationState,
    isSyncEnabled,
    toggleSyncMode,
  };
}

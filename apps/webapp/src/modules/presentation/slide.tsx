'use client';

import { cn } from '@/lib/utils';
import { usePresentationContext } from '../../modules/presentation/presentation-container';

interface SlideProps {
  index: number;
  children: React.ReactNode;
  className?: string;
}

export function Slide({ index, children, className }: SlideProps) {
  const { currentSlide } = usePresentationContext();
  const isActive = currentSlide === index;

  if (!isActive) return null;

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center p-8',
        'animate-in fade-in duration-500',
        className
      )}
    >
      {children}
    </div>
  );
}

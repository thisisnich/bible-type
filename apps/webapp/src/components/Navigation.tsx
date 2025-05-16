'use client';

import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthState } from '@/modules/auth/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const authState = useAuthState();
  const isAuthenticated = authState?.state === 'authenticated';
  const isLoading = authState === undefined;

  // Memoize navigation items to prevent unnecessary recalculations
  const navItems = useMemo(
    () => [
      ...(isAuthenticated
        ? [
            {
              href: '/app',
              label: 'Dashboard',
              isActive: pathname === '/app',
            },
            // Add more navigation items for authenticated users here
            // Example:
            {
              href: '/history',
              label: 'History',
              isActive: pathname.startsWith('/study'),
            },
            {
              href: '/verses',
              label: 'Verses',
              isActive: pathname.startsWith('/verses'),
            },
            {
              href: '/practice',
              label: 'Practice',
              isActive: pathname.startsWith('/practice'),
            },
          ]
        : [
            // Navigation items for non-authenticated users
            {
              href: '/about',
              label: 'About',
              isActive: pathname === '/about',
            },
            {
              href: '/features',
              label: 'Features',
              isActive: pathname === '/features',
            },
          ]),
    ],
    [pathname, isAuthenticated]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex">
          <Link
            href={isAuthenticated ? '/app' : '/'}
            className="flex items-center whitespace-nowrap"
          >
            <span className="font-bold text-lg">Bible Type</span>
          </Link>
        </div>

        {/* Main container for navigation and user menu */}
        <div className="flex items-center justify-between gap-4">
          {/* Desktop navigation - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  item.isActive ? 'text-foreground font-medium' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu - visible on all screens */}
          <div>
            {!isLoading &&
              (isAuthenticated ? (
                <UserMenu showNameOnMobile={false} alignMenu="end" />
              ) : (
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Login
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}

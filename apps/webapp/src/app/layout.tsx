import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/app/ConvexClientProvider';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/modules/auth/AuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next Convex App',
  description: 'A Next.js app with Convex backend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
        </ConvexClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

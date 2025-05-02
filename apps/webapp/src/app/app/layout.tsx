'use client';

import { RequireLogin } from '@/modules/auth/RequireLogin';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireLogin>{children}</RequireLogin>;
}

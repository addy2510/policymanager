'use client';

import { ReactNode } from 'react';
import { SessionProvider } from '@/app/context/SessionContext';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

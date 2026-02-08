'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface SessionContextType {
  handleSessionExpiry: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleSessionExpiry = useCallback(() => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login page using Next.js router for smooth navigation
    router.push('/');
  }, [router]);

  return (
    <SessionContext.Provider value={{ handleSessionExpiry }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

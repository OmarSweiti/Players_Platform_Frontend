'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { User } from '@/features/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Signed out, plainly. The browser cannot know the member: the session
// cookies are HttpOnly, which is the point, and the hook that waited for them
// to become readable never ran a query. The session arrives with 0.9.5, from
// GET /api/v1/auth/session.
const SIGNED_OUT: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

/**
 * Auth Provider - Manages authentication state across the application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={SIGNED_OUT}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

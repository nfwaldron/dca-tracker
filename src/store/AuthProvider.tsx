import { createContext, useContext } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type React from 'react';

interface AppAuth {
  userId: string | null | undefined;
  getToken: (opts?: { template?: string }) => Promise<string | null>;
}

// Default = permanently guest (used when no ClerkProvider in the tree)
const AuthCtx = createContext<AppAuth>({
  userId: null,
  getToken: async () => null,
});

export const useAppAuth = () => useContext(AuthCtx);

// Only rendered inside ClerkProvider — safe to call useAuth() unconditionally here
export function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();
  return (
    <AuthCtx.Provider value={{ userId: userId ?? null, getToken }}>
      {children}
    </AuthCtx.Provider>
  );
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import type { AuthUser, RegisterPayload } from '../api/auth';

type AuthContextValue = {
  user: AuthUser | null;
  /** true tant que la session initiale (token persistant) est en cours de chargement. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Fournit l'état d'authentification à toute l'app.
 * Au montage : recharge le token persistant et réhydrate l'utilisateur via /auth/me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const hasToken = await authApi.loadToken();
        if (hasToken) {
          const current = await authApi.me();
          if (active) setUser(current);
        }
      } catch {
        // Token invalide/expiré → on repart déconnecté.
        await authApi.logout();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => setUser(await authApi.login(email, password)),
      register: async (payload) => setUser(await authApi.register(payload)),
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}

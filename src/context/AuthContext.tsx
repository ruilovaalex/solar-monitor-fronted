import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { AuthSession, Permission, User } from "@/types";

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => api.getSession());

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      async login(email, password) {
        const nextSession = await api.login(email, password);
        setSession(nextSession);
      },
      logout() {
        api.logout();
        setSession(null);
      },
      can(permission) {
        return session?.user.permissions.includes(permission) ?? false;
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

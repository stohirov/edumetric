"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError, getToken, setToken } from "@/lib/api";
import type { Role, UserDto } from "@/types/api";

// Login either completes (user) or stalls awaiting a 2FA code (mfaToken).
export type LoginResult =
  | { mfaRequired: false; user: UserDto }
  | { mfaRequired: true; mfaToken: string };

interface AuthContextValue {
  user: UserDto | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (mfaToken: string, code: string) => Promise<UserDto>;
  logout: () => Promise<void>;
  refresh: () => Promise<UserDto | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function roleHomePath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    case "PARENT":
      return "/parent";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] =
    useState<AuthContextValue["status"]>("loading");
  const hasBootstrapped = useRef(false);

  const refresh = useCallback(async (): Promise<UserDto | null> => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
      return me;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
      }
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const res = await authApi.login({ email, password });
      if (res.mfaRequired && res.mfaToken) {
        return { mfaRequired: true, mfaToken: res.mfaToken };
      }
      if (res.user) {
        setUser(res.user);
        setStatus("authenticated");
        return { mfaRequired: false, user: res.user };
      }
      throw new ApiError("Unexpected login response", 500);
    },
    [],
  );

  const verifyTwoFactor = useCallback(
    async (mfaToken: string, code: string): Promise<UserDto> => {
      const res = await authApi.verifyTwoFactor({ mfaToken, code });
      if (!res.user) {
        throw new ApiError("Unexpected verification response", 500);
      }
      setUser(res.user);
      setStatus("authenticated");
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, verifyTwoFactor, logout, refresh }),
    [user, status, login, verifyTwoFactor, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

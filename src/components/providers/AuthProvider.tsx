'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  nickname: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (nickname: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nickname: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

// ─── Context ────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Safe hook that returns null when used outside AuthProvider
 * (useful for components that may render before provider mounts)
 */
export function useAuthSafe(): AuthContextType | null {
  return useContext(AuthContext);
}

// ─── Provider ───────────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser({
            id: data.user.id,
            nickname: data.user.nickname,
            createdAt: data.user.createdAt,
          });
        }
      }
    } catch {
      // Not authenticated, that's fine
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (nickname: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nickname, password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          nickname: data.user.nickname,
        });
        return { success: true };
      }

      return { success: false, error: data.error || '로그인에 실패했습니다.' };
    } catch {
      return { success: false, error: '서버 연결에 실패했습니다.' };
    }
  }, []);

  const register = useCallback(async (nickname: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nickname, password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          nickname: data.user.nickname,
        });
        return { success: true };
      }

      return { success: false, error: data.error || '회원가입에 실패했습니다.' };
    } catch {
      return { success: false, error: '서버 연결에 실패했습니다.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors, clear user anyway
    }
    setUser(null);
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

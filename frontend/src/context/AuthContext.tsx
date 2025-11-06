import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

type AuthContextValue = {
  token: string | null;
  user?: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );
  const [user, setUser] = useState<any | undefined>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : undefined;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Decode user info from token and store it
      const userData = api.getCurrentUserFromToken();
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(undefined);
    }
  }, [token]);

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    // Expect res to contain access token (adjust based on backend response)
    const t = res?.access_token ?? res?.token ?? null;
    if (!t) throw new Error('No token returned');
    setToken(t);
  }

  async function googleLogin(
    idToken: string,
    email?: string,
    username?: string,
  ) {
    const res = await api.googleSignIn({ idToken, email, username });
    const t = res?.access_token ?? res?.token ?? null;
    if (!t) throw new Error('No token returned from google sign-in');
    setToken(t);
  }

  function logout() {
    setToken(null);
    setUser(undefined);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, googleLogin } as any}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

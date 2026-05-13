import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';

// ── Create Context ────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Auth Provider ─────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.data.user);
        } catch {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // ── Login ───────────────────────────────────────────────────
  const login = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
  };

  // ── Logout ──────────────────────────────────────────────────
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // ── Role checks ─────────────────────────────────────────────
  const isHost    = user?.role === 'host';
  const isAdmin   = user?.role === 'admin';
  const isUser    = user?.role === 'user';
  const isLoggedIn= !!user;

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout,
      isHost, isAdmin, isUser, isLoggedIn,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom hook ───────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);
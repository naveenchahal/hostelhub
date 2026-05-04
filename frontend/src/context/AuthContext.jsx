import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('hh_user') || 'null'));
  const [token, setToken]     = useState(() => localStorage.getItem('hh_token') || '');
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authApi.getMe();
        // Role ALWAYS comes from DB — never trust localStorage role
        setUser(data.user);
        localStorage.setItem('hh_user', JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const login = useCallback((tkn, userData) => {
    setToken(tkn);
    setUser(userData); // role from DB response only
    localStorage.setItem('hh_token', tkn);
    localStorage.setItem('hh_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setToken('');
    setUser(null);
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_user');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('hh_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isWarden  = user?.role === 'warden' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, token, loading, isWarden, isStudent, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
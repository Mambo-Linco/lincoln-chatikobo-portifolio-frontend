import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.get('/api/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const finish = ({ token, user }) => { setToken(token); setUser(user); return user; };
  const login = useCallback(async (email, password) => finish(await api.post('/api/auth/login', { email, password })), []);
  const register = useCallback(async (data) => finish(await api.post('/api/auth/register', data)), []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const value = {
    user, loading, login, register, logout,
    isAdmin: user?.role === 'admin',
    canUpload: !!user?.canUpload,
    canDownload: !!user?.canDownload,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

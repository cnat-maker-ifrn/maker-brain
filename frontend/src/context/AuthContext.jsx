import { createContext, useContext, useState, useEffect } from 'react';
import { decodeJwtPayload } from '@/frontLib/jwt';

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = 'makerbrain:accessToken';
const REFRESH_TOKEN_KEY = 'makerbrain:refreshToken';

function getUserFromToken(accessToken) {
  const decoded = decodeJwtPayload(accessToken);
  if (!decoded) return null;

  return {
    id: decoded.user_id,
    email: decoded.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      setUser(getUserFromToken(accessToken));
    }
    setIsLoading(false);
  }, []);

  const login = ({ access, refresh }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setUser(getUserFromToken(access));
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
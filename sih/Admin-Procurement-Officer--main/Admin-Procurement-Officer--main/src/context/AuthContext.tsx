import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getAuthToken, getTokenRole, getStoredUser, setAuthSession, clearAuthSession, apiRequest } from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'officer' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  loginAdmin: (username: string, password: string) => Promise<void>;
  loginOfficer: (officer_id: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAuthToken();
    const stored = getStoredUser();
    const tokenRole = getTokenRole(token);
    const storedRole = typeof stored?.role === 'string' ? stored.role.toLowerCase() : null;
    if (token && stored && tokenRole && tokenRole === storedRole) {
      setUser(stored);
    } else {
      clearAuthSession();
      setUser(null);
      if (token && stored && window.location.pathname !== '/officer/login' && window.location.pathname !== '/admin/login') {
        const loginPath = storedRole === 'admin' ? '/admin/login' : '/officer/login';
        window.location.replace(`${loginPath}?reason=permissions`);
      }
    }
    setIsLoading(false);
  }, []);

  const loginAdmin = async (username: string, password: string) => {
    const res = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    const userData = {
      id: username,
      username: username,
      role: 'admin',
      name: 'System Admin'
    };
    setAuthSession(res.access_token, userData);
    setUser(userData as any);
  };

  const loginOfficer = async (officer_id: string, password: string) => {
    const res = await apiRequest('/auth/officer/login', {
      method: 'POST',
      body: JSON.stringify({ username: officer_id, password }),
    });
    const userData = {
      id: officer_id,
      username: officer_id,
      role: 'officer',
      name: 'Procurement Officer',
      assigned_center_id: res.assigned_center_id
    };
    setAuthSession(res.access_token, userData);
    setUser(userData as any);
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    window.location.href = '/';
  };

  const role = user?.role || null;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        loading: isLoading,
        loginAdmin,
        loginOfficer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

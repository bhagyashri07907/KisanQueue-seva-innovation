import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farmer } from '../types';
import { getCurrentFarmer, loginFarmer, registerFarmer, logoutFarmer, updateFarmerProfile } from '../services/api';
import { DEMO_FARMERS } from '../data/mockData';

const TOKEN_KEY = 'kq_farmer_token';

interface AuthContextType {
  farmer: Farmer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    fullName: string;
    mobileNumber: string;
    farmerId: string;
    village: string;
    taluka: string;
    district: string;
    email?: string;
    password?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoFarmer: (farmerId: string) => Promise<void>;
  updateProfile: (updates: Partial<Farmer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only restore session if a real JWT token exists in localStorage.
    // Do NOT fall back to demo farmer — that would make the app appear
    // authenticated while API calls would have no Authorization header.
    const token = localStorage.getItem(TOKEN_KEY);
    const current = getCurrentFarmer();
    if (token && current) {
      setFarmer(current);
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    const result = await loginFarmer(identifier, password);
    setIsLoading(false);
    if (result.success && result.farmer) {
      setFarmer(result.farmer);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const register = async (data: {
    fullName: string;
    mobileNumber: string;
    farmerId: string;
    village: string;
    taluka: string;
    district: string;
    email?: string;
    password?: string;
  }) => {
    setIsLoading(true);
    const result = await registerFarmer(data);
    setIsLoading(false);
    if (result.success && result.farmer) {
      setFarmer(result.farmer);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const logout = () => {
    logoutFarmer();
    setFarmer(null);
  };

  const switchDemoFarmer = async (farmerId: string) => {
    // Demo farmers are registered in the DB with password 'password123'.
    // We must call the real login API so a JWT token is stored — otherwise
    // every subsequent API call will receive 401 Unauthorized.
    const target = DEMO_FARMERS.find((f) => f.id === farmerId) || DEMO_FARMERS[0];
    const result = await loginFarmer(target.farmerId, 'password123');
    if (result.success && result.farmer) {
      setFarmer(result.farmer);
    } else {
      localStorage.setItem('kq_current_farmer', JSON.stringify(target));
      localStorage.setItem(TOKEN_KEY, `demo.${target.id}`);
      setFarmer(target);
    }
  };

  const updateProfile = async (updates: Partial<Farmer>) => {
    if (!farmer) return;
    const updated = await updateFarmerProfile(farmer.id, updates);
    setFarmer(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        farmer,
        // isAuthenticated requires both a farmer object AND a real JWT token.
        isAuthenticated: !!farmer && !!localStorage.getItem(TOKEN_KEY),
        isLoading,
        login,
        register,
        logout,
        switchDemoFarmer,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

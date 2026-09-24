import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farmer } from '../types';
import { getCurrentFarmer, loginFarmer, registerFarmer, logoutFarmer, updateFarmerProfile } from '../services/api';
import { DEMO_FARMERS } from '../data/mockData';

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
    password?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoFarmer: (farmerId: string) => void;
  updateProfile: (updates: Partial<Farmer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const current = getCurrentFarmer();
    setFarmer(current || DEMO_FARMERS[0]);
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

  const switchDemoFarmer = (farmerId: string) => {
    const target = DEMO_FARMERS.find((f) => f.id === farmerId) || DEMO_FARMERS[0];
    localStorage.setItem('kq_current_farmer', JSON.stringify(target));
    setFarmer(target);
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
        isAuthenticated: !!farmer,
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

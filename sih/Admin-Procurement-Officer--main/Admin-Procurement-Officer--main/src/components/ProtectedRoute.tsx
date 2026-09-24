import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  role: 'ADMIN' | 'OFFICER' | 'admin' | 'officer';
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<Props> = ({ role, children }) => {
  const { user, isLoading, loading } = useAuth();

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-600 text-sm font-sans">
        <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-5 h-5 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-slate-800">Authenticating Session...</span>
        </div>
      </div>
    );
  }

  const requiredRole = (role || '').toLowerCase();

  if (!user) {
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/officer/login'} replace />;
  }

  const userRole = (user.role || '').toLowerCase();

  if (userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/officer'} replace />;
  }

  return children;
};

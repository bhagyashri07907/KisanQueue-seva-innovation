import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BookingFlowProvider } from './hooks/useBookingFlow';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTranslation } from 'react-i18next';

// Pages - Lazy loaded
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = React.lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const SelectLocation = React.lazy(() => import('./pages/SelectLocation').then(module => ({ default: module.SelectLocation })));
const SelectCrop = React.lazy(() => import('./pages/SelectCrop').then(module => ({ default: module.SelectCrop })));
const SelectCenter = React.lazy(() => import('./pages/SelectCenter').then(module => ({ default: module.SelectCenter })));
const AvailableSlots = React.lazy(() => import('./pages/AvailableSlots').then(module => ({ default: module.AvailableSlots })));
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation').then(module => ({ default: module.BookingConfirmation })));
const DigitalTokenView = React.lazy(() => import('./pages/DigitalTokenView').then(module => ({ default: module.DigitalTokenView })));
const MyBookings = React.lazy(() => import('./pages/MyBookings').then(module => ({ default: module.MyBookings })));
const ProcurementStatusView = React.lazy(() => import('./pages/ProcurementStatusView').then(module => ({ default: module.ProcurementStatusView })));
const PaymentStatusView = React.lazy(() => import('./pages/PaymentStatusView').then(module => ({ default: module.PaymentStatusView })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Notifications = React.lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));

// Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root index redirect based on auth
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BookingFlowProvider>
            <BrowserRouter>
              <React.Suspense fallback={<LoadingFallback />}>
                <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={<RootRedirect />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/select-location"
              element={
                <ProtectedRoute>
                  <SelectLocation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/select-crop"
              element={
                <ProtectedRoute>
                  <SelectCrop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/select-center"
              element={
                <ProtectedRoute>
                  <SelectCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/slots"
              element={
                <ProtectedRoute>
                  <AvailableSlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-confirmation"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/token"
              element={
                <ProtectedRoute>
                  <DigitalTokenView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/token/:id"
              element={
                <ProtectedRoute>
                  <DigitalTokenView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement-status"
              element={
                <ProtectedRoute>
                  <ProcurementStatusView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement-status/:id"
              element={
                <ProtectedRoute>
                  <ProcurementStatusView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-status"
              element={
                <ProtectedRoute>
                  <PaymentStatusView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-status/:id"
              element={
                <ProtectedRoute>
                  <PaymentStatusView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </BookingFlowProvider>
    </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

const LoadingFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">{t('loading')}</p>
    </div>
  );
};

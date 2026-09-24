import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Portals & Login
import { PortalSelect } from './pages/PortalSelect';
import { AdminLogin } from './pages/AdminLogin';
import { OfficerLogin } from './pages/OfficerLogin';

// Admin Pages
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCenters } from './pages/admin/AdminCenters';
import { AdminSlots } from './pages/admin/AdminSlots';
import { AdminCapacity } from './pages/admin/AdminCapacity';
import { AdminOfficers } from './pages/admin/AdminOfficers';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminProcurement } from './pages/admin/AdminProcurement';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminProfile } from './pages/admin/AdminProfile';

// Officer Pages
import { OfficerLayout } from './layouts/OfficerLayout';
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { OfficerCenter } from './pages/officer/OfficerCenter';
import { OfficerBookings } from './pages/officer/OfficerBookings';
import { OfficerVerifyToken } from './pages/officer/OfficerVerifyToken';
import { OfficerProcurement } from './pages/officer/OfficerProcurement';
import { OfficerReceipts } from './pages/officer/OfficerReceipts';
import { OfficerPayments } from './pages/officer/OfficerPayments';
import { OfficerProfile } from './pages/officer/OfficerProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<PortalSelect />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/officer/login" element={<OfficerLogin />} />

          {/* Admin Protected Hierarchy */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="centers" element={<AdminCenters />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="capacity" element={<AdminCapacity />} />
            <Route path="officers" element={<AdminOfficers />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="procurement" element={<AdminProcurement />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Officer Protected Hierarchy */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute role="OFFICER">
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OfficerDashboard />} />
            <Route path="center" element={<OfficerCenter />} />
            <Route path="bookings" element={<OfficerBookings />} />
            <Route path="verify-token" element={<OfficerVerifyToken />} />
            <Route path="procurement" element={<OfficerProcurement />} />
            <Route path="receipts" element={<OfficerReceipts />} />
            <Route path="payments" element={<OfficerPayments />} />
            <Route path="profile" element={<OfficerProfile />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

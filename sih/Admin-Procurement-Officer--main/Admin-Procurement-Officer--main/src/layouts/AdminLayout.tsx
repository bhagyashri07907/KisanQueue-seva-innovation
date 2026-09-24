import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  ClipboardList,
  Scale,
  BarChart3,
  LogOut,
  Bell,
  Sliders,
  Shield,
  CheckCircle,
  Menu,
  X,
  Smartphone,
  UserCheck
} from 'lucide-react';
import { SyntheticDataBadge } from '../components/SyntheticDataBadge';
import { NotificationModal } from '../components/NotificationModal';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Intake Capacity Threshold', time: '10m ago', text: 'Baramati (PC001) reached 82% daily capacity.' },
    { id: 2, title: 'New Officer Assigned', time: '1h ago', text: 'OFF025 assigned to PC025 Niphad APMC center.' },
    { id: 3, title: 'MSP Price Scheduled Update', time: '3h ago', text: 'Soybean Kharif procurement batch active.' },
  ];

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/centers', label: 'Procurement Centers', icon: Building2 },
    { to: '/admin/slots', label: 'Slot Management', icon: CalendarDays },
    { to: '/admin/capacity', label: 'Intake Capacity', icon: Sliders },
    { to: '/admin/officers', label: 'Procurement Officers', icon: Users },
    { to: '/admin/bookings', label: 'All Bookings', icon: ClipboardList },
    { to: '/admin/procurement', label: 'Procurement Monitoring', icon: Scale },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/profile', label: 'Official Profile', icon: UserCheck },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-800 flex">
      {/* Desktop High Density Sidebar */}
      <aside className="w-64 bg-[#064E3B] flex flex-col shrink-0 hidden lg:flex justify-between border-r border-[#053e2f]">

          <div>
            <div className="p-6 flex items-center space-x-3 border-b border-white/10">
              <div className="w-10 h-10 bg-[#FFD700] rounded flex items-center justify-center font-bold text-[#064E3B] text-xl shrink-0 shadow-xs">
                K
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight">KisanQueue</span>
                <span className="text-[10px] text-emerald-200 font-semibold tracking-wider uppercase">Admin Portal</span>
              </div>
            </div>

            <nav className="flex-grow px-4 space-y-1 py-4 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
                Master Governance
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                        isActive
                          ? 'bg-white/15 text-white font-bold shadow-2xs ring-1 ring-white/20'
                          : 'text-emerald-100/70 hover:text-white hover:bg-white/8'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 opacity-85" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-bold">Current Session</div>
              <div className="flex items-center space-x-2 text-white">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-semibold">Admin Portal</span>
              </div>
              <div className="text-[10px] text-emerald-200/80 mt-1 font-mono">50 Active State Centers</div>
            </div>
            <button
              id="admin-sidebar-logout-btn"
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-rose-200 bg-rose-950/30 hover:bg-rose-900/50 rounded-md transition-colors border border-rose-800/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="w-64 bg-[#064E3B] text-white flex flex-col justify-between p-4 z-50">
              <div>
                <div className="p-3 flex items-center space-x-3 border-b border-white/10 mb-3">
                  <div className="w-9 h-9 bg-[#FFD700] rounded flex items-center justify-center font-bold text-[#064E3B] text-lg">
                    K
                  </div>
                  <span className="text-white font-bold text-lg tracking-tight">KisanQueue</span>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-bold text-rose-300 bg-white/5 border border-rose-400/20 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Area with High Density Canvas Background */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          {/* High Density Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-lg font-bold text-slate-800">System Overview</h1>
              <SyntheticDataBadge />
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* SMS & FCM Push Notification Monitor Button */}
              <button
                id="admin-sms-fcm-btn"
                onClick={() => setShowNotificationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-[#064E3B] hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                title="View SMS & FCM Alerts Sent to Farmers"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SMS &amp; FCM Gateway</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* Notifications Menu */}
              <div className="relative">
                <button
                  id="admin-notifications-btn"
                  onClick={() => setShowNotificationModal(true)}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
                  title="SMS & Push Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                </button>
              </div>

              {/* Admin Profile & Avatar - Interactive link to Profile */}
              <NavLink
                to="/admin/profile"
                id="admin-header-profile-btn"
                className="flex items-center space-x-3 pl-3 border-l border-slate-200 hover:opacity-90 transition-opacity cursor-pointer group"
                title="View Official Profile & Cadre Information"
              >
                <div className="flex flex-col items-end hidden sm:flex text-right">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-[#064E3B] transition-colors">
                    {user?.name || 'Dr. Vikramaditya Salve'}
                  </span>
                  <span className="text-[10px] text-emerald-800 uppercase font-extrabold tracking-tighter">
                    HQ Director &bull; Profile
                  </span>
                </div>
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-300 shrink-0 group-hover:ring-2 group-hover:ring-[#064E3B] transition-all">
                  <span className="text-[#064E3B] font-black text-xs">VS</span>
                </div>
              </NavLink>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          {/* System Modals */}
          <NotificationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
          />
        </div>
    </div>
  );
};

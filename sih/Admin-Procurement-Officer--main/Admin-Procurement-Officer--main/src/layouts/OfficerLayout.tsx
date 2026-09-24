import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  KeyRound,
  Scale,
  ReceiptText,
  CreditCard,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  MapPin,
  Smartphone,
  Bell,
  UserCheck
} from 'lucide-react';
import { SyntheticDataBadge } from '../components/SyntheticDataBadge';
import { NotificationModal } from '../components/NotificationModal';

export const OfficerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const navItems = [
    { to: '/officer', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/officer/center', label: 'My Center', icon: Building2 },
    { to: '/officer/bookings', label: 'Farmer Bookings', icon: CalendarCheck },
    { to: '/officer/verify-token', label: 'Verify Token', icon: KeyRound },
    { to: '/officer/procurement', label: 'Procurement Process', icon: Scale },
    { to: '/officer/receipts', label: 'Receipts', icon: ReceiptText },
    { to: '/officer/payments', label: 'Payment Status', icon: CreditCard },
    { to: '/officer/profile', label: 'Officer Profile', icon: UserCheck },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-800 flex">
      {/* Officer Desktop High Density Sidebar */}
      <aside className="w-64 bg-[#064E3B] flex flex-col shrink-0 hidden lg:flex justify-between border-r border-[#053e2f]">
        <div>
          <div className="p-6 flex items-center space-x-3 border-b border-white/10">
            <div className="w-10 h-10 bg-[#FFD700] rounded flex items-center justify-center font-bold text-[#064E3B] text-xl shrink-0 shadow-xs">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-tight">KisanQueue</span>
              <span className="text-[10px] text-emerald-200 font-semibold tracking-wider uppercase">Field Officer Portal</span>
            </div>
          </div>

          <nav className="flex-grow px-4 space-y-1 py-4 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60 flex items-center justify-between">
              <span>Center Operations</span>
              <span className="font-mono text-[9px] bg-white/10 text-emerald-200 px-1.5 py-0.5 rounded">
                {user?.id || 'OFF001'}
              </span>
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
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-bold">Assigned Center</div>
            <div className="flex items-center space-x-2 text-white">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-semibold truncate max-w-[170px]">
                {user?.assigned_center_name || 'PC001 - Baramati'}
              </span>
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-1 font-mono">Master Data: Read-Only</div>
          </div>
          <button
            id="officer-sidebar-logout-btn"
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
            <div>
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Center Operations</span>
                <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                  {user?.assigned_center_name || 'PC001 - Baramati'}
                </span>
              </h1>
            </div>
            <SyntheticDataBadge />
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* SMS & FCM Push Notification Monitor Button */}
            <button
              id="officer-sms-fcm-btn"
              onClick={() => setShowNotificationModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-[#064E3B] hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
              title="View SMS Alerts Sent to Farmers for Tokens & Weighing"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Farmer Alerts</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Officer Profile & Avatar - Clickable */}
            <NavLink
              to="/officer/profile"
              id="officer-profile-circle-btn"
              className={({ isActive }) =>
                `flex items-center space-x-3 pl-3 border-l border-slate-200 transition-all cursor-pointer group ${
                  isActive ? 'opacity-100' : 'hover:opacity-90'
                }`
              }
              title="Click to view Officer Profile & change password"
            >
              <div className="flex flex-col items-end hidden sm:flex text-right">
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#064E3B] transition-colors">
                  {user?.name || 'Pandurang Jadhav'}
                </span>
                <span className="text-[10px] text-emerald-800 uppercase font-extrabold tracking-tighter">
                  {user?.id || 'OFF001'} &bull; View Profile
                </span>
              </div>
              <div className="w-9 h-9 bg-amber-400 text-[#064E3B] rounded-full flex items-center justify-center border-2 border-amber-300 shrink-0 font-black text-xs shadow-2xs group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#064E3B]/40 transition-all">
                PO
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, CalendarCheck, Ticket, Activity, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', label: t('navHome'), icon: Home, id: 'nav-item-home' },
    { to: '/bookings', label: t('navBookings'), icon: CalendarCheck, id: 'nav-item-bookings' },
    { to: '/token', label: t('navToken'), icon: Ticket, id: 'nav-item-token' },
    { to: '/procurement-status', label: t('navStatus'), icon: Activity, id: 'nav-item-status' },
    { to: '/profile', label: t('navProfile'), icon: User, id: 'nav-item-profile' },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg max-w-lg mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              id={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-colors relative ${
                  isActive
                    ? 'text-emerald-800 font-bold'
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive ? 'bg-emerald-50 text-emerald-800' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className="text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-[62px] font-bold">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute top-0 w-8 h-1 bg-emerald-700 rounded-b-sm" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

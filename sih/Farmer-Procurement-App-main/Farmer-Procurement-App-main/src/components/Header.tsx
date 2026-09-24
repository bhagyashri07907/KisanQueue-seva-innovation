import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Sprout, ShieldCheck } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { getNotifications } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  showBack?: boolean;
  backTitle?: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showBack, backTitle, onBack }) => {
  const { t } = useTranslation();
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (farmer) {
      getNotifications(farmer.id).then((notifs) => {
        setUnreadCount(notifs.filter((n) => !n.read).length);
      });
    }
  }, [farmer]);

  return (
    <header id="app-header" className="bg-emerald-700 text-white shadow-md sticky top-0 z-40 shrink-0">
      {/* Top micro bar for Department & Demo Data badge */}
      <div className="bg-emerald-800/90 px-4 py-1 flex items-center justify-between text-[11px] font-semibold text-emerald-100 border-b border-emerald-600/40">
        <div className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="truncate uppercase tracking-wider text-[10px] font-bold">Govt. of India • MSP Procurement</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-amber-400 text-emerald-950 font-black text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase">
            DEMO
          </span>
          <LanguageSelector compact />
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              id="header-back-button"
              onClick={onBack || (() => navigate(-1))}
              className="flex items-center gap-2 text-white p-1.5 -ml-1.5 rounded-xl hover:bg-emerald-800/60 active:bg-emerald-900 transition"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {backTitle && <span className="text-base font-bold tracking-tight truncate max-w-[170px]">{backTitle}</span>}
            </button>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 transition-transform group-active:scale-95">
                <div className="w-5 h-5 border-b-4 border-r-4 border-emerald-700 transform rotate-45 mb-0.5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-none text-white">
                  KisanQueue
                </h1>
                <p className="text-[10px] text-emerald-200 font-semibold tracking-wider uppercase mt-1">
                  शेतकरी स्लॉट पोर्टल
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Right Action Icons & User Badge */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/notifications"
            id="nav-notifications-btn"
            className="relative p-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white transition active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </Link>

          {farmer && (
            <Link
              to="/profile"
              id="header-profile-btn"
              className="flex items-center gap-2 pl-2 border-l border-emerald-600/60"
              title={farmer.fullName}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {farmer.fullName.charAt(0)}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

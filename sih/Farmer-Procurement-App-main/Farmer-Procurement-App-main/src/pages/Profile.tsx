import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Phone,
  IdCard,
  MapPin,
  Globe,
  LogOut,
  ShieldCheck,
  Building,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../hooks/useAuth';
import { DEMO_FARMERS } from '../data/mockData';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer, logout, switchDemoFarmer } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title */}
        <div className="flex justify-between items-start pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              {t('profileTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('profileSubtitle')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
              {farmer?.fullName?.charAt(0) || 'F'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                {farmer?.fullName}
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block mt-1">
                {farmer?.farmerId}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t('mobileNumber')}
              </span>
              <span className="font-bold text-slate-800 text-sm">{farmer?.mobileNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5 text-slate-400" />
                {t('farmerId')}
              </span>
              <span className="font-bold text-slate-800 text-sm">{farmer?.farmerId}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {t('village')}
              </span>
              <span className="font-bold text-slate-800 text-sm">{farmer?.village}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {t('taluka')}
              </span>
              <span className="font-bold text-slate-800 text-sm">{farmer?.taluka}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                {t('district')}
              </span>
              <span className="font-bold text-slate-800 text-sm">{farmer?.district}</span>
            </div>
          </div>
        </div>

        {/* Language Preference Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>{t('languagePref')}</span>
          </div>
          <LanguageSelector />
        </div>

        {/* Demo Switch Farmer Selector (Prototype testing helper) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-900 uppercase tracking-widest">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Switch Demo Farmer (Prototype)</span>
          </div>
          <p className="text-xs text-amber-800/80">
            Select any registered farmer to test different crops, districts, and booking records:
          </p>
          <select
            value={farmer?.id}
            onChange={(e) => switchDemoFarmer(e.target.value)}
            className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            {DEMO_FARMERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fullName} ({f.taluka}, {f.district})
              </option>
            ))}
          </select>
        </div>

        {/* Logout Button */}
        <button
          id="profile-logout-btn"
          type="button"
          onClick={handleLogout}
          className="w-full py-4 px-4 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 font-bold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logoutBtn')}</span>
        </button>
      </div>
    </MobileLayout>
  );
};

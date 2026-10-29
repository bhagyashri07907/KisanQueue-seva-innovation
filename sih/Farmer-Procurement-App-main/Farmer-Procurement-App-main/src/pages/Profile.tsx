import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizePersonName } from '../i18n/personName';
import {
  User,
  Phone,
  Mail,
  IdCard,
  MapPin,
  Globe,
  LogOut,
  ShieldCheck,
  Building,
  Users,
  CheckCircle2,
  Edit2,
  Save,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../hooks/useAuth';
import { DEMO_FARMERS } from '../data/mockData';

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { farmer, logout, switchDemoFarmer, updateProfile } = useAuth();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(farmer?.email || '');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const displayFarmerName = localizePersonName(farmer?.fullName, i18n.resolvedLanguage || i18n.language);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveEmail = async () => {
    const trimmed = emailInput.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailMsg({ type: 'error', text: t('emailFormatError') });
      return;
    }

    setEmailSaving(true);
    setEmailMsg(null);
    try {
      await updateProfile({ email: trimmed });
      setEmailMsg({ type: 'success', text: t('emailUpdated') });
      setIsEditingEmail(false);
    } catch {
      setEmailMsg({ type: 'error', text: t('emailUpdateFailed') });
    } finally {
      setEmailSaving(false);
    }
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
              {displayFarmerName.charAt(0) || 'F'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                {displayFarmerName}
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

            {/* Email Address with Edit option */}
            <div className="py-1 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {t('emailAddress')}
                </span>
                {!isEditingEmail && (
                  <button
                    onClick={() => {
                      setEmailInput(farmer?.email || '');
                      setIsEditingEmail(true);
                      setEmailMsg(null);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{farmer?.email ? t('edit') : t('addEmail')}</span>
                  </button>
                )}
              </div>

              {isEditingEmail ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      id="profile-email-input"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                    <button
                      onClick={handleSaveEmail}
                      disabled={emailSaving}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {emailSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{t('save')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEmailMsg(null);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {t('bookingEmailNotice')}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${farmer?.email ? 'text-slate-800 font-mono' : 'text-slate-400 italic font-normal text-xs'}`}>
                    {farmer?.email || t('emailNotProvided')}
                  </span>
                </div>
              )}

              {emailMsg && (
                <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${emailMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {emailMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{emailMsg.text}</span>
                </div>
              )}
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
            <span>{t('switchDemoFarmer')}</span>
          </div>
          <p className="text-xs text-amber-800/80">
            {t('demoFarmerHelp')}
          </p>
          <select
            value={farmer?.id}
            onChange={(e) => switchDemoFarmer(e.target.value)}
            className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            {DEMO_FARMERS.map((f) => (
              <option key={f.id} value={f.id}>
                {localizePersonName(f.fullName, i18n.resolvedLanguage || i18n.language)} &bull; {f.district} ({f.farmerId})
              </option>
            ))}
          </select>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white border border-red-200 hover:bg-red-50 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </MobileLayout>
  );
};

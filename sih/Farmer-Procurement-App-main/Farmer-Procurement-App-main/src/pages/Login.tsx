import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, UserCheck, Lock, ArrowRight, AlertCircle, Users, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DEMO_FARMERS } from '../data/mockData';
import { LanguageSelector } from '../components/LanguageSelector';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, switchDemoFarmer } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('MH-PUN-2026-0814');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your Farmer ID or Mobile Number');
      return;
    }

    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      navigate('/select-location');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = (farmerId: string) => {
    switchDemoFarmer(farmerId);
    navigate('/select-location');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-emerald-700 text-white p-8 text-center relative">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-700 shadow-md">
              <Sprout className="w-8 h-8 text-emerald-700" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Kisan<span className="text-yellow-300">Queue</span>
          </h1>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            {t('appSubtitle')}
          </p>

          <div className="mt-4 flex justify-center">
            <LanguageSelector compact />
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Farmer Authentication</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Farmer Portal Login</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your official Farmer ID and credentials to access district procurement centers and book slots.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Farmer ID / Kisan Card Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="login-identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. MH-PUN-2026-0814 or Mobile"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                You can also enter your 10-digit registered mobile number.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('passwordLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? t('loading') : 'Login & Select Location'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Demo Farmers with IDs & Districts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Quick Test: Select Registered Farmer
            </span>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_FARMERS.slice(0, 3).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setIdentifier(f.farmerId);
                    handleQuickLogin(f.id);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{f.fullName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">ID: {f.farmerId}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <MapPin className="w-2.5 h-2.5" />
                      {f.district}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-1">
            <Link
              to="/register"
              id="goto-register-link"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
            >
              {t('registerLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

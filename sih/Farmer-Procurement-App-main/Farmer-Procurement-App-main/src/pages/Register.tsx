import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, User, Phone, IdCard, MapPin, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from '../components/LanguageSelector';
import { getRegistrationDistricts, ProcurementDistrict } from '../services/api';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [village, setVillage] = useState('');
  const [taluka, setTaluka] = useState('Baramati');
  const [district, setDistrict] = useState('Pune');
  const [procurementDistricts, setProcurementDistricts] = useState<ProcurementDistrict[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRegistrationDistricts().then((items) => {
      setProcurementDistricts(items);
      if (items.length && !items.some((item) => item.name === district)) {
        setDistrict(items[0].name);
        setTaluka(items[0].talukas[0] || '');
      }
    });
  }, []);

  const selectedProcurementDistrict = procurementDistricts.find((item) => item.name === district);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!fullName.trim() || !mobileNumber.trim() || !farmerId.trim() || !village.trim()) {
      setError(t('fillRequiredFields'));
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setError(t('validMobile'));
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('validEmail'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordMinimum'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    const result = await register({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.trim() || undefined,
      farmerId: farmerId.trim(),
      village: village.trim(),
      taluka,
      district,
      password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || t('registrationFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Banner */}
        <div className="bg-emerald-700 text-white p-8 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-700 shadow-sm">
              <Sprout className="w-8 h-8 text-emerald-700" />
            </div>
          </div>
          <h1 className="text-xl font-black text-white">{t('registerTitle')}</h1>
          <p className="text-xs text-emerald-100 mt-1">{t('registerSubtitle')}</p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector compact />
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('fullNameLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-fullname-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('mobileNumber')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-mobile-input"
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Email Address (Optional for confirmations) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>{t('emailAddress')} <span className="text-slate-400 font-normal lowercase">{t('optionalSlotConfirmations')}</span></span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Farmer ID */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('farmerId')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-farmerid-input"
                  type="text"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  placeholder={t('farmerIdExample')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Village */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('village')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-village-input"
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={t('villageExample')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Taluka & District Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('taluka')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-taluka-select"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition"
                >
                  {selectedProcurementDistrict?.talukas.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t('district')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-district-select"
                  value={district}
                  onChange={(e) => {
                    const d = procurementDistricts.find((item) => item.name === e.target.value);
                    if (d) {
                      setDistrict(d.name);
                      setTaluka(d.talukas[0] || '');
                    }
                  }}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition"
                >
                  {procurementDistricts.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('passwordLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('minimumPassword')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {t('confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="reg-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('reenterPassword')}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <button
              id="reg-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-700/20 transition active:scale-[0.99] mt-2"
            >
              {loading ? t('loading') : t('createAccountBtn')}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <Link
              to="/login"
              id="reg-goto-login-link"
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
